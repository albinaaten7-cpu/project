type Props = {
  dailyMinutes: number;
  studyDays: number;
  planDays: number;
  hasExamDate: boolean;
  hasSubjects: boolean;
  onChange: (dailyMinutes: number, studyDays: number, planDays: number) => void;
  onCreate: () => Promise<void>;
  busy: boolean;
};

export function PlanControls({ dailyMinutes, studyDays, planDays, hasExamDate, hasSubjects, onChange, onCreate, busy }: Props) {
  return (
    <section className="panel">
      <div className="section-title"><span className="step">3</span><div><h2>Твой учебный ритм</h2><p>Сколько времени ты готов заниматься в день?</p></div></div>
      <div className={`plan-controls ${!hasExamDate ? 'plan-controls--duration' : ''}`}>
        <label>Минут в день<div className="input-suffix"><input type="number" min={10} max={1440} step={10} value={dailyMinutes} onChange={(event) => onChange(Number(event.target.value), studyDays, planDays)} /><span>мин</span></div></label>
        <label>Дней в неделю<select value={studyDays} onChange={(event) => onChange(dailyMinutes, Number(event.target.value), planDays)}>{[1, 2, 3, 4, 5, 6, 7].map((days) => <option key={days} value={days}>{days} {days === 1 ? 'день' : 'дней'}</option>)}</select></label>
        {!hasExamDate && <label>Учебных дней в плане<div className="input-suffix"><input type="number" min={1} max={120} value={planDays} onChange={(event) => onChange(dailyMinutes, studyDays, Number(event.target.value))} /><span>дней</span></div></label>}
        <button onClick={onCreate} disabled={!hasSubjects || busy}>{busy ? 'Открываю маршрут…' : 'Создать умный план'}</button>
      </div>
      {!hasSubjects && <p className="field-hint">Сначала добавь хотя бы один предмет.</p>}
      {hasSubjects && !hasExamDate && <p className="field-hint">Даты экзаменов нет — ты сам выбираешь длину плана.</p>}
    </section>
  );
}
