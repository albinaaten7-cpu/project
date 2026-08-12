type Props = { total: number; selected: number; readyDays: Set<number>; onSelect: (day: number) => void };

export function DayNavigator({ total, selected, readyDays, onSelect }: Props) {
  return (
    <nav className="day-nav" aria-label="Дни подготовки">
      {Array.from({ length: total }, (_, index) => index + 1).map((day) => <button className={day === selected ? 'active' : ''} key={day} onClick={() => onSelect(day)}><span>{readyDays.has(day) ? '✓' : day}</span>День {day}</button>)}
    </nav>
  );
}
