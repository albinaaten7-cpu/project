create policy "delete own quiz attempts" on public.quiz_attempts for delete using (auth.uid() = user_id);
