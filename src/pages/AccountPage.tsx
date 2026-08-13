import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Link } from 'wouter';
import { ProgressCard } from '../components/ProgressCard';
import { ProfileEditor } from '../components/ProfileEditor';
import { createProfile, loadProfile, updateProfile, type Profile } from '../lib/profile';
import { supabase } from '../lib/supabase';
import { HistoryLink } from '../components/HistoryLink';
import { LearningStats } from '../components/LearningStats';
import { loadLearningStats, type LearningStats as Stats } from '../lib/quizProgress';
import { loadStudyData } from '../lib/studyData';

export function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const current = await supabase.auth.getUser();
      const nextUser = current.data.user ?? (await supabase.auth.signInAnonymously()).data.user;
      setUser(nextUser);
      if (nextUser && !nextUser.is_anonymous) {
        const savedProfile = await loadProfile();
        const metadataName = nextUser.user_metadata.display_name;
        setProfile(savedProfile ?? await createProfile(typeof metadataName === 'string' ? metadataName : 'Ученик'));
        const studyData = await loadStudyData();
        setStats(await loadLearningStats(studyData.dailyMinutes));
      }
    }
    void load();
  }, []);

  async function saveProgress(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const { error } = await supabase.auth.updateUser({ email: email.trim(), data: { display_name: name.trim() } }, { emailRedirectTo: `${window.location.origin}/account` });
      if (error) throw error;
      setMessage('Письмо отправлено. Открой его на этом устройстве, чтобы сохранить текущий прогресс.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Не удалось отправить письмо.'); }
    finally { setBusy(false); }
  }

  async function signIn(event: React.FormEvent) {
    event.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/account` } });
    setMessage(error ? error.message : 'Ссылка для входа отправлена на email.'); setBusy(false);
  }

  async function signInWithGoogle() {
    setBusy(true); setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/account` },
    });
    if (error) {
      setMessage(error.message.includes('provider is not enabled') ? 'Вход через Google ещё не подключён в Supabase.' : error.message);
      setBusy(false);
    }
  }

  async function saveProfile(displayName: string, nickname: string) {
    setBusy(true); setMessage('');
    try {
      const updated = await updateProfile(displayName, nickname);
      setProfile(updated); setMessage('Профиль обновлён ✓');
      return true;
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Не удалось обновить профиль.'); return false; }
    finally { setBusy(false); }
  }

  if (!user) return <main className="centered">Загружаю профиль…</main>;
  const anonymous = user.is_anonymous;
  return (
    <main className="account-page">
      <header className="practice-header"><Link href="/">← На главную</Link><div className="top-actions"><HistoryLink /><div className="brand"><span>◎</span> Вектор</div></div></header>
      {anonymous ? <><section className="account-hero"><span>Твой аккаунт</span><h1>Войди или зарегистрируйся</h1><p>Регистрация добровольная. Она сохранит предметы, уроки и результаты квизов на других устройствах.</p></section><button className="google-auth-button" onClick={signInWithGoogle} disabled={busy}><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.37l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.13H3.06v2.62A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.92A6 6 0 0 1 6.1 12c0-.67.11-1.32.3-1.92V7.46H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.54l3.34-2.62Z"/><path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.94 5.46l3.34 2.62c.79-2.37 3-4.13 5.6-4.13Z"/></svg>{busy ? 'Открываю Google…' : 'Войти через Google'}</button><div className="auth-divider"><span>или через email</span></div><div className="account-grid"><form className="account-form" onSubmit={saveProgress}><h2>Регистрация</h2><label>Как тебя называть<input value={name} onChange={(event) => setName(event.target.value)} maxLength={30} required /></label><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><button disabled={busy}>{busy ? 'Отправляю…' : 'Зарегистрироваться'}</button></form><form className="account-form account-form--quiet" onSubmit={signIn}><h2>Уже есть аккаунт?</h2><p>При входе откроется прогресс существующего аккаунта.</p><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><button className="ghost" disabled={busy}>Отправить ссылку для входа</button></form></div></> : profile ? <><section className="account-hero"><span>Профиль ученика</span><h1>Привет, {profile.display_name}!</h1><p>{user.email} · прогресс синхронизируется между устройствами</p></section><div className="profile-grid"><ProfileEditor profile={profile} busy={busy} onSave={saveProfile} /><ProgressCard profile={profile} /></div>{stats && <LearningStats stats={stats} />}</> : <main className="centered">Создаю профиль…</main>}
      {message && <p className="account-message">{message}</p>}
    </main>
  );
}
