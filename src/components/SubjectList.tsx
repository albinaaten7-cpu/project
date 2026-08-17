import { useState } from 'react';
import type { NewSubject } from '../lib/studyData';
import type { Subject } from '../lib/studyPlanner';
import { SubjectEditor } from './SubjectEditor';

type Props = { subjects: Subject[]; onDelete: (id: string) => Promise<void>; onUpdate: (id: string, subject: NewSubject) => Promise<void> };

export function SubjectList({ subjects, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState<Subject | null>(null);
  const [busy, setBusy] = useState(false);
  if (subjects.length === 0) return <div className="empty-state">Здесь появятся твои предметы.</div>;

  async function remove() {
    if (!deleting) return;
    setBusy(true); try { await onDelete(deleting.id); setDeleting(null); } finally { setBusy(false); }
  }

  return <><div className="subjects">{subjects.map((subject) => <article className="subject-row" key={subject.id}><div className="grade">{subject.current_grade}</div><div className="subject-info"><strong>{subject.name}</strong><span>цель: {subject.target_grade}</span><small>{subject.topics || 'Темы ещё не указаны'}</small></div><div className="subject-actions"><button className="edit-subject" onClick={() => setEditing(subject)} aria-label={`Изменить ${subject.name}`}>✎</button><button className="icon-button" onClick={() => setDeleting(subject)} aria-label={`Удалить ${subject.name}`}>×</button></div></article>)}</div>{editing && <SubjectEditor subject={editing} onSave={(updated) => onUpdate(editing.id, updated)} onClose={() => setEditing(null)} />}{deleting && <div className="modal-backdrop"><section className="delete-dialog" role="alertdialog" aria-modal="true"><span>Удалить предмет?</span><h2>{deleting.name}</h2><p>Это действие нельзя отменить.</p><div className="modal-actions"><button className="danger-button" onClick={() => void remove()} disabled={busy}>{busy ? 'Удаляю…' : 'Удалить'}</button><button className="ghost" onClick={() => setDeleting(null)} disabled={busy}>Отмена</button></div></section></div>}</>;
}
