import { useState } from 'react';
import { createFeedback, type FeedbackCategory } from '../lib/feedback';

export function StudentSupportPanel() {
  const [category, setCategory] = useState<FeedbackCategory>('problem');
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      await createFeedback(category, text);
      setText(''); setMessage('Сообщение отправлено администратору ✓');
    } catch { setMessage('Не удалось отправить сообщение. Попробуй ещё раз.'); }
    finally { setBusy(false); }
  }

  return (
    <section className="student-support">
      <div className="support-heading"><div><span>Помощь и обратная связь</span><h2>Расскажи, если что-то не получается</h2></div><p>Администратор увидит обращение и сможет ответить лично.</p></div>
      <form className="feedback-form" onSubmit={submit}>
        <label>Тип сообщения<select value={category} onChange={(event) => setCategory(event.target.value as FeedbackCategory)}><option value="problem">Проблема</option><option value="question">Вопрос</option><option value="idea">Идея</option></select></label>
        <label>Что случилось?<textarea value={text} onChange={(event) => setText(event.target.value)} minLength={5} maxLength={1000} placeholder="Опиши проблему или предложение…" required /></label>
        <button disabled={busy}>{busy ? 'Отправляю…' : 'Отправить администратору'}</button>
      </form>
      {message && <p className="support-message">{message}</p>}
    </section>
  );
}
