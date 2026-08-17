import { useState } from 'react';

type AccountLoginFormProps = {
  busy: boolean;
  onSubmit: (identifier: string, password: string) => Promise<void>;
};

export function AccountLoginForm({ busy, onSubmit }: AccountLoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  function submit(event: React.FormEvent) {
    event.preventDefault();
    void onSubmit(identifier, password);
  }

  return (
    <form className="account-form account-form--quiet account-login-form" onSubmit={submit}>
      <div><h2>Уже есть аккаунт?</h2><p>Введи данные, которые использовал при создании аккаунта.</p></div>
      <label>
        Никнейм или email
        <input
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="ADMINENTER или name@example.com"
          autoComplete="username"
          required
        />
      </label>
      <label>
        Пароль
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          minLength={6}
          required
        />
      </label>
      <button disabled={busy}>{busy ? 'Проверяю…' : 'Войти'}</button>
    </form>
  );
}
