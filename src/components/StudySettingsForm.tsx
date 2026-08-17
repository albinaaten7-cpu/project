import type { StudySettings } from '../lib/studyData';

type Props = {
  settings: StudySettings;
  onChange: (settings: StudySettings) => void;
};

export function StudySettingsForm({ settings, onChange }: Props) {
  return (
    <section className="panel discovery-panel setup-card setup-card--profile">
      <div className="setup-kicker">Настройка займёт около минуты</div>
      <div className="section-title"><span className="step">1</span><div><h2>В каком ты классе?</h2><p>Выбери класс — мы покажем предметы школьной программы Казахстана.</p></div></div>
      <div className="visual-settings">
        <div className="selection-group">
          <span className="selection-label">Класс</span>
          <div className="grade-picker" role="group" aria-label="Класс обучения">
            {Array.from({ length: 11 }, (_, index) => index + 1).map((grade) => <button type="button" className={settings.schoolGrade === grade ? 'selected' : ''} aria-pressed={settings.schoolGrade === grade} key={grade} onClick={() => onChange({ ...settings, schoolGrade: grade })}><b>{grade}</b><small>класс</small></button>)}
          </div>
        </div>
      </div>
      <div className="selection-summary"><span>✓</span><p>Выбрано: <b>{settings.schoolGrade} класс</b></p></div>
    </section>
  );
}
