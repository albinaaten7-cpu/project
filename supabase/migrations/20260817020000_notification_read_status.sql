alter table public.support_messages add column read_at timestamptz;
alter table public.feedback add column reply_read_at timestamptz;

create or replace function public.mark_support_message_read(p_message_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.support_messages
  set read_at = coalesce(read_at, now())
  where id = p_message_id and user_id = auth.uid();
$$;

create or replace function public.mark_feedback_reply_read(p_feedback_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.feedback
  set reply_read_at = coalesce(reply_read_at, now())
  where id = p_feedback_id and user_id = auth.uid() and admin_reply is not null;
$$;

revoke all on function public.mark_support_message_read(uuid) from public;
revoke all on function public.mark_feedback_reply_read(uuid) from public;
grant execute on function public.mark_support_message_read(uuid) to authenticated;
grant execute on function public.mark_feedback_reply_read(uuid) to authenticated;
