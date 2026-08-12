import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Link } from 'wouter';
import { CharacterCard } from '../components/CharacterCard';
import { createProfile, loadProfile, type Profile } from '../lib/profile';
import { supabase } from '../lib/supabase';
import { HistoryLink } from '../components/HistoryLink';

export function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [characterName, setCharacterName] = useState('Искра');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user && !data.user.is_anonymous) setProfile(await loadProfile());
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

  async function finishProfile(event: React.FormEvent) {
    event.preventDefault(); setBusy(true);
    try { setProfile(await createProfile(name.trim() || 'Ученик', characterName.trim())); setMessage('Герой создан! 🎉'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не удалось создать героя.'); }
    finally { setBusy(false); }
  }

  async function signIn(event: React.FormEvent) {
    event.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/account` } });
    setMessage(error ? error.message : 'Ссылка для входа отправлена на email.'); setBusy(false);
  }

  if (!user) return <main className="centered">Загружаю профиль…</main>;
  const anonymous = user.is_anonymous;
  return (
    <main className="account-page">
      <header className="practice-header"><Link href="/">← На главную</Link><div className="top-actions"><HistoryLink /><div className="brand"><span>◎</span> Фокус</div></div></header>
      {anonymous ? <><section className="account-hero"><span>Сохрани приключение</span><h1>Получи героя и не теряй прогресс</h1><p>Регистрация добровольная. Все предметы, уроки и квизы останутся на месте.</p></section><div className="account-grid"><form className="account-form" onSubmit={saveProgress}><h2>Сохранить текущий прогресс</h2><label>Как тебя называть<input value={name} onChange={(event) => setName(event.target.value)} maxLength={30} required /></label><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><button disabled={busy}>{busy ? 'Отправляю…' : 'Получить героя'}</button></form><form className="account-form account-form--quiet" onSubmit={signIn}><h2>Уже есть аккаунт?</h2><p>При входе откроется прогресс существующего аккаунта.</p><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><button className="ghost" disabled={busy}>Отправить ссылку для входа</button></form></div></> : profile ? <><section className="account-hero"><span>Профиль ученика</span><h1>Привет, {profile.display_name}!</h1><p>{user.email} · прогресс синхронизируется между устройствами</p></section><CharacterCard profile={profile} /></> : <form className="account-form character-setup" onSubmit={finishProfile}><span className="big-fox">🦊</span><h1>Назови своего героя</h1><p>Он будет расти за каждый новый пройденный дневной квиз.</p><label>Твоё имя<input value={name} onChange={(event) => setName(event.target.value)} maxLength={30} required /></label><label>Имя героя<input value={characterName} onChange={(event) => setCharacterName(event.target.value)} maxLength={30} required /></label><button disabled={busy}>Создать героя</button></form>}
      {message && <p className="account-message">{message}</p>}
    </main>
  );
}
