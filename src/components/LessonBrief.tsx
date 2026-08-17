import type { DailyLesson } from '../lib/dailyLessons';

export function LessonBrief({ lesson, quizLoading = false, onStart }: { lesson: DailyLesson; quizLoading?: boolean; onStart: () => void }) {
  return (
    <section className="lesson-brief">
      <span className="mission-label">Миссия дня</span><h1>{lesson.title}</h1><p className="mission">{lesson.mission}</p>
      {lesson.sections.map((section) => <article className="lesson-section" key={`${section.subject}-${section.topic}`}><div className="quiz-meta"><span>{section.subject}</span><span>{section.topic}</span></div><p className="lesson-summary">{section.summary}</p><div className="lesson-grid"><div><b>Главное</b><ul>{section.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul></div><div><b>Разбор примера</b><p>{section.workedExample}</p></div></div></article>)}
      {quizLoading && <div className="quiz-part-loader"><span /><div><b>Собираю квиз по частям</b><small>Две группы по 5 вопросов создаются параллельно</small></div></div>}
      <button className="start-quiz" onClick={onStart} disabled={quizLoading || lesson.sections.every((section) => section.quiz.length === 0)}>{quizLoading ? 'Вопросы ещё загружаются…' : 'Начать квиз дня →'}</button>
    </section>
  );
}
