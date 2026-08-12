alter table public.study_settings
  add column school_grade smallint not null default 7 check (school_grade between 1 and 11),
  add column school_quarter smallint not null default 1 check (school_quarter between 1 and 4);
