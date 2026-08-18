import type { DiscoveredUser, Friendship } from '../lib/friends';

type Props = {
  users: DiscoveredUser[]; friendships: Friendship[]; currentUserId: string;
  query: string; onQuery: (value: string) => void;
  onAdd: (user: DiscoveredUser) => Promise<void>; onDuel: (user: DiscoveredUser) => Promise<void>;
};

export function FriendDiscovery({ users, friendships, currentUserId, query, onQuery, onAdd, onDuel }: Props) {
  const nearbyLimit = Date.now() - 15 * 60 * 1000;
  const visible = query.trim() ? users : users.filter((user) => user.lastSeenAt && Date.parse(user.lastSeenAt) >= nearbyLimit);
  function friendshipFor(userId: string) { return friendships.find((item) => item.requesterId === userId || item.addresseeId === userId); }

  return (
    <section className="friend-discovery">
      <div className="friends-heading"><div><span>{query ? 'Поиск' : 'Рядом сейчас'}</span><h2>{query ? 'Найти пользователя' : 'Кого позвать на баттл?'}</h2></div><b>{visible.length}</b></div>
      <label className="friend-search"><span>⌕</span><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Имя или никнейм" /></label>
      {visible.length ? <div className="nearby-users">{visible.map((user) => {
        const friendship = friendshipFor(user.userId);
        const isFriend = friendship?.status === 'accepted';
        const sent = friendship?.status === 'pending' && friendship.requesterId === currentUserId;
        return <article key={user.userId}><div className="nearby-avatar"><span>{user.displayName.slice(0, 1).toUpperCase()}</span>{user.lastSeenAt && Date.parse(user.lastSeenAt) >= nearbyLimit && <i />}</div><div><strong>{user.displayName}</strong><small>@{user.nickname} · {user.xp} XP</small></div><div className="nearby-actions"><button onClick={() => void onDuel(user)}>⚡ Баттл</button>{!friendship && <button className="ghost" onClick={() => void onAdd(user)}>+ В друзья</button>}{sent && <span>Запрос отправлен</span>}{isFriend && <span>✓ Друг</span>}</div></article>;
      })}</div> : <div className="friends-empty"><span>⌁</span><h3>{query ? 'Никого не нашли' : 'Пока никого рядом'}</h3><p>{query ? 'Проверь никнейм и попробуй ещё раз.' : 'Активные ученики появятся здесь, как устройства в AirDrop.'}</p></div>}
    </section>
  );
}
