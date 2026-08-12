type Props = {
  dailyMinutes: number;
  studyDays: number;
  hasSubjects: boolean;
  onChange: (dailyMinutes: number, studyDays: number) => void;
  onCreate: () => Promise<void>;
  busy: boolean;
};

export function PlanControls({ dailyMinutes, studyDays, hasSubjects, onChange, onCreate, busy }: Props) {
  return (
    <section className="panel">
      <div className="section-title"><span className="step">3</span><div><h2>Твой учебный ритм</h2><p>Сколько времени ты готов заниматься в день?</p></div></div>
      <div className="plan-controls">
        <label>Минут в день<div className="input-suffix"><input type="number" min={10} max={1440} step={10} value={dailyMinutes} onChange={(event) => onChange(Number(event.target.value), studyDays)} /><span>мин</span></div></label>
        <label>Дней в неделю<select value={studyDays} onChange={(event) => onChange(dailyMinutes, Number(event.target.value))}>{[1, 2, 3, 4, 5, 6, 7].map((days) => <option key={days} value={days}>{days} {days === 1 ? 'день' : 'дней'}</option>)}</select></label>
        <button onClick={onCreate} disabled={!hasSubjects || busy}>{busy ? 'Открываю маршрут…' : 'Создать умный план'}</button>
      </div>
      {!hasSubjects && <p className="field-hint">Сначала добавь хотя бы один предмет.</p>}
    </section>
  );
}
