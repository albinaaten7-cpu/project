import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { isAdmin } from '../lib/adminAuth';
import { loadAdminStudents, type AdminStudent } from '../lib/adminStudents';
import { supabase } from '../lib/supabase';
import { AdminUserDirectory } from '../components/AdminUserDirectory';
import { AdminHelpPanel } from '../components/AdminHelpPanel';
import { AdminFeedbackQueue } from '../components/AdminFeedbackQueue';
import { loadAllFeedback, type FeedbackItem } from '../lib/feedback';

export function AdminPage() {
  const [, setLocation] = useLocation();
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [selected, setSelected] = useState<AdminStudent | null>(null);

  async function loadWorkspace(adminUserId: string) {
    const [nextStudents, nextFeedback] = await Promise.all([loadAdminStudents(adminUserId), loadAllFeedback()]);
    setStudents(nextStudents); setFeedback(nextFeedback);
    setSelected((current) => current ? nextStudents.find((student) => student.userId === current.userId) ?? null : null);
  }

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!isAdmin(user) || !user) { setLocation('/account'); return; }
      try { await loadWorkspace(user.id); }
      catch (error) { setMessage(error instanceof Error ? error.message : 'Не удалось загрузить учеников.'); }
      finally { setLoading(false); }
    }
    void load();
  }, [setLocation]);

  if (loading) return <main className="centered">Открываю аккаунт…</main>;
  return (
    <main className="admin-page">
      <header className="practice-header"><Link href="/">← На главную</Link><Link href="/account">Аккаунт</Link></header>
      <section className="admin-hero"><span>Аккаунт разработчика</span><h1>ADMINENTER</h1><p>Здесь можно смотреть продвижение учеников.</p></section>
      <div className="admin-workspace"><AdminUserDirectory students={students} selectedId={selected?.userId ?? null} onSelect={setSelected} /><AdminHelpPanel student={selected} /></div>
      <AdminFeedbackQueue feedback={feedback} students={students} onUpdated={async () => {
        const { data } = await supabase.auth.getUser();
        if (data.user) await loadWorkspace(data.user.id);
      }} />
      {message && <p className="account-message">{message}</p>}
    </main>
  );
}
