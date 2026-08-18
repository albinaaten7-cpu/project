import { useEffect, useState } from 'react';
import type { Profile } from '../lib/profile';

type Props = {
  profile: Profile;
  busy: boolean;
  onSave: (displayName: string, nickname: string) => Promise<boolean>;
};

export function ProfileEditor({ profile, busy, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [nickname, setNickname] = useState(profile.nickname);

  useEffect(() => {
    setDisplayName(profile.display_name);
    setNickname(profile.nickname);
  }, [profile]);

  function cancel() {
    setDisplayName(profile.display_name);
    setNickname(profile.nickname);
    setEditing(false);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const saved = await onSave(displayName.trim(), nickname.trim());
    if (saved) setEditing(false);
  }

  if (!editing) return (
    <section className="profile-details">
      <div><span>Имя</span><strong>{profile.display_name}</strong></div>
      <div><span>Никнейм</span><strong>@{profile.nickname}</strong></div>
      <button className="profile-edit-button" onClick={() => setEditing(true)}>Изменить имя и никнейм</button>
    </section>
  );

  return (
    <form className="profile-details profile-edit-form" onSubmit={submit}>
      <label>Имя<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} minLength={2} maxLength={30} required /></label>
      <label>Никнейм<div className="nickname-input"><span>@</span><input value={nickname} onChange={(event) => setNickname(event.target.value.replace(/[^\p{L}\p{N}_]/gu, ''))} minLength={3} maxLength={24} required /></div></label>
      <small>Можно использовать русские и латинские буквы, цифры и знак _</small>
      <div className="profile-edit-actions"><button disabled={busy}>{busy ? 'Сохраняю…' : 'Сохранить'}</button><button type="button" className="ghost" onClick={cancel} disabled={busy}>Отмена</button></div>
    </form>
  );
}
