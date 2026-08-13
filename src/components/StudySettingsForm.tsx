import type { StudySettings } from '../lib/studyData';

type Props = {
  settings: StudySettings;
  onChange: (settings: StudySettings) => void;
};

export function StudySettingsForm({ settings, onChange }: Props) {
  const countries: Array<{ name: StudySettings['country']; flag: string; note: string }> = [
    { name: 'Казахстан', flag: '🇰🇿', note: 'Программа 1–11 классов' },
    { name: 'США', flag: '🇺🇸', note: 'Основные школьные предметы' },
  ];

  return (
    <section className="panel discovery-panel">
      <div className="setup-kicker">Настройка займёт около минуты</div>
      <div className="section-title"><span className="step">1</span><div><h2>Начнём с тебя</h2><p>Выбери страну и класс — мы покажем подходящие предметы.</p></div></div>
      <div className="visual-settings">
        <div className="selection-group">
          <span className="selection-label">Где ты учишься?</span>
          <div className="country-picker" role="group" aria-label="Страна обучения">
            {countries.map((country) => <button type="button" className={settings.country === country.name ? 'selected' : ''} aria-pressed={settings.country === country.name} key={country.name} onClick={() => onChange({ ...settings, country: country.name })}><i>{country.flag}</i><span><b>{country.name}</b><small>{country.note}</small></span><em>✓</em></button>)}
          </div>
        </div>
        <div className="selection-group">
          <span className="selection-label">В каком ты классе?</span>
          <div className="grade-picker" role="group" aria-label="Класс обучения">
            {Array.from({ length: 11 }, (_, index) => index + 1).map((grade) => <button type="button" className={settings.schoolGrade === grade ? 'selected' : ''} aria-pressed={settings.schoolGrade === grade} key={grade} onClick={() => onChange({ ...settings, schoolGrade: grade })}><b>{grade}</b><small>класс</small></button>)}
          </div>
        </div>
      </div>
      <div className="selection-summary"><span>✓</span><p>Выбрано: <b>{settings.country} · {settings.schoolGrade} класс</b></p></div>
      {settings.country === 'США' && <p className="accuracy-note">Для США показаны основные дисциплины: точный набор курсов зависит от штата, округа и школы.</p>}
    </section>
  );
}
