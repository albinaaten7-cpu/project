import type { PracticeQuestion } from '../lib/practice';

type Props = { question: PracticeQuestion; selected: number | null; onSelect: (index: number) => void; onNext: () => void; isLast: boolean };

export function QuizRound({ question, selected, onSelect, onNext, isLast }: Props) {
  const answered = selected !== null;
  const isCorrect = selected === question.correctIndex;
  const wrongReason = selected === null ? '' : question.wrongExplanations?.[selected];
  return (
    <section className="quiz-card">
      <div className="quiz-meta"><span>{question.subject}</span><span>{question.topic}</span></div>
      <h2>{question.question}</h2>
      <div className="answers">
        {question.options.map((option, index) => {
          const state = answered && index === question.correctIndex ? 'correct' : answered && index === selected ? 'wrong' : '';
          return <button className={state} key={option} onClick={() => !answered && onSelect(index)}><i>{String.fromCharCode(65 + index)}</i>{option}</button>;
        })}
      </div>
      {answered && <div className={isCorrect ? 'feedback good' : 'feedback bad'}>{isCorrect ? <><b>Верно! +10 XP</b><p>{question.explanation}</p></> : <><b>Почему твой ответ неправильный</b><p>{wrongReason || 'Этот вариант не соответствует условию или правилу из урока.'}</p><b>Почему другой вариант правильный</b><p><strong>{question.options[question.correctIndex]}.</strong> {question.explanation}</p></>}<button onClick={onNext}>{isLast ? 'Посмотреть результат' : 'Следующий вопрос →'}</button></div>}
    </section>
  );
}
