import { useState } from 'react';

const answerMessages = ['Отлично!', 'Молодец!', 'Так держать!', 'Верно!', 'Супер!'];
const completionMessages = ['Квиз пройден!', 'Отличная работа!', 'Ты справился!', 'Новый шаг взят!'];

export function MiniCelebration({ type }: { type: 'answer' | 'complete' }) {
  const messages = type === 'answer' ? answerMessages : completionMessages;
  const [message] = useState(() => messages[Math.floor(Math.random() * messages.length)]);

  return (
    <div className={`mini-celebration mini-celebration--${type}`} role="status" aria-live="polite">
      <div className="celebration-message"><span>✓</span><b>{message}</b></div>
      <i>✦</i><i>★</i><i>●</i><i>✦</i><i>★</i><i>●</i>
    </div>
  );
}
