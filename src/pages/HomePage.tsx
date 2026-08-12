import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Link, useLocation } from 'wouter';
import { HistoryLink } from '../components/HistoryLink';
import { PlanControls } from '../components/PlanControls';
import { StudySettingsForm } from '../components/StudySettingsForm';
import { SubjectForm } from '../components/SubjectForm';
import { addSubject, loadStudyData, saveStudySettings, type NewSubject, type StudySettings } from '../lib/studyData';
import type { Subject } from '../lib/studyPlanner';
import { supabase } from '../lib/supabase';

const DEFAULT_SETTINGS: StudySettings = { weeklyMinutes: 300, dailyMinutes: 60, studyDaysPerWeek: 5, schoolGrade: 7, schoolQuarter: 1, country: 'Казахстан', region: 'Русский язык обучения' };

export function HomePage() {
  const [, setLocation] = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [settings, setSettings] = useState<StudySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    try {
      const data = await loadStudyData();
      setSubjects(data.subjects);
      setSettings({ weeklyMinutes: data.dailyMinutes * data.studyDaysPerWeek, dailyMinutes: data.dailyMinutes, studyDaysPerWeek: data.studyDaysPerWeek, schoolGrade: data.schoolGrade, schoolQuarter: data.schoolQuarter, country: data.country, region: data.region });
    } catch { setMessage('Не получилось загрузить настройки.'); }
  }, []);

  useEffect(() => {
    async function start() {
      const current = await supabase.auth.getSession();
      const next = current.data.session ? current.data : (await supabase.auth.signInAnonymously()).data;
      setSession(next.session); setLoading(false);
    }
    void start();
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) void refresh(); }, [session, refresh]);

  async function handleAdd(subject: NewSubject) {
    try { await addSubject(subject); await refresh(); setMessage('Предмет добавлен ✓'); }
    catch { setMessage('Не удалось добавить предмет.'); }
  }

  async function createPlan() {
    if (!session) return;
    setBusy(true); setMessage('');
    try {
      await saveStudySettings(session.user.id, settings);
      setLocation('/study');
    } catch { setMessage('Не удалось создать маршрут. Попробуй ещё раз.'); setBusy(false); }
  }

  if (loading) return <main className="centered">Загружаю…</main>;
  if (!session) return <main className="centered">Не удалось запустить приложение.</main>;

  return <main className="app-shell setup-page"><header className="topbar"><div className="brand"><span>◎</span> Фокус</div><div className="top-actions"><HistoryLink /><Link href="/account" className="account-link">{session.user.is_anonymous ? 'Сохранить прогресс · герой 🦊' : 'Мой герой 🦊'}</Link></div></header><section className="hero"><p>Новый учебный маршрут</p><h1>Настрой подготовку</h1><span>Выбери предметы и время — учебные материалы откроются на отдельном экране.</span></section>{message && <button className="toast" onClick={() => setMessage('')}>{message}</button>}<div className="setup-flow"><StudySettingsForm settings={settings} onChange={setSettings} /><SubjectForm onAdd={handleAdd} settings={settings} /><div className="added-summary"><span>✓</span><div><b>Добавлено предметов: {subjects.length}</b><p>Посмотреть или изменить их можно в истории.</p></div><HistoryLink /></div><PlanControls dailyMinutes={settings.dailyMinutes} studyDays={settings.studyDaysPerWeek} hasSubjects={subjects.length > 0} onChange={(dailyMinutes, studyDaysPerWeek) => setSettings({ ...settings, dailyMinutes, studyDaysPerWeek, weeklyMinutes: dailyMinutes * studyDaysPerWeek })} onCreate={createPlan} busy={busy} /></div></main>;
}
