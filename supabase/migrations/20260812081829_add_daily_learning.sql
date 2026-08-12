alter table public.study_settings
  add column daily_minutes integer not null default 60 check (daily_minutes between 10 and 1440),
  add column study_days_per_week smallint not null default 5 check (study_days_per_week between 1 and 7);

create table public.daily_lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day_number integer not null check (day_number between 1 and 366),
  content jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, day_number)
);

alter table public.daily_lessons enable row level security;
create policy "read own daily lessons" on public.daily_lessons for select using (auth.uid() = user_id);
create policy "insert own daily lessons" on public.daily_lessons for insert with check (auth.uid() = user_id);
create policy "update own daily lessons" on public.daily_lessons for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own daily lessons" on public.daily_lessons for delete using (auth.uid() = user_id);
