import { Link } from 'wouter';
import { FeatureDemo } from './FeatureDemo';
import { Testimonials } from './Testimonials';

const features = [
  { icon: '⌁', number: '01', type: 'route', title: 'План, который знает твою цель', text: 'Укажи предмет, свою оценку и темы. Трек распределит подготовку по дням и поставит сложное на первое место.' },
  { icon: '◇', number: '02', type: 'quiz', title: 'Не просто конспекты', text: 'Короткие объяснения, разобранные примеры и 10 заданий разных форматов вместо одинаковых советов «почитай и повтори».' },
  { icon: '↗', number: '03', type: 'feedback', title: 'Ошибка становится подсказкой', text: 'После неправильного ответа ты сразу увидишь, где ошибся и почему другой вариант действительно правильный.' },
] as const;

export function LandingFeatures() {
  return (
    <>
      <section className="landing-section landing-slide">
        <div className="landing-section-heading"><span>Что умеет Трек</span><h2>От растерянности<br />к понятному действию</h2><p>Не нужно самостоятельно решать, с чего начать. Каждый учебный день уже собран вокруг твоей цели.</p></div>
        <div className="feature-grid">{features.map((feature) => <article key={feature.number}><div className="feature-top"><i>{feature.icon}</i><small>{feature.number}</small></div><FeatureDemo type={feature.type} /><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div>
      </section>
      <section className="school-value landing-slide">
        <div><span>Для реальной школьной жизни</span><h2>Когда предметов много,<br />а времени мало</h2></div>
        <div className="value-list"><p><b>До экзамена</b> — маршрут учитывает доступное время.</p><p><b>На каждый день</b> — новый материал открывается отдельным уроком.</p><p><b>Точно по теме</b> — конспекты и задания создаются под твою цель.</p></div>
      </section>
      <Testimonials />
      <section className="landing-cta landing-slide"><span>Готов начать?</span><h2>Первый план займёт около минуты</h2><p>Выбери класс, добавь предмет и укажи темы, которые хочешь понять.</p><Link href="/setup">Начать</Link></section>
    </>
  );
}
