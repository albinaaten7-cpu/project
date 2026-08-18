import { useState } from 'react';

export type RegistrationData = { name: string; nickname: string; email: string; password: string };

export function RegistrationForm({ busy, onSubmit }: { busy: boolean; onSubmit: (data: RegistrationData) => Promise<void> }) {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  function submit(event: React.FormEvent) { event.preventDefault(); void onSubmit({ name: name.trim(), nickname: nickname.trim(), email: email.trim(), password }); }
  return (
    <form className="account-form" onSubmit={submit}>
      <h2>Регистрация</h2>
      <label>Как тебя называть<input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={30} required /></label>
      <label>Никнейм<div className="nickname-input"><span>@</span><input value={nickname} onChange={(event) => setNickname(event.target.value.replace(/[^\p{L}\p{N}_]/gu, ''))} minLength={3} maxLength={24} placeholder="твой_ник" required /></div></label>
      <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
      <label>Пароль<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={6} required /></label>
      <button disabled={busy}>{busy ? 'Создаю аккаунт…' : 'Зарегистрироваться'}</button>
    </form>
  );
}
