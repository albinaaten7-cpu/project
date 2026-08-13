type Props = { day: number; subject?: string; minutes: number; currentIndex: number; totalQuestions: number; onOpen: () => void };

export function TodayCard({ day, subject, minutes, currentIndex, totalQuestions, onOpen }: Props) {
  const inProgress = currentIndex > 0 && currentIndex < totalQuestions;
  return (
    <section className="today-card">
      <div className="today-date"><span>Сегодня</span><b>{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</b></div>
      <div className="today-info"><small>Следующий шаг</small><h2>День {day}{subject ? ` · ${subject}` : ''}</h2><p>{inProgress ? `Продолжить с вопроса ${currentIndex + 1}` : `Новый урок примерно на ${minutes} минут`}</p></div>
      <button onClick={onOpen}>{inProgress ? 'Продолжить →' : 'Начать сегодня →'}</button>
    </section>
  );
}
