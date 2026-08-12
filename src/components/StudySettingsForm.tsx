import type { StudySettings } from '../lib/studyData';

type Props = {
  settings: StudySettings;
  onChange: (settings: StudySettings) => void;
};

export function StudySettingsForm({ settings, onChange }: Props) {
  function change(field: keyof StudySettings, value: number | string) {
    onChange({ ...settings, [field]: value });
  }

  function changeCountry(country: StudySettings['country']) {
    onChange({ ...settings, country, region: country === 'Казахстан' ? 'Русский язык обучения' : 'California' });
  }

  return (
    <section className="panel">
      <div className="section-title"><span className="step">1</span><div><h2>Где ты учишься?</h2><p>От этого зависит список доступных предметов.</p></div></div>
      <div className="settings-grid">
        <label>Страна<select value={settings.country} onChange={(event) => changeCountry(event.target.value as StudySettings['country'])}><option>Казахстан</option><option>США</option></select></label>
        {settings.country === 'Казахстан' ? (
          <label>Программа<select value={settings.region} onChange={(event) => change('region', event.target.value)}><option>Русский язык обучения</option><option>Казахский язык обучения</option></select></label>
        ) : (
          <label>Штат<input value={settings.region} onChange={(event) => change('region', event.target.value)} placeholder="Например, California" maxLength={80} required /></label>
        )}
        <label>Класс<select value={settings.schoolGrade} onChange={(event) => change('schoolGrade', Number(event.target.value))}>{Array.from({ length: 11 }, (_, index) => index + 1).map((grade) => <option key={grade} value={grade}>{grade} класс</option>)}</select></label>
        <label>Четверть<select value={settings.schoolQuarter} onChange={(event) => change('schoolQuarter', Number(event.target.value))}>{[1, 2, 3, 4].map((quarter) => <option key={quarter} value={quarter}>{quarter} четверть</option>)}</select></label>
      </div>
      <p className="accuracy-note">Для США показаны основные дисциплины: точный набор курсов зависит от штата, округа и школы.</p>
    </section>
  );
}
