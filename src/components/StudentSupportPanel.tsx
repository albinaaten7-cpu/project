import { useEffect, useState } from 'react';
import { createFeedback, loadMyFeedback, loadMySupportMessages, type FeedbackCategory, type FeedbackItem, type SupportMessage } from '../lib/feedback';

const categoryLabels: Record<FeedbackCategory, string> = { problem: 'Проблема', idea: 'Идея', question: 'Вопрос' };
const statusLabels = { open: 'Новое', in_progress: 'Админ помогает', resolved: 'Решено' } as const;

export function StudentSupportPanel() {
  const [category, setCategory] = useState<FeedbackCategory>('problem');
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [support, setSupport] = useState<SupportMessage[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const [nextFeedback, nextSupport] = await Promise.all([loadMyFeedback(), loadMySupportMessages()]);
      setFeedback(nextFeedback); setSupport(nextSupport);
    } catch { setMessage('Поддержка появится после обновления базы.'); }
  }

  useEffect(() => { void load(); }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      await createFeedback(category, text);
      setText(''); setMessage('Сообщение отправлено администратору ✓'); await load();
    } catch { setMessage('Не удалось отправить сообщение. Попробуй ещё раз.'); }
    finally { setBusy(false); }
  }

  return (
    <section className="student-support">
      <div className="support-heading"><div><span>Помощь и обратная связь</span><h2>Расскажи, если что-то не получается</h2></div><p>Администратор увидит обращение и сможет ответить лично.</p></div>
      {support.length > 0 && <div className="support-inbox"><h3>Сообщения от администратора</h3>{support.map((item) => <article key={item.id}><span>Совет для тебя</span><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleDateString('ru-RU')}</small></article>)}</div>}
      <form className="feedback-form" onSubmit={submit}>
        <label>Тип сообщения<select value={category} onChange={(event) => setCategory(event.target.value as FeedbackCategory)}><option value="problem">Проблема</option><option value="question">Вопрос</option><option value="idea">Идея</option></select></label>
        <label>Что случилось?<textarea value={text} onChange={(event) => setText(event.target.value)} minLength={5} maxLength={1000} placeholder="Опиши проблему или предложение…" required /></label>
        <button disabled={busy}>{busy ? 'Отправляю…' : 'Отправить администратору'}</button>
      </form>
      {message && <p className="support-message">{message}</p>}
      {feedback.length > 0 && <div className="my-feedback"><h3>Мои обращения</h3>{feedback.map((item) => <article key={item.id}><div><b>{categoryLabels[item.category]}</b><span className={`feedback-status feedback-status--${item.status}`}>{statusLabels[item.status]}</span></div><p>{item.message}</p>{item.adminReply && <blockquote><b>Ответ администратора:</b> {item.adminReply}</blockquote>}</article>)}</div>}
    </section>
  );
}
