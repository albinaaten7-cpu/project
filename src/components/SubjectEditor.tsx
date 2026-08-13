import { useState } from 'react';
import type { NewSubject } from '../lib/studyData';
import type { Subject } from '../lib/studyPlanner';

type Props = { subject: Subject; onSave: (subject: NewSubject) => Promise<void>; onClose: () => void };

export function SubjectEditor({ subject, onSave, onClose }: Props) {
  const [name, setName] = useState(subject.name);
  const [currentGrade, setCurrentGrade] = useState(subject.current_grade);
  const [targetGrade, setTargetGrade] = useState(subject.target_grade);
  const [examDate, setExamDate] = useState(subject.exam_date ?? '');
  const [topics, setTopics] = useState(subject.topics);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { await onSave({ name: name.trim(), current_grade: currentGrade, target_grade: targetGrade, exam_date: examDate || null, topics: topics.trim() }); onClose(); }
    catch { setError('Не удалось сохранить изменения.'); }
    finally { setBusy(false); }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form className="subject-editor" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="edit-subject-title">
        <div className="modal-heading"><div><small>Настройки предмета</small><h2 id="edit-subject-title">Изменить предмет</h2></div><button type="button" className="modal-close" onClick={onClose}>×</button></div>
        <label>Название<input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} required /></label>
        <div className="editor-grades"><label>Сейчас<select value={currentGrade} onChange={(event) => { const grade = Number(event.target.value); setCurrentGrade(grade); setTargetGrade((value) => Math.max(value, grade)); }}>{[2, 3, 4, 5].map((grade) => <option key={grade}>{grade}</option>)}</select></label><label>Цель<select value={targetGrade} onChange={(event) => setTargetGrade(Number(event.target.value))}>{[2, 3, 4, 5].filter((grade) => grade >= currentGrade).map((grade) => <option key={grade}>{grade}</option>)}</select></label></div>
        <label>Дата экзамена <input type="date" value={examDate} onChange={(event) => setExamDate(event.target.value)} /></label>
        <label>Темы<textarea value={topics} onChange={(event) => setTopics(event.target.value)} maxLength={500} required /></label>
        {error && <p className="editor-error">{error}</p>}
        <div className="modal-actions"><button disabled={busy}>{busy ? 'Сохраняю…' : 'Сохранить изменения'}</button><button type="button" className="ghost" onClick={onClose}>Отмена</button></div>
      </form>
    </div>
  );
}
