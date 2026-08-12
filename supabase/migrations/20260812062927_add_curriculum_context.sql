alter table public.subjects
  add column topics text not null default '' check (char_length(topics) <= 500);

alter table public.study_settings
  add column country text not null default 'Казахстан' check (country in ('Казахстан', 'США')),
  add column region text not null default 'Русский язык обучения' check (char_length(region) between 1 and 80);
