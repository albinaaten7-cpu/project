import { useState } from 'react';
import { askMistakeCoach, type CoachMessage } from '../lib/mistakeCoach';
import type { PracticeQuestion } from '../lib/practice';

const initialMessage: CoachMessage = { role: 'assistant', text: 'Я помогу разобраться в ошибках. Выбери подсказку или задай свой вопрос.' };
const quickPrompts = ['С чего начать?', 'Объясни мою ошибку', 'Дай похожий пример'];

export function MistakeCoach({ mistakes, current }: { mistakes: PracticeQuestion[]; current?: PracticeQuestion }) {
  const [messages, setMessages] = useState<CoachMessage[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    const nextMessages: CoachMessage[] = [...messages, { role: 'user', text: clean }];
    setMessages(nextMessages); setInput(''); setBusy(true);
    try {
      const answer = await askMistakeCoach(nextMessages, mistakes, current);
      setMessages((items) => [...items, { role: 'assistant', text: answer }]);
    } catch {
      setMessages((items) => [...items, { role: 'assistant', text: 'Не получилось ответить. Попробуй задать вопрос ещё раз.' }]);
    } finally { setBusy(false); }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    void send(input);
  }

  return (
    <section className="mistake-coach">
      <div className="coach-heading"><span>◎</span><div><b>AI-наставник</b><small>Поможет понять ошибку, не выдавая ответ сразу</small></div><i>онлайн</i></div>
      <div className="coach-messages" aria-live="polite">{messages.map((message, index) => <div className={`coach-message coach-message--${message.role}`} key={`${message.role}-${index}`}>{message.text}</div>)}{busy && <div className="coach-typing"><i /><i /><i /></div>}</div>
      <div className="coach-prompts">{quickPrompts.map((prompt) => <button type="button" onClick={() => void send(prompt)} disabled={busy} key={prompt}>{prompt}</button>)}</div>
      <form className="coach-form" onSubmit={submit}><input value={input} onChange={(event) => setInput(event.target.value)} maxLength={500} placeholder="Спроси о своей ошибке…" /><button disabled={busy || !input.trim()} aria-label="Отправить вопрос">→</button></form>
    </section>
  );
}
