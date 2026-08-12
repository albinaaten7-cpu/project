import type { Subject } from '../lib/studyPlanner';

type Props = { subjects: Subject[]; onDelete: (id: string) => Promise<void>; onUpdateTopics: (id: string, topics: string) => Promise<void> };

export function SubjectList({ subjects, onDelete, onUpdateTopics }: Props) {
  if (subjects.length === 0) return <div className="empty-state">Здесь появятся твои предметы.</div>;

  return (
    <div className="subjects">
      {subjects.map((subject) => (
        <article className="subject-row" key={subject.id}>
          <div className="grade">{subject.current_grade}</div>
          <div className="subject-info"><strong>{subject.name}</strong><span>цель {subject.target_grade} · экзамен {new Date(`${subject.exam_date}T00:00:00`).toLocaleDateString('ru-RU')}</span><small>{subject.topics || 'Темы ещё не указаны'}</small>{!subject.topics && <button className="topics-button" onClick={() => { const topics = window.prompt('Введи темы через точку с запятой'); if (topics?.trim()) void onUpdateTopics(subject.id, topics.trim()); }}>Добавить темы</button>}</div>
          <button className="icon-button" onClick={() => onDelete(subject.id)} aria-label={`Удалить ${subject.name}`}>×</button>
        </article>
      ))}
    </div>
  );
}
