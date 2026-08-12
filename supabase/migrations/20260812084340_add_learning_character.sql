create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Ученик' check (char_length(display_name) between 1 and 30),
  character_name text not null default 'Искра' check (char_length(character_name) between 1 and 30),
  xp integer not null default 0 check (xp >= 0),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "read own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "update own profile" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.quiz_completions (
  user_id uuid not null references auth.users (id) on delete cascade,
  day_number integer not null check (day_number between 1 and 366),
  score integer not null check (score >= 0),
  completed_at timestamptz not null default now(),
  primary key (user_id, day_number)
);

alter table public.quiz_completions enable row level security;
create policy "read own quiz completions" on public.quiz_completions for select using (auth.uid() = user_id);
create policy "insert own quiz completions" on public.quiz_completions for insert with check (auth.uid() = user_id);

create or replace function public.award_quiz_xp(p_day_number integer, p_score integer)
returns public.profiles
language plpgsql
security invoker
set search_path = public
as $$
declare
  inserted_count integer;
  result public.profiles;
begin
  if coalesce((auth.jwt()->>'is_anonymous')::boolean, true) then
    raise exception 'Create an account to earn character XP';
  end if;

  insert into public.profiles (user_id) values (auth.uid()) on conflict (user_id) do nothing;
  insert into public.quiz_completions (user_id, day_number, score)
    values (auth.uid(), p_day_number, greatest(0, p_score))
    on conflict (user_id, day_number) do nothing;
  get diagnostics inserted_count = row_count;

  if inserted_count > 0 then
    update public.profiles set xp = xp + greatest(10, p_score) where user_id = auth.uid();
  end if;

  select * into result from public.profiles where user_id = auth.uid();
  return result;
end;
$$;
