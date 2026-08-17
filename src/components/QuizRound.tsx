import { useEffect, useMemo, useRef, useState } from 'react';
import type { PracticeQuestion } from '../lib/practice';
import { explainQuestionSimply } from '../lib/explanations';

type Props = { question: PracticeQuestion; onAnswer: (correct: boolean) => void; onNext: () => void; isLast: boolean };

const labels = { choice: 'Выбери ответ', true_false: 'Верно или неверно', short_answer: 'Короткий ответ', order: 'Расставь по порядку' };
const normalize = (value: string) => value.toLocaleLowerCase('ru-RU').replace(/[.,!?]/g, '').replace(/\s+/g, ' ').trim();

export function QuizRound({ question, onAnswer, onNext, isLast }: Props) {
  const type = question.type ?? 'choice';
  const options = question.options ?? [];
  const items = question.items ?? [];
  const shuffledItems = useMemo(() => items.length > 1 ? [items[items.length - 1], ...items.slice(0, -1)] : items, [items]);
  const [selected, setSelected] = useState<number | null>(null);
  const [written, setWritten] = useState('');
  const [ordered, setOrdered] = useState<string[]>([]);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [simpleExplanation, setSimpleExplanation] = useState('');
  const [explaining, setExplaining] = useState(false);
  const nextRef = useRef(onNext);

  useEffect(() => { nextRef.current = onNext; }, [onNext]);

  useEffect(() => {
    if (correct !== true) return;
    const timer = window.setTimeout(() => nextRef.current(), 2000);
    return () => window.clearTimeout(timer);
  }, [correct]);

  function finish(isCorrect: boolean) {
    if (correct !== null) return;
    setCorrect(isCorrect); onAnswer(isCorrect);
  }

  function select(index: number) {
    if (correct !== null) return;
    setSelected(index); finish(index === question.correctIndex);
  }

  function checkWritten(event: React.FormEvent) {
    event.preventDefault();
    finish((question.acceptedAnswers ?? []).some((answer) => normalize(answer) === normalize(written)));
  }

  function checkOrder() {
    finish(ordered.every((item, index) => item === items[index]));
  }

  const wrongReason = selected === null ? '' : question.wrongExplanations?.[selected];
  const correctAnswer = type === 'short_answer' ? question.acceptedAnswers?.[0] : type === 'order' ? items.join(' → ') : options[question.correctIndex ?? 0];
  const chosenAnswer = type === 'short_answer' ? written : type === 'order' ? ordered.join(' → ') : selected === null ? '' : options[selected];

  async function explainSimply() {
    setExplaining(true);
    try { setSimpleExplanation(await explainQuestionSimply(question, chosenAnswer, correctAnswer ?? '')); }
    catch { setSimpleExplanation('Не получилось загрузить другое объяснение. Попробуй ещё раз.'); }
    finally { setExplaining(false); }
  }

  return (
    <section className="quiz-card">
      {correct && <div className="correct-celebration" role="status" aria-live="polite"><span className="celebration-burst">✓</span><b>Отлично!</b><i>✦</i><i>★</i><i>✦</i></div>}
      <div className="quiz-meta"><span>{question.subject}</span><span>{question.topic}</span><span>{labels[type]}</span></div>
      <h2>{question.question}</h2>
      {(type === 'choice' || type === 'true_false') && <div className={`answers ${type === 'true_false' ? 'true-false-answers' : ''}`}>{options.map((option, index) => { const state = correct !== null && index === question.correctIndex ? 'correct' : correct !== null && index === selected ? 'wrong' : ''; return <button className={state} key={`${option}-${index}`} onClick={() => select(index)}><i>{type === 'true_false' ? (index === 0 ? '✓' : '×') : String.fromCharCode(65 + index)}</i>{option}</button>; })}</div>}
      {type === 'short_answer' && <form className="written-answer" onSubmit={checkWritten}><input value={written} onChange={(event) => setWritten(event.target.value)} placeholder="Напиши ответ" disabled={correct !== null} autoFocus /><button disabled={!written.trim() || correct !== null}>Проверить</button></form>}
      {type === 'order' && <div className="order-answer"><p>Нажимай элементы в правильной последовательности:</p><div className="ordered-items">{ordered.length ? ordered.map((item, index) => <button key={item} disabled={correct !== null} onClick={() => setOrdered((current) => current.filter((_, itemIndex) => itemIndex !== index))}><b>{index + 1}</b>{item}</button>) : <span>Здесь появится твой порядок</span>}</div><div className="order-bank">{shuffledItems.filter((item) => !ordered.includes(item)).map((item) => <button key={item} disabled={correct !== null} onClick={() => setOrdered((current) => [...current, item])}>{item}</button>)}</div><button className="check-order" disabled={ordered.length !== items.length || correct !== null} onClick={checkOrder}>Проверить порядок</button></div>}
      {correct === true && <div className="feedback good auto-correct-feedback" role="status" aria-live="polite"><b>Почему это верно · +10 XP</b><p>{question.explanation}</p><div className="auto-next-progress"><span /></div><small>{isLast ? 'Открываю результат…' : 'Следующий вопрос…'}</small></div>}
      {correct === false && <div className="feedback bad"><b>Разберём ошибку</b><p>{wrongReason || 'Ответ не совпадает с правилом или последовательностью из урока.'}</p><b>Правильный ответ</b><p><strong>{correctAnswer}.</strong> {question.explanation}</p>{simpleExplanation && <div className="simple-explanation"><b>Ещё проще</b><p>{simpleExplanation}</p></div>}<button type="button" className="explain-simply" onClick={() => void explainSimply()} disabled={explaining}>{explaining ? 'Объясняю…' : 'Объясни проще'}</button><button onClick={onNext}>{isLast ? 'Посмотреть результат' : 'Следующий вопрос →'}</button></div>}
    </section>
  );
}
