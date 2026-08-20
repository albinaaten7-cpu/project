type Props = { xp: number; streak: number; completedLessons: number };

const achievements = [
  { icon: '🌱', title: 'Первый шаг', test: (lessons: number, _xp: number) => lessons >= 1 },
  { icon: '🔥', title: 'На волне', test: (_lessons: number, xp: number) => xp >= 100 },
  { icon: '🏆', title: 'Знаток', test: (lessons: number, _xp: number) => lessons >= 5 },
];

export function GameProgress({ xp, streak, completedLessons }: Props) {
  const level = Math.floor(xp / 100) + 1;
  const levelProgress = xp % 100;
  const unlocked = achievements.filter((achievement) => achievement.test(completedLessons, xp));

  return (
    <section className="game-progress" aria-label="Игровой прогресс">
      <div className="game-level"><span>{level}</span><div><small>Уровень {level}</small><b>{xp} XP всего</b></div></div>
      <div className="game-level-track"><span style={{ width: `${levelProgress}%` }} /></div>
      <p>До уровня {level + 1}: {100 - levelProgress} XP</p>
      <div className="game-progress-stats"><span>🔥 Серия ответов: <b>{streak}</b></span><span>✓ Пройдено дней: <b>{completedLessons}</b></span></div>
      <div className="achievement-row">
        {achievements.map((achievement) => <span className={unlocked.includes(achievement) ? 'unlocked' : ''} title={achievement.title} key={achievement.title}>{achievement.icon}<small>{achievement.title}</small></span>)}
      </div>
    </section>
  );
}
