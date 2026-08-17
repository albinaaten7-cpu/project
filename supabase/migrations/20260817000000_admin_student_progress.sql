-- Администратор может только просматривать учебный прогресс. Изменять чужие строки нельзя.
create policy "admin reads student profiles" on public.profiles for select
  using ((auth.jwt() ->> 'email') = 'admin.accountenter@gmail.com');

create policy "admin reads quiz attempts" on public.quiz_attempts for select
  using ((auth.jwt() ->> 'email') = 'admin.accountenter@gmail.com');

create policy "admin reads quiz completions" on public.quiz_completions for select
  using ((auth.jwt() ->> 'email') = 'admin.accountenter@gmail.com');
