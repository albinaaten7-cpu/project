import { Link } from 'wouter';

export function IntroGuide() {
  return (
    <section className="hero intro-guide landing-slide is-visible">
      <div className="intro-copy">
        <p>Твой путь к лучшим оценкам начинается здесь</p>
        <h1>Учись умнее,<br />а не дольше</h1>
        <span>Трек превращает твои цели в понятный план на каждый день: ты всегда знаешь, что учить и какой следующий шаг сделать.</span>
        <Link href="/setup" className="intro-button">Создать мой учебный маршрут →</Link>
        <div className="intro-steps">
          <div><b>1</b><small>Расскажи о цели</small></div>
          <div><b>2</b><small>Получи план по дням</small></div>
          <div><b>3</b><small>Учись и проходи квизы</small></div>
        </div>
      </div>
      <aside className="intro-example">
        <small>Твой день в Треке</small>
        <b>Линейные уравнения</b>
        <span>40 минут · урок и практика</span>
        <div className="example-equation" aria-hidden="true"><span>2x + 4 = 12</span><i>→</i><b>x = 4</b></div>
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
