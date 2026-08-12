create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  current_grade smallint not null check (current_grade between 2 and 5),
  target_grade smallint not null check (target_grade between current_grade and 5),
  exam_date date not null,
  created_at timestamptz not null default now()
);

alter table public.subjects enable row level security;

create policy "read own subjects" on public.subjects for select
  using (auth.uid() = user_id);
create policy "insert own subjects" on public.subjects for insert
  with check (auth.uid() = user_id);
create policy "delete own subjects" on public.subjects for delete
  using (auth.uid() = user_id);

create table public.study_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  weekly_minutes integer not null default 420 check (weekly_minutes between 30 and 10080),
  updated_at timestamptz not null default now()
);

alter table public.study_settings enable row level security;

create policy "read own study settings" on public.study_settings for select
  using (auth.uid() = user_id);
create policy "insert own study settings" on public.study_settings for insert
  with check (auth.uid() = user_id);
create policy "update own study settings" on public.study_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
