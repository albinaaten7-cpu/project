import { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Link, useLocation } from 'wouter';
import { HistoryLink } from './HistoryLink';

export function SiteHeader({ session = null, setupMode = false }: { session?: Session | null; setupMode?: boolean }) {
  const [, setLocation] = useLocation();
  const [transitioning, setTransitioning] = useState(false);

  function startPlan(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (transitioning) return;
    setTransitioning(true);
    window.setTimeout(() => setLocation('/setup'), 480);
  }

  return (
    <>
      <header className="site-header">
        <Link href="/" className="brand"><span>◎</span> Вектор</Link>
        <nav>
          {setupMode ? <Link href="/" className="nav-home">← На главную</Link> : <Link href="/setup" className="nav-start" onClick={startPlan}>Начать свой план</Link>}
          <HistoryLink />
          <Link href="/account" className="account-link">{!session || session.user.is_anonymous ? 'Вход / регистрация' : 'Профиль'}</Link>
        </nav>
      </header>
      {transitioning && <div className="route-whoop" aria-hidden="true"><span>◎</span><b>Создаём твой маршрут</b></div>}
    </>
  );
}
