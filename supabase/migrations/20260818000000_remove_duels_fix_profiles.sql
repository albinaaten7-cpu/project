drop function if exists public.respond_to_duel(uuid, boolean);
drop function if exists public.submit_duel_score(uuid, integer);
drop table if exists public.duels;

alter table public.profiles drop constraint if exists profiles_nickname_format;
alter table public.profiles add constraint profiles_nickname_format
  check (nickname ~ '^[A-Za-zА-Яа-яЁё0-9_]{3,24}$');
create unique index if not exists profiles_nickname_unique on public.profiles (lower(nickname));

create or replace function public.send_friend_request(p_addressee_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare existing_id uuid; existing_status text;
begin
  if p_addressee_id = auth.uid() then raise exception 'Нельзя добавить себя в друзья'; end if;
  select id, status into existing_id, existing_status from public.friendships
  where least(requester_id, addressee_id) = least(auth.uid(), p_addressee_id)
    and greatest(requester_id, addressee_id) = greatest(auth.uid(), p_addressee_id);
  if existing_id is null then
    insert into public.friendships (requester_id, addressee_id) values (auth.uid(), p_addressee_id);
  elsif existing_status = 'declined' then
    update public.friendships set requester_id = auth.uid(), addressee_id = p_addressee_id, status = 'pending', updated_at = now() where id = existing_id;
  else
    raise exception 'Запрос уже существует';
  end if;
end;
$$;

revoke all on function public.send_friend_request(uuid) from public;
grant execute on function public.send_friend_request(uuid) to authenticated;

update public.profiles as profiles
set display_name = left(users.raw_user_meta_data ->> 'display_name', 30)
from auth.users as users
where profiles.user_id = users.id
  and profiles.display_name = 'Ученик'
  and nullif(trim(users.raw_user_meta_data ->> 'display_name'), '') is not null;

create or replace function public.discover_users(p_query text default '')
returns table (user_id uuid, display_name text, nickname text, xp integer, last_seen_at timestamptz)
language sql
security definer
set search_path = public, auth
as $$
  select users.id, coalesce(profiles.display_name, 'Ученик'), coalesce(profiles.nickname, 'student_' || substr(users.id::text, 1, 8)), coalesce(profiles.xp, 0), presence.last_seen_at
  from auth.users as users
  left join public.profiles as profiles on profiles.user_id = users.id
  left join public.user_presence as presence on presence.user_id = users.id
  where auth.uid() is not null
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, true) = false
    and users.id <> auth.uid()
    and coalesce(users.is_anonymous, false) = false
    and users.email is distinct from 'admin.accountenter@gmail.com'
    and (
      coalesce(trim(p_query), '') = ''
      or coalesce(profiles.display_name, 'Ученик') ilike '%' || trim(leading '@' from trim(p_query)) || '%'
      or coalesce(profiles.nickname, '') ilike '%' || trim(leading '@' from trim(p_query)) || '%'
    )
  order by presence.last_seen_at desc nulls last, profiles.xp desc
  limit 50;
$$;
