import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { QuizRound } from '../components/QuizRound';
import { generateDiagnostic } from '../lib/diagnostic';
import type { PracticeQuestion } from '../lib/practice';
import { saveQuizAnswer } from '../lib/quizProgress';
import { loadStudyData } from '../lib/studyData';
import { useAppSession } from '../lib/useAppSession';

const DIAGNOSTIC_DAY = 366;

export function DiagnosticPage() {
  const [, setLocation] = useLocation();
  const { session, loading: sessionLoading } = useAppSession();
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function prepare() {
    setLoading(true); setError('');
    try {
      const data = await loadStudyData();
      if (!data.subjects.length) { setLocation('/setup'); return; }
      setQuestions(await generateDiagnostic(data.subjects, data));
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Не удалось создать диагностику.');
    } finally { setLoading(false); }
  }

  useEffect(() => { if (!sessionLoading && session) void prepare(); }, [sessionLoading, session]);

  function answer(isCorrect: boolean) {
    const nextScore = score + (isCorrect ? 10 : 0);
    const nextMistakes = isCorrect ? mistakes : [...mistakes, questions[index]];
    setScore(nextScore); setMistakes(nextMistakes);
    void saveQuizAnswer(DIAGNOSTIC_DAY, index, questions[index], isCorrect, nextScore, 0, nextMistakes, index === questions.length - 1).catch(() => setError('Не удалось сохранить результат диагностики.'));
  }

  if (sessionLoading || loading) return <main className="practice-page diagnostic-page"><section className="diagnostic-loading"><span>◇</span><h1>Определяю твой уровень</h1><p>Готовлю 5 коротких вопросов по выбранным темам…</p></section></main>;
  if (error) return <main className="practice-page diagnostic-page"><section className="game-empty"><span>🧭</span><h1>Диагностика не загрузилась</h1><p>{error}</p><button onClick={() => void prepare()}>Попробовать снова</button><Link href="/study">Пропустить</Link></section></main>;
  if (index >= questions.length) return <main className="practice-page diagnostic-page"><section className="result-card diagnostic-result"><span>✨</span><h1>Уровень определён</h1><strong>{score / 10} из 5</strong><p>Теперь Трек учтёт эти ответы при создании уроков.</p><button onClick={() => setLocation('/study')}>Открыть мой план →</button></section></main>;

  return <main className="practice-page diagnostic-page"><header className="diagnostic-header"><Link href="/setup">← Настройки</Link><b>Диагностика · {index + 1}/5</b></header><div className="progress-track"><span style={{ width: `${(index / questions.length) * 100}%` }} /></div><QuizRound key={index} question={questions[index]} onAnswer={answer} onNext={() => setIndex((value) => value + 1)} isLast={index === questions.length - 1} /></main>;
}
