create or replace function public.is_app_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'admin.accountenter@gmail.com';
$$;

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null check (category in ('problem', 'idea', 'question')),
  message text not null check (char_length(message) between 5 and 1000),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  admin_reply text check (admin_reply is null or char_length(admin_reply) between 2 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.feedback enable row level security;
create policy "students read own feedback" on public.feedback for select using (auth.uid() = user_id);
create policy "students create own feedback" on public.feedback for insert with check (auth.uid() = user_id);
create policy "admin reads feedback" on public.feedback for select using (public.is_app_admin());
create policy "admin updates feedback" on public.feedback for update
  using (public.is_app_admin()) with check (public.is_app_admin());

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  admin_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  message text not null check (char_length(message) between 2 and 1000),
  created_at timestamptz not null default now()
);

alter table public.support_messages enable row level security;
create policy "students read own support" on public.support_messages for select using (auth.uid() = user_id);
create policy "admin reads support" on public.support_messages for select using (public.is_app_admin());
create policy "admin sends support" on public.support_messages for insert
  with check (public.is_app_admin() and auth.uid() = admin_id);

create or replace function public.admin_list_registered_users()
returns table (
  user_id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language sql
security definer
set search_path = public, auth
as $$
  select users.id, users.email::text, users.created_at, users.last_sign_in_at
  from auth.users
  where public.is_app_admin()
    and coalesce(users.is_anonymous, false) = false
    and users.email is distinct from 'admin.accountenter@gmail.com'
  order by users.created_at desc;
$$;

revoke all on function public.admin_list_registered_users() from public;
grant execute on function public.admin_list_registered_users() to authenticated;
