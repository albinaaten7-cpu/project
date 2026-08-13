create table public.quiz_sessions (
  user_id uuid not null references auth.users (id) on delete cascade,
  day_number integer not null check (day_number between 1 and 366),
  current_index smallint not null default 0 check (current_index between 0 and 100),
  score integer not null default 0 check (score >= 0),
  streak smallint not null default 0 check (streak >= 0),
  mistakes jsonb not null default '[]'::jsonb,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, day_number)
);

alter table public.quiz_sessions enable row level security;
create policy "read own quiz sessions" on public.quiz_sessions for select using (auth.uid() = user_id);
create policy "insert own quiz sessions" on public.quiz_sessions for insert with check (auth.uid() = user_id);
create policy "update own quiz sessions" on public.quiz_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own quiz sessions" on public.quiz_sessions for delete using (auth.uid() = user_id);

create table public.quiz_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day_number integer not null check (day_number between 1 and 366),
  question_index smallint not null check (question_index between 0 and 100),
  subject text not null check (char_length(subject) between 1 and 60),
  topic text not null check (char_length(topic) between 1 and 200),
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  unique (user_id, day_number, question_index)
);

alter table public.quiz_attempts enable row level security;
create policy "read own quiz attempts" on public.quiz_attempts for select using (auth.uid() = user_id);
create policy "insert own quiz attempts" on public.quiz_attempts for insert with check (auth.uid() = user_id);
create policy "update own quiz attempts" on public.quiz_attempts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "update own subjects" on public.subjects for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
