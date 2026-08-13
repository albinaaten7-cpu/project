import { profileLevel, type Profile } from '../lib/profile';

export function ProgressCard({ profile }: { profile: Profile }) {
  const level = profileLevel(profile.xp);
  const progress = profile.xp % 100;

  return (
    <section className="profile-progress-card">
      <div className="profile-progress-heading">
        <span>Учебный прогресс</span>
        <strong>{profile.xp} XP</strong>
      </div>
      <h2>Уровень {level}</h2>
      <p>Проходи дневные квизы, чтобы повышать уровень.</p>
      <div className="profile-progress-bar"><span style={{ width: `${progress}%` }} /></div>
      <small>{progress} / 100 XP до следующего уровня</small>
    </section>
  );
}
