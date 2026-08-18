import { Link } from 'wouter';
import { useAppSession } from '../lib/useAppSession';

const actions = [
  { href: '/study', icon: '▶', title: 'Продолжить учёбу', text: 'Открой следующий день своего маршрута.', tone: 'primary' },
  { href: '/history#subjects', icon: '▤', title: 'Мои предметы', text: 'Посмотри темы, оценки и измени предметы.', tone: 'plain' },
  { href: '/history#days', icon: '↺', title: 'История', text: 'Вернись к уже созданным учебным дням.', tone: 'plain' },
  { href: '/mistakes', icon: '✦', title: 'Работа над ошибками', text: 'Повтори вопросы, в которых было сложно.', tone: 'warm' },
  { href: '/friends', icon: '👋', title: 'Друзья', text: 'Найди знакомых по имени или никнейму.', tone: 'warm' },
  { href: '/setup', icon: '+', title: 'Настроить план', text: 'Добавь предмет или выбери новый ритм.', tone: 'plain' },
] as const;

export function DashboardPage() {
  const { session, loading } = useAppSession();
  const accountLabel = !session || session.user.is_anonymous ? 'Вход / регистрация' : 'Профиль';

  if (loading) return <main className="centered">Открываю Трек…</main>;
  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link href="/dashboard" className="brand"><span>◎</span> Трек</Link>
        <div><Link href="/?intro=1">Как это работает?</Link><Link href="/account" className="dashboard-account">{accountLabel}</Link></div>
      </header>
      <section className="dashboard-intro"><span>Твоё пространство</span><h1>С чего начнём?</h1><p>Выбери действие — всё нужное для учёбы теперь находится здесь.</p></section>
      <section className="dashboard-actions" aria-label="Разделы приложения">
        {actions.map((action) => <Link href={action.href} className={`dashboard-action dashboard-action--${action.tone}`} key={action.title}><i>{action.icon}</i><div><h2>{action.title}</h2><p>{action.text}</p></div><b>→</b></Link>)}
      </section>
    </main>
  );
}
