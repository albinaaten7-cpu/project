alter table public.study_settings
  add column plan_days smallint not null default 20 check (plan_days between 1 and 120);
