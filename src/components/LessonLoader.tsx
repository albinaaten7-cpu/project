import { useEffect, useState } from 'react';

const stages = [
  'Выбираю самое важное по теме',
  'Собираю понятный разбор и пример',
  'Создаю разные форматы вопросов',
  'Проверяю ответы и объяснения',
];

export function LessonLoader({ day, subject }: { day: number; subject?: string }) {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStage((value) => Math.min(value + 1, stages.length - 1));
      setProgress((value) => Math.min(value + 19, 88));
    }, 2200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="lesson-loader" aria-live="polite">
      <div className="loader-orbit"><span>✦</span><i /></div>
      <div><small>День {day}{subject ? ` · ${subject}` : ''}</small><h2>{stages[stage]}</h2><p>Первое создание занимает немного времени. Потом урок откроется мгновенно.</p></div>
      <div className="loader-progress"><span style={{ width: `${progress}%` }} /></div>
      <b>{progress}%</b>
    </section>
  );
}
