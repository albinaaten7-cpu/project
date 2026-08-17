import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { PlanControls } from '../components/PlanControls';
import { SiteHeader } from '../components/SiteHeader';
import { StudySettingsForm } from '../components/StudySettingsForm';
import { SubjectForm } from '../components/SubjectForm';
import { addSubject, clearGeneratedRoute, loadStudyData, saveStudySettings, type NewSubject, type StudySettings } from '../lib/studyData';
import type { Subject } from '../lib/studyPlanner';
import { useAppSession } from '../lib/useAppSession';

const DEFAULT_SETTINGS: StudySettings = { weeklyMinutes: 300, dailyMinutes: 60, studyDaysPerWeek: 5, planDays: 20, schoolGrade: 7, schoolQuarter: 1, country: 'Казахстан', region: 'Русский язык обучения' };

export function SetupPage() {
  const [, setLocation] = useLocation();
  const { session, loading } = useAppSession();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [settings, setSettings] = useState<StudySettings>(DEFAULT_SETTINGS);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    try {
      const data = await loadStudyData();
      setSubjects(data.subjects);
      setSettings({ weeklyMinutes: data.dailyMinutes * data.studyDaysPerWeek, dailyMinutes: data.dailyMinutes, studyDaysPerWeek: data.studyDaysPerWeek, planDays: data.planDays, schoolGrade: data.schoolGrade, schoolQuarter: data.schoolQuarter, country: data.country, region: data.region });
    } catch { setMessage('Не получилось загрузить настройки.'); }
  }, []);

  useEffect(() => { if (session) void refresh(); }, [session, refresh]);

  async function handleAdd(subject: NewSubject) {
    try { await addSubject(subject); await refresh(); setMessage('Предмет добавлен ✓'); }
    catch { setMessage('Не удалось добавить предмет.'); }
  }

  async function createPlan() {
    if (!session) return;
    setBusy(true); setMessage('');
    try { await saveStudySettings(session.user.id, settings); await clearGeneratedRoute(); setLocation('/diagnostic'); }
    catch { setMessage('Не удалось создать маршрут. Попробуй ещё раз.'); setBusy(false); }
  }

  if (loading) return <main className="centered">Загружаю…</main>;
  if (!session) return <main className="centered">Не удалось запустить приложение.</main>;
  return <main className="app-shell setup-page"><SiteHeader session={session} setupMode /><section className="setup-heading"><span>Персональный маршрут</span><h1>Соберём твой учебный план</h1><p>Три коротких шага — и можно переходить к первому уроку.</p></section>{message && <button className="toast" onClick={() => setMessage('')}>{message}</button>}<div className="setup-flow"><StudySettingsForm settings={settings} onChange={setSettings} /><SubjectForm onAdd={handleAdd} settings={settings} /><div className="added-summary"><span>✓</span><div><b>Добавлено предметов: {subjects.length}</b><p>Посмотреть или изменить их можно в истории.</p></div></div><PlanControls dailyMinutes={settings.dailyMinutes} planDays={settings.planDays} hasSubjects={subjects.length > 0} onChange={(dailyMinutes, planDays) => setSettings({ ...settings, dailyMinutes, planDays, weeklyMinutes: dailyMinutes * settings.studyDaysPerWeek })} onCreate={createPlan} busy={busy} /></div></main>;
}
