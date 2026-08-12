import type { DailyLesson } from '../lib/dailyLessons';

export function LessonBrief({ lesson, onStart }: { lesson: DailyLesson; onStart: () => void }) {
  return (
    <section className="lesson-brief">
      <span className="mission-label">Миссия дня</span><h1>{lesson.title}</h1><p className="mission">{lesson.mission}</p>
      {lesson.sections.map((section) => <article className="lesson-section" key={`${section.subject}-${section.topic}`}><div className="quiz-meta"><span>{section.subject}</span><span>{section.topic}</span></div><p className="lesson-summary">{section.summary}</p><div className="lesson-grid"><div><b>Главное</b><ul>{section.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul></div><div><b>Разбор примера</b><p>{section.workedExample}</p></div></div></article>)}
      <button className="start-quiz" onClick={onStart}>Начать квиз дня →</button>
    </section>
  );
}
