import { useCallback, useEffect, useState } from 'react';
import { Link } from 'wouter';
import { SubjectList } from '../components/SubjectList';
import { loadLessonHistory } from '../lib/dailyLessons';
import { deleteSubject, loadStudyData, updateSubject, type NewSubject } from '../lib/studyData';
import type { Subject } from '../lib/studyPlanner';
import { supabase } from '../lib/supabase';

type HistoryDay = { dayNumber: number; title: string; createdAt: string };

export function HistoryPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [days, setDays] = useState<HistoryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    try {
      const [studyData, lessonDays] = await Promise.all([loadStudyData(), loadLessonHistory()]);
      setSubjects(studyData.subjects); setDays(lessonDays);
    } catch { setMessage('Не удалось загрузить историю.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    async function load() {
      const current = await supabase.auth.getSession();
      if (!current.data.session) await supabase.auth.signInAnonymously();
      await refresh();
    }
    void load();
  }, [refresh]);

  async function remove(id: string) {
    try { await deleteSubject(id); setMessage('Предмет удалён.'); }
    catch { setMessage('Не удалось полностью удалить предмет. Обнови страницу и попробуй ещё раз.'); }
    finally { await refresh(); }
  }

  async function edit(id: string, subject: NewSubject) {
    try { await updateSubject(id, subject); setMessage('Предмет обновлён.'); await refresh(); }
    catch (error) { setMessage('Не удалось обновить предмет.'); throw error; }
  }

  if (loading) return <main className="centered">Собираю историю…</main>;
  return (
    <main className="history-page">
      <header className="practice-header">
        <Link href="/setup">← К настройке</Link>
        <div className="top-actions"><Link href="/mistakes" className="mistakes-history-button">Работа над ошибками ✦</Link><div className="brand"><span>◎</span> Трек</div></div>
      </header>
      <section className="history-hero">
        <span>↺</span>
        <div><p>Твоя история</p><h1>Всё обучение в одном месте</h1><small>Предметы, экзамены и уже созданные учебные дни.</small></div>
      </section>
      {message && <p className="account-message">{message}</p>}
      <div className="history-grid">
        <section className="history-panel">
          <div className="history-heading"><div><span>Предметы</span><h2>Мои экзамены</h2></div><Link href="/setup">+ Добавить</Link></div>
          <SubjectList subjects={subjects} onDelete={remove} onUpdate={edit} />
        </section>
        <section className="history-panel">
          <div className="history-heading"><div><span>Маршрут</span><h2>Учебные дни</h2></div><Link href="/study">Продолжить →</Link></div>
          {days.length === 0 ? <div className="empty-state">Пройденных дней пока нет.</div> : (
            <div className="history-days">
              {days.map((day) => (
                <Link href={`/study?day=${day.dayNumber}`} className="history-day" key={day.dayNumber}>
                  <b>{day.dayNumber}</b><div><strong>День {day.dayNumber}: {day.title}</strong><span>Создан {new Date(day.createdAt).toLocaleDateString('ru-RU')}</span></div><i>→</i>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
