import type { DiscoveredUser, Friendship } from '../lib/friends';

export function FriendRequests({ friendships, users, currentUserId, onRespond }: { friendships: Friendship[]; users: DiscoveredUser[]; currentUserId: string; onRespond: (id: string, accept: boolean) => Promise<void> }) {
  const incoming = friendships.filter((item) => item.status === 'pending' && item.addresseeId === currentUserId);
  const friends = friendships.filter((item) => item.status === 'accepted');
  const findUser = (id: string) => users.find((user) => user.userId === id);
  return (
    <section className="friends-list-panel">
      {incoming.length > 0 && <div className="friend-requests"><div className="friends-heading"><div><span>Запросы</span><h2>Хотят дружить</h2></div><b>{incoming.length}</b></div>{incoming.map((item) => { const user = findUser(item.requesterId); return <article key={item.id}><div className="mini-avatar">{user?.displayName.slice(0, 1) ?? '?'}</div><div><strong>{user?.displayName ?? 'Ученик'}</strong><small>@{user?.nickname ?? 'пользователь'}</small></div><button onClick={() => void onRespond(item.id, true)}>Принять</button><button className="ghost" onClick={() => void onRespond(item.id, false)}>×</button></article>; })}</div>}
      <div className="friends-heading"><div><span>Моя команда</span><h2>Друзья</h2></div><b>{friends.length}</b></div>
      {friends.length ? <div className="accepted-friends">{friends.map((item) => { const friendId = item.requesterId === currentUserId ? item.addresseeId : item.requesterId; const user = findUser(friendId); return <article key={item.id}><div className="mini-avatar">{user?.displayName.slice(0, 1) ?? '?'}</div><div><strong>{user?.displayName ?? 'Ученик'}</strong><small>@{user?.nickname ?? 'пользователь'}</small></div><span>{user?.xp ?? 0} XP</span></article>; })}</div> : <p className="friends-list-empty">Добавь первого друга через поиск или раздел «Рядом».</p>}
    </section>
  );
}
