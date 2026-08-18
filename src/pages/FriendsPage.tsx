import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { DuelInvites } from '../components/DuelInvites';
import { FriendDiscovery } from '../components/FriendDiscovery';
import { FriendRequests } from '../components/FriendRequests';
import { createDuel, discoverUsers, loadDuels, loadFriendships, respondToDuel, respondToFriendRequest, sendFriendRequest, touchPresence, type DiscoveredUser, type Duel, type Friendship } from '../lib/friends';
import { DUEL_QUESTIONS } from '../lib/duelQuestions';
import { supabase } from '../lib/supabase';

export function FriendsPage() {
  const [, setLocation] = useLocation();
  const [currentUserId, setCurrentUserId] = useState('');
  const [users, setUsers] = useState<DiscoveredUser[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [duels, setDuels] = useState<Duel[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function refresh() {
    const [nextUsers, nextFriendships, nextDuels] = await Promise.all([discoverUsers(query), loadFriendships(), loadDuels()]);
    setUsers(nextUsers); setFriendships(nextFriendships); setDuels(nextDuels);
  }

  useEffect(() => {
    async function start() {
      const { data } = await supabase.auth.getUser();
      if (!data.user || data.user.is_anonymous) { setLoading(false); return; }
      setCurrentUserId(data.user.id);
      try { await touchPresence(); await refresh(); }
      catch { setMessage('Не удалось загрузить друзей. Попробуй обновить страницу.'); }
      finally { setLoading(false); }
    }
    void start();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    const timer = window.setTimeout(() => void discoverUsers(query).then(setUsers).catch(() => undefined), 300);
    return () => window.clearTimeout(timer);
  }, [currentUserId, query]);

  async function run(action: () => Promise<void>, success: string) {
    setMessage('');
    try { await action(); setMessage(success); await refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не получилось выполнить действие.'); }
  }

  async function challenge(user: DiscoveredUser) {
    try { const id = await createDuel(user.userId, DUEL_QUESTIONS); setLocation(`/duel/${id}`); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не удалось создать дуэль.'); }
  }

  if (loading) return <main className="centered">Ищем друзей рядом…</main>;
  if (!currentUserId) return <main className="friends-page"><section className="friends-auth"><span>👋</span><h1>Войди, чтобы найти друзей</h1><p>Дуэли и запросы в друзья доступны зарегистрированным ученикам.</p><Link href="/account">Войти в аккаунт</Link></section></main>;
  return (
    <main className="friends-page">
      <header className="friends-header"><Link href="/dashboard">← Назад</Link><div className="brand"><span>◎</span> Трек</div><Link href="/account">Профиль</Link></header>
      <section className="friends-hero"><div><span>Учиться вместе веселее</span><h1>Друзья и дуэли</h1><p>Найди соперника рядом и узнай, кто быстрее справится с квизом.</p></div><div className="airdrop-radar" aria-hidden="true"><i /><i /><i /><b>⚡</b></div></section>
      {message && <button className="friends-toast" onClick={() => setMessage('')}>{message}</button>}
      <div className="friends-layout"><FriendDiscovery users={users} friendships={friendships} currentUserId={currentUserId} query={query} onQuery={setQuery} onAdd={(user) => run(() => sendFriendRequest(user.userId), `Запрос для ${user.displayName} отправлен`)} onDuel={challenge} /><FriendRequests friendships={friendships} users={users} currentUserId={currentUserId} onRespond={(id, accept) => run(() => respondToFriendRequest(id, accept), accept ? 'Теперь вы друзья!' : 'Запрос отклонён')} /></div>
      <DuelInvites duels={duels} users={users} currentUserId={currentUserId} onRespond={async (id, accept) => { await run(() => respondToDuel(id, accept), accept ? 'Вызов принят!' : 'Вызов отклонён'); if (accept) setLocation(`/duel/${id}`); }} />
    </main>
  );
}
