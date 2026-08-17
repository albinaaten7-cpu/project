import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { QuizRound } from '../components/QuizRound';
import { MistakeCoach } from '../components/MistakeCoach';
import type { PracticeQuestion } from '../lib/practice';
import { loadMistakeQuestions } from '../lib/quizProgress';
import { useAppSession } from '../lib/useAppSession';

export function MistakesPage() {
  const { session, loading: sessionLoading } = useAppSession();
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionLoading || !session) return;
    loadMistakeQuestions().then(setQuestions).catch(() => setError('Не удалось загрузить ошибки.')).finally(() => setLoading(false));
  }, [sessionLoading, session]);

  if (sessionLoading || loading) return <main className="practice-page centered">Собираю тренировку…</main>;
  if (error) return <main className="practice-page"><section className="game-empty"><span>🤔</span><h1>Не получилось загрузить вопросы</h1><p>{error}</p><Link href="/study" className="link-button">Вернуться к плану</Link></section></main>;
  if (!questions.length) return <main className="practice-page"><section className="game-empty"><span>🏆</span><h1>Ошибок пока нет</h1><p>Проходи дневные квизы — сложные вопросы будут собираться здесь.</p><Link href="/study" className="link-button">К учебному плану</Link></section></main>;
  if (index >= questions.length) return <main className="practice-page"><section className="result-card"><span>🎯</span><h1>Тренировка закончена</h1><strong>{correct} из {questions.length}</strong><p>Возвращайся позже: список обновится после новых квизов.</p><Link href="/study" className="link-button">Вернуться к плану</Link></section></main>;

  return <main className="practice-page mistakes-page"><header className="diagnostic-header"><Link href="/history">← В историю</Link><b>Работа над ошибками · {index + 1}/{questions.length}</b></header><MistakeCoach mistakes={questions} current={questions[index]} /><div className="progress-track"><span style={{ width: `${(index / questions.length) * 100}%` }} /></div><QuizRound key={index} question={questions[index]} onAnswer={(isCorrect) => { if (isCorrect) setCorrect((value) => value + 1); }} onNext={() => setIndex((value) => value + 1)} isLast={index === questions.length - 1} /></main>;
}
