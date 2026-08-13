alter table public.profiles add column nickname text;

update public.profiles
set nickname = 'student_' || substr(user_id::text, 1, 8);

alter table public.profiles
  alter column nickname set default 'student',
  alter column nickname set not null,
  add constraint profiles_nickname_format check (nickname ~ '^[A-Za-z0-9_]{3,24}$');
