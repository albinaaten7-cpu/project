type Props = {
  dailyMinutes: number;
  planDays: number;
  hasSubjects: boolean;
  onChange: (dailyMinutes: number, planDays: number) => void;
  onCreate: () => Promise<void>;
  busy: boolean;
};

export function PlanControls({ dailyMinutes, planDays, hasSubjects, onChange, onCreate, busy }: Props) {
  return (
    <section className="panel setup-card setup-card--rhythm">
      <div className="section-title"><span className="step">3</span><div><h2>Твой учебный ритм</h2><p>Выбери длительность одного занятия и количество учебных дней.</p></div></div>
      <div className="plan-controls plan-controls--total">
        <label>Минут в день<div className="input-suffix"><input type="number" min={10} max={1440} step={10} value={dailyMinutes} onChange={(event) => onChange(Number(event.target.value), planDays)} /><span>мин</span></div></label>
        <label>Сколько дней всего<div className="input-suffix"><input type="number" min={1} max={120} value={planDays} onChange={(event) => onChange(dailyMinutes, Number(event.target.value))} /><span>дней</span></div></label>
        <button className="setup-create-action" onClick={onCreate} disabled={!hasSubjects || busy}>{busy ? 'Открываю маршрут…' : 'Начать'}</button>
      </div>
      {!hasSubjects && <p className="field-hint">Сначала добавь хотя бы один предмет.</p>}
      {hasSubjects && <p className="field-hint">Например, выберешь 5 дней — получишь маршрут ровно на 5 учебных дней.</p>}
    </section>
  );
}
