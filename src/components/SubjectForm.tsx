import { useEffect, useState } from 'react';
import type { NewSubject, StudySettings } from '../lib/studyData';
import { getSubjects } from '../lib/subjectCatalog';

type Props = { onAdd: (subject: NewSubject) => Promise<void>; settings: StudySettings };

export function SubjectForm({ onAdd, settings }: Props) {
  const subjects = getSubjects(settings.country, settings.schoolGrade);
  const [selectedName, setSelectedName] = useState('');
  const [currentGrade, setCurrentGrade] = useState(3);
  const [targetGrade, setTargetGrade] = useState(5);
  const [examDate, setExamDate] = useState('');
  const [topics, setTopics] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => setSelectedName(''), [settings.country, settings.schoolGrade]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await onAdd({ name: selectedName, current_grade: currentGrade, target_grade: targetGrade, exam_date: examDate || null, topics: topics.trim() });
      setSelectedName('');
      setExamDate('');
      setTopics('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <div className="section-title">
        <span className="step">2</span>
        <div><h2>Добавь предмет</h2><p>Список составлен для {settings.schoolGrade} класса · {settings.country}.</p></div>
      </div>
      <form className="subject-form" onSubmit={submit}>
        <label className="wide">Предмет<select value={selectedName} onChange={(e) => setSelectedName(e.target.value)} required><option value="" disabled>Выбери предмет</option>{subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}</select></label>
        <label>Сейчас<select value={currentGrade} onChange={(e) => { const grade = Number(e.target.value); setCurrentGrade(grade); setTargetGrade((target) => Math.max(target, grade)); }}>{[2, 3, 4, 5].map((grade) => <option key={grade}>{grade}</option>)}</select></label>
        <label>Цель<select value={targetGrade} onChange={(e) => setTargetGrade(Number(e.target.value))}>{[3, 4, 5].filter((grade) => grade >= currentGrade).map((grade) => <option key={grade}>{grade}</option>)}</select></label>
        <label className="wide"><span className="field-label">Дата экзамена <small className="optional-label">необязательно</small></span><input type="date" value={examDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setExamDate(e.target.value)} /><span className="input-help">Если даты нет, количество учебных дней ты выберешь сам.</span></label>
        <label className="wide">Темы для подготовки<textarea value={topics} onChange={(e) => setTopics(e.target.value)} placeholder="Например: линейные уравнения; системы уравнений; функции" maxLength={500} required /><span className="input-help">Разделяй темы точкой с запятой. Так план не будет придумывать программу.</span></label>
        <button className="wide" disabled={busy}>{busy ? 'Добавляю…' : 'Добавить предмет'}</button>
      </form>
    </section>
  );
}
