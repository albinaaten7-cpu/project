import { useMemo, useState } from 'react';
import type { AdminStudent } from '../lib/adminStudents';

type UserFilter = 'all' | 'needs_help' | 'new' | 'inactive';

export function AdminUserDirectory({ students, selectedId, onSelect }: { students: AdminStudent[]; selectedId: string | null; onSelect: (student: AdminStudent) => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<UserFilter>('all');
  const visible = useMemo(() => students.filter((student) => {
    const text = `${student.name} ${student.nickname} ${student.email}`.toLowerCase();
    if (!text.includes(query.trim().toLowerCase())) return false;
    const accuracy = student.answers ? student.correctAnswers / student.answers : 1;
    const daysSinceRegistration = (Date.now() - new Date(student.registeredAt).getTime()) / 86400000;
    const daysSinceLogin = student.lastSignInAt ? (Date.now() - new Date(student.lastSignInAt).getTime()) / 86400000 : 999;
    if (filter === 'needs_help') return student.answers >= 3 && accuracy < .6;
    if (filter === 'new') return daysSinceRegistration <= 7;
    if (filter === 'inactive') return daysSinceLogin > 7;
    return true;
  }), [filter, query, students]);

  return (
    <section className="admin-students">
      <div className="admin-heading"><div><span>Пользователи</span><h2>Все зарегистрированные</h2></div><b>{students.length}</b></div>
      <div className="admin-user-tools"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по имени, нику или email" /><select value={filter} onChange={(event) => setFilter(event.target.value as UserFilter)}><option value="all">Все ученики</option><option value="needs_help">Нужна помощь</option><option value="new">Новые за 7 дней</option><option value="inactive">Не заходили 7 дней</option></select></div>
      {visible.length ? <div className="admin-student-list">{visible.map((student) => {
        const accuracy = student.answers ? Math.round((student.correctAnswers / student.answers) * 100) : 0;
        const needsHelp = student.answers >= 3 && accuracy < 60;
        return <button type="button" className={`admin-student ${selectedId === student.userId ? 'is-selected' : ''}`} key={student.userId} onClick={() => onSelect(student)}><div><strong>{student.name}</strong><span>@{student.nickname} · {student.email}</span>{needsHelp && <em>Нужна помощь</em>}</div><p><b>{student.xp}</b><span>XP</span></p><p><b>{student.completedLessons}</b><span>уроков</span></p><p><b>{accuracy}%</b><span>точность</span></p></button>;
      })}</div> : <p className="admin-empty">По этому запросу никого нет.</p>}
    </section>
  );
}
