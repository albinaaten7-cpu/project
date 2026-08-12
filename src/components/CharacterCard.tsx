import { profileLevel, type Profile } from '../lib/profile';

export function CharacterCard({ profile, compact = false }: { profile: Profile; compact?: boolean }) {
  const level = profileLevel(profile.xp);
  const progress = profile.xp % 100;
  const stage = level >= 10 ? '👑' : level >= 7 ? '🎓' : level >= 4 ? '⭐' : '🌱';
  return (
    <section className={`character-card ${compact ? 'character-card--compact' : ''}`}>
      <div className={`character character--${Math.min(level, 10)}`}><span className="character-aura">✦</span><span className="character-face">🦊</span><i>{stage}</i></div>
      <div className="character-info"><span>Твой герой · уровень {level}</span><h2>{profile.character_name}</h2>{!compact && <p>Проходи новые дневные квизы, чтобы герой становился сильнее.</p>}<div className="character-progress"><span style={{ width: `${progress}%` }}></span></div><small>{progress} / 100 XP до нового уровня</small></div>
    </section>
  );
}
