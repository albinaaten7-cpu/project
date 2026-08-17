import { Link } from 'wouter';
import type { TopicInsight } from '../lib/quizProgress';

function masteryLabel(item: TopicInsight) {
  if (item.total < 3) return 'Проверяем';
  if (item.accuracy < 50) return 'Нужно повторить';
  if (item.accuracy < 75) return 'Знаком';
  if (item.accuracy < 90) return 'Понимаю';
  return 'Освоено';
}

export function MasteryMap({ insights }: { insights: TopicInsight[] }) {
  return (
    <div className="mastery-map">
      <div className="mastery-heading"><div><b>Карта освоения тем</b><span>Обновляется после каждого ответа</span></div><Link href="/mistakes">Тренировать ошибки →</Link></div>
      {insights.length ? <div className="mastery-list">{insights.map((item) => <article key={`${item.subject}-${item.topic}`}><div><b>{item.topic}</b><small>{item.subject} · {item.correct}/{item.total}</small></div><span className="mastery-status">{masteryLabel(item)}</span><div className="mastery-track"><i style={{ width: `${item.accuracy}%` }} /></div><strong>{item.accuracy}%</strong></article>)}</div> : <p className="mastery-empty">Пройди диагностику или первый квиз — здесь появится карта тем.</p>}
    </div>
  );
}
