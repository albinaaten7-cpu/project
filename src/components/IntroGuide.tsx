export function IntroGuide() {
  return (
    <section className="hero intro-guide landing-slide is-visible">
      <div className="intro-copy">
        <p>Учебный маршрут лично для тебя</p>
        <h1>Пойми, что учить сегодня</h1>
        <span>Добавь предметы, оценки и темы. Вектор определит приоритеты и разделит подготовку на понятные ежедневные уроки.</span>
        <div className="intro-steps">
          <div><b>1</b><small>Расскажи о цели</small></div>
          <div><b>2</b><small>Получи план по дням</small></div>
          <div><b>3</b><small>Учись и проходи квизы</small></div>
        </div>
      </div>
      <aside className="intro-example">
        <small>Твой день в Векторе</small>
        <b>Линейные уравнения</b>
        <span>40 минут · урок и практика</span>
        <div className="example-progress"><i style={{ width: '72%' }} /></div>
        <ul>
          <li><i>✓</i><span>Понятный разбор темы</span></li>
          <li><i>✓</i><span>12 вопросов с объяснениями</span></li>
          <li><i>→</i><span>Повторение сложных мест</span></li>
        </ul>
        <div className="example-result"><b>72%</b><span>тема уже понятна</span></div>
      </aside>
    </section>
  );
}
