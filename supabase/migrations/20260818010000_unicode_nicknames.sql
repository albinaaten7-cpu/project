alter table public.profiles drop constraint if exists profiles_nickname_format;
alter table public.profiles add constraint profiles_nickname_format
  check (nickname ~ '^[[:alnum:]_]{3,24}$');
