import { useEffect, useRef, useState } from 'react';

const testimonials = [
  { name: 'Амир', grade: '4 класс', text: 'Раньше я путался в умножении, а теперь понимаю, почему работает каждый шаг.' },
  { name: 'Алина', grade: '7 класс', text: 'Уравнения перестали казаться набором непонятных знаков. План помог разбирать их понемногу.' },
  { name: 'Диас', grade: '9 класс', text: 'Я наконец понял, как составлять химические реакции, а квизы показали мои слабые места.' },
  { name: 'София', grade: '6 класс', text: 'Исторические даты стало легче запоминать, потому что уроки связывают их с событиями.' },
  { name: 'Арсен', grade: '8 класс', text: 'Формулы по физике теперь не нужно просто зубрить — я начал понимать, где их применять.' },
  { name: 'Мадина', grade: '5 класс', text: 'После нескольких занятий я стала увереннее решать примеры с дробями без подсказок.' },
  { name: 'Тимур', grade: '10 класс', text: 'Тема генетики оказалась понятнее, когда сложные слова разделили на короткие объяснения.' },
  { name: 'Айша', grade: '3 класс', text: 'Я научилась находить главное условие в задачах и больше не боюсь длинного текста.' },
  { name: 'Максим', grade: '11 класс', text: 'Подготовка перестала быть хаотичной: каждый день я точно знаю, какую тему повторять.' },
  { name: 'Зере', grade: '8 класс', text: 'Доказательства по геометрии стали логичной цепочкой, а не текстом, который надо запомнить.' },
] as const;

export function Testimonials() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const wheelLocked = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => { setDirection(1); setActive((value) => (value + 1) % testimonials.length); }, 5200);
    return () => window.clearInterval(timer);
  }, []);

  const visible = Array.from({ length: 3 }, (_, index) => testimonials[(active + index) % testimonials.length]);
  const move = (step: number) => { setDirection(step < 0 ? -1 : 1); setActive((value) => (value + step + testimonials.length) % testimonials.length); };

  function scrollTestimonials(event: React.WheelEvent<HTMLDivElement>) {
    const distance = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(distance) < 12 || wheelLocked.current) return;
    wheelLocked.current = true;
    move(distance > 0 ? 1 : -1);
    window.setTimeout(() => { wheelLocked.current = false; }, 650);
  }

  return (
    <section className="testimonials-slide landing-slide">
      <div className="testimonial-heading"><div><span>Демо-истории</span><h2>Учиться легче, когда видишь свой прогресс</h2></div><p>Примеры того, как Трек может помочь ученикам. Позже здесь появятся настоящие отзывы первых пользователей.</p></div>
      <div className="testimonial-window" role="region" aria-label="Отзывы учеников. Листай тачпадом или колёсиком мыши" tabIndex={0} onWheel={scrollTestimonials} onKeyDown={(event) => { if (event.key === 'ArrowLeft') move(-1); if (event.key === 'ArrowRight') move(1); }}>
        {visible.map((review, index) => <article className={`testimonial-card testimonial-card--${direction > 0 ? 'next' : 'previous'}`} style={{ animationDelay: `${index * 90}ms` }} key={`${active}-${review.name}`}><span className="testimonial-quote">“</span><blockquote>{review.text}</blockquote><footer><i>{review.name.slice(0, 1)}</i><div><b>{review.name}</b><small>{review.grade}</small></div></footer></article>)}
      </div>
      <div className="testimonial-controls"><span className="testimonial-drag-hint">↔ Листай тачпадом или колёсиком</span><div>{testimonials.map((review, index) => <button type="button" className={index === active ? 'active' : ''} onClick={() => { setDirection(index < active ? -1 : 1); setActive(index); }} aria-label={`Отзыв ${index + 1}`} aria-pressed={index === active} key={review.name} />)}</div></div>
    </section>
  );
}
