import { useState } from 'react';
import { answerFeedback, type FeedbackItem, type FeedbackStatus } from '../lib/feedback';
import type { AdminStudent } from '../lib/adminStudents';

const categoryLabels = { problem: 'Проблема', idea: 'Идея', question: 'Вопрос' } as const;

export function AdminFeedbackQueue({ feedback, students, onUpdated }: { feedback: FeedbackItem[]; students: AdminStudent[]; onUpdated: () => Promise<void> }) {
  const [replyId, setReplyId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(id: string, status: FeedbackStatus) {
    setBusy(true);
    try { await answerFeedback(id, reply, status); setReply(''); setReplyId(null); await onUpdated(); }
    finally { setBusy(false); }
  }

  return (
    <section className="admin-feedback">
      <div className="admin-heading"><div><span>Жалобы и фидбэк</span><h2>Обращения учеников</h2></div><b>{feedback.filter((item) => item.status !== 'resolved').length}</b></div>
      {feedback.length ? <div className="admin-feedback-list">{feedback.map((item) => {
        const student = students.find((entry) => entry.userId === item.userId);
        return <article key={item.id}><div className="feedback-meta"><b>{categoryLabels[item.category]}</b><span>{student?.name ?? 'Ученик'} · {new Date(item.createdAt).toLocaleDateString('ru-RU')}</span></div><p>{item.message}</p>{item.adminReply && <blockquote>{item.adminReply}</blockquote>}{replyId === item.id ? <div className="feedback-reply"><textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Напиши ответ…" minLength={2} required /><div><button disabled={busy || reply.length < 2} onClick={() => void submit(item.id, 'resolved')}>Ответить и закрыть</button><button className="ghost" onClick={() => setReplyId(null)}>Отмена</button></div></div> : <button className="ghost feedback-answer" onClick={() => { setReplyId(item.id); setReply(item.adminReply ?? ''); }}>{item.status === 'resolved' ? 'Изменить ответ' : 'Ответить'}</button>}</article>;
      })}</div> : <p className="admin-empty">Обращений пока нет.</p>}
    </section>
  );
}
