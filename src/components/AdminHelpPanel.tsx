import { useState } from 'react';
import type { AdminStudent } from '../lib/adminStudents';
import { sendSupportMessage } from '../lib/feedback';

export function AdminHelpPanel({ student }: { student: AdminStudent | null }) {
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  if (!student) return <section className="admin-help admin-empty-panel"><span>Личная помощь</span><h2>Выбери ученика из списка</h2><p>Здесь можно будет отправить ему совет или подсказку.</p></section>;
  const studentId = student.userId;

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { await sendSupportMessage(studentId, text); setText(''); setMessage('Сообщение отправлено ученику ✓'); }
    catch { setMessage('Не удалось отправить сообщение.'); }
    finally { setBusy(false); }
  }

  const accuracy = student.answers ? Math.round((student.correctAnswers / student.answers) * 100) : 0;
  return (
    <section className="admin-help">
      <span>Личная помощь</span><h2>{student.name}</h2><p>{student.email}</p>
      <div className="admin-help-stats"><b>{student.xp} XP</b><b>{student.completedLessons} уроков</b><b>{accuracy}% ответов</b></div>
      <form onSubmit={submit}><label>Сообщение ученику<textarea value={text} onChange={(event) => setText(event.target.value)} minLength={2} maxLength={1000} placeholder="Например: вижу, что тема сложная. Попробуй повторить…" required /></label><button disabled={busy}>{busy ? 'Отправляю…' : 'Помочь ученику'}</button></form>
      {message && <p className="support-message">{message}</p>}
    </section>
  );
}
