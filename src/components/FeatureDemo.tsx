export function FeatureDemo({ type }: { type: 'route' | 'quiz' | 'feedback' }) {
  if (type === 'route') return (
    <div className="feature-demo route-demo" aria-hidden="true">
      <div className="demo-route-line"><i /></div>
      <div className="demo-day active"><b>1</b><span>Основа темы<small>Сегодня · 30 мин</small></span></div>
      <div className="demo-day"><b>2</b><span>Применение<small>Завтра · 40 мин</small></span></div>
      <div className="demo-day"><b>3</b><span>Проверка знаний<small>Квиз · 10 вопросов</small></span></div>
    </div>
  );

  if (type === 'quiz') return (
    <div className="feature-demo quiz-demo" aria-hidden="true">
      <small>Какой ответ верный?</small>
      <div className="demo-question">2x + 4 = 12</div>
      <div className="demo-options"><span>2</span><span>3</span><span className="demo-correct">4 <i>✓</i></span><span>8</span></div>
      <div className="demo-format"><i /><span>Выбор ответа</span><b>→</b><span>Короткий ответ</span></div>
    </div>
  );

  return (
    <div className="feature-demo feedback-demo" aria-hidden="true">
      <div className="demo-wrong"><i>×</i><span><small>Твой ответ</small><b>ДНК находится только в ядре</b></span></div>
      <div className="demo-explanation"><i>→</i><p><b>Почти!</b> У клеток также есть ДНК в митохондриях.</p></div>
      <div className="demo-repeat"><span>Попробовать похожий вопрос</span><b>+10 XP</b></div>
    </div>
  );
}
