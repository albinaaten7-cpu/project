import { Link } from 'wouter';
import type { PracticeQuestion } from '../lib/practice';

type Props = { day: number; totalDays: number; score: number; totalQuestions: number; mistakes: PracticeQuestion[]; registered: boolean; reviewMode: boolean; onReview: () => void; onNextDay: () => void };

export function QuizResult({ day, totalDays, score, totalQuestions, mistakes, registered, reviewMode, onReview, onNextDay }: Props) {
  if (reviewMode) return <section className="result-card"><span>✨</span><h1>Ошибки разобраны!</h1><p>Ты ещё раз прошёл сложные вопросы. Теперь материал закрепится лучше.</p><button onClick={onNextDay}>{day < totalDays ? `Перейти к дню ${day + 1} →` : 'Вернуться к уроку'}</button></section>;

  return (
    <section className="result-card">
      <span>{mistakes.length ? '🎯' : '🏆'}</span><h1>День {day} пройден!</h1><strong>{score} XP</strong>
      <p>Правильных ответов: {score / 10} из {totalQuestions}. {mistakes.length ? `Стоит повторить: ${mistakes.length}.` : 'Все ответы правильные!'}</p>
      {mistakes.length > 0 && <button className="review-errors" onClick={onReview}>Повторить мои ошибки ({mistakes.length})</button>}
      {!registered && <Link href="/account" className="link-button">Сохранить результат</Link>}
      {day < totalDays && <button onClick={onNextDay}>Перейти к дню {day + 1} →</button>}
    </section>
  );
}
