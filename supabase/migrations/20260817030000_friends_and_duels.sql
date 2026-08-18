create table public.user_presence (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_seen_at timestamptz not null default now()
);
alter table public.user_presence enable row level security;
create policy "users insert own presence" on public.user_presence for insert with check (auth.uid() = user_id);
create policy "users update own presence" on public.user_presence for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users (id) on delete cascade,
  addressee_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> addressee_id)
);
create unique index friendships_unique_pair on public.friendships
  (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
alter table public.friendships enable row level security;
create policy "participants read friendships" on public.friendships for select using (auth.uid() in (requester_id, addressee_id));
create policy "users send friend requests" on public.friendships for insert with check (auth.uid() = requester_id and status = 'pending');

create table public.duels (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid not null references auth.users (id) on delete cascade,
  opponent_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'active', 'declined', 'completed')),
  questions jsonb not null check (jsonb_array_length(questions) between 3 and 10),
  challenger_score integer check (challenger_score between 0 and 100),
  opponent_score integer check (opponent_score between 0 and 100),
  challenger_finished_at timestamptz,
  opponent_finished_at timestamptz,
  winner_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (challenger_id <> opponent_id)
);
alter table public.duels enable row level security;
create policy "participants read duels" on public.duels for select using (auth.uid() in (challenger_id, opponent_id));
create policy "challengers create duels" on public.duels for insert with check (auth.uid() = challenger_id and status = 'pending');

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
    and (coalesce(trim(p_query), '') = '' or profiles.display_name ilike '%' || trim(p_query) || '%' or profiles.nickname ilike '%' || trim(p_query) || '%')
  order by presence.last_seen_at desc nulls last, profiles.xp desc
  limit 50;
$$;

create or replace function public.respond_to_duel(p_duel_id uuid, p_accept boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.duels set status = case when p_accept then 'active' else 'declined' end, updated_at = now()
  where id = p_duel_id and opponent_id = auth.uid() and status = 'pending';
  if not found then raise exception 'Duel invitation not found'; end if;
end;
$$;

create or replace function public.respond_to_friend_request(p_friendship_id uuid, p_accept boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.friendships set status = case when p_accept then 'accepted' else 'declined' end, updated_at = now()
  where id = p_friendship_id and addressee_id = auth.uid() and status = 'pending';
  if not found then raise exception 'Friend request not found'; end if;
end;
$$;

create or replace function public.submit_duel_score(p_duel_id uuid, p_score integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_score < 0 or p_score > 100 then raise exception 'Invalid score'; end if;
  update public.duels set
    challenger_score = case when challenger_id = auth.uid() then p_score else challenger_score end,
    challenger_finished_at = case when challenger_id = auth.uid() then now() else challenger_finished_at end,
    opponent_score = case when opponent_id = auth.uid() then p_score else opponent_score end,
    opponent_finished_at = case when opponent_id = auth.uid() then now() else opponent_finished_at end,
    updated_at = now()
  where id = p_duel_id and auth.uid() in (challenger_id, opponent_id) and status = 'active'
    and ((challenger_id = auth.uid() and challenger_finished_at is null) or (opponent_id = auth.uid() and opponent_finished_at is null));
  if not found then raise exception 'Duel is unavailable or score already submitted'; end if;
  update public.duels set status = 'completed', winner_id = case when challenger_score > opponent_score then challenger_id when opponent_score > challenger_score then opponent_id else null end, updated_at = now()
  where id = p_duel_id and challenger_finished_at is not null and opponent_finished_at is not null;
end;
$$;

revoke all on function public.discover_users(text) from public;
revoke all on function public.respond_to_duel(uuid, boolean) from public;
revoke all on function public.respond_to_friend_request(uuid, boolean) from public;
revoke all on function public.submit_duel_score(uuid, integer) from public;
grant execute on function public.discover_users(text) to authenticated;
grant execute on function public.respond_to_duel(uuid, boolean) to authenticated;
grant execute on function public.respond_to_friend_request(uuid, boolean) to authenticated;
grant execute on function public.submit_duel_score(uuid, integer) to authenticated;
