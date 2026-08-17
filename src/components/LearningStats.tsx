import type { LearningStats as Stats } from '../lib/quizProgress';
import { MasteryMap } from './MasteryMap';

export function LearningStats({ stats }: { stats: Stats }) {
  const accuracy = stats.totalAnswers ? Math.round(stats.correctAnswers / stats.totalAnswers * 100) : 0;
  const weakTopics = stats.insights.filter((item) => item.accuracy < 70).slice(0, 4);
  return (
    <section className="learning-stats">
      <div className="stats-heading"><span>Моя статистика</span><h2>Учебный результат</h2></div>
      <div className="stats-grid"><article><b>{stats.completedLessons}</b><span>уроков пройдено</span></article><article><b>{accuracy}%</b><span>правильных ответов</span></article><article><b>{stats.studyMinutes}</b><span>минут в учёбе</span></article><article><b>{stats.currentStreak}</b><span>дней подряд</span></article></div>
      <div className="weak-topics"><div><b>Что повторить</b><span>По результатам твоих ответов</span></div>{weakTopics.length ? weakTopics.map((item) => <article key={`${item.subject}-${item.topic}`}><span><b>{item.topic}</b><small>{item.subject}</small></span><div><i style={{ width: `${item.accuracy}%` }} /></div><strong>{item.accuracy}%</strong></article>) : <p>Пройди первый квиз — здесь появятся рекомендации.</p>}</div>
      <MasteryMap insights={stats.insights} />
    </section>
  );
}
