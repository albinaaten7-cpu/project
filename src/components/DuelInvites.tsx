import { Link } from 'wouter';
import type { DiscoveredUser, Duel } from '../lib/friends';

export function DuelInvites({ duels, users, currentUserId, onRespond }: { duels: Duel[]; users: DiscoveredUser[]; currentUserId: string; onRespond: (id: string, accept: boolean) => Promise<void> }) {
  const findUser = (id: string) => users.find((user) => user.userId === id);
  const visible = duels.filter((duel) => duel.status !== 'declined').slice(0, 8);
  return (
    <section className="duel-invites">
      <div className="friends-heading"><div><span>Квиз-баттлы</span><h2>Приглашения и результаты</h2></div><b>{visible.length}</b></div>
      {visible.length ? <div className="duel-list">{visible.map((duel) => {
        const opponentId = duel.challengerId === currentUserId ? duel.opponentId : duel.challengerId;
        const opponent = findUser(opponentId);
        const incoming = duel.status === 'pending' && duel.opponentId === currentUserId;
        return <article key={duel.id}><span className={`duel-icon duel-icon--${duel.status}`}>⚡</span><div><strong>{opponent?.displayName ?? 'Соперник'}</strong><small>{duel.status === 'pending' ? incoming ? 'Бросает тебе вызов' : 'Ждём ответа' : duel.status === 'active' ? 'Баттл начался' : `Счёт ${duel.challengerScore ?? 0}:${duel.opponentScore ?? 0}`}</small></div>{incoming ? <div className="duel-actions"><button onClick={() => void onRespond(duel.id, true)}>Принять</button><button className="ghost" onClick={() => void onRespond(duel.id, false)}>×</button></div> : duel.status === 'active' ? <Link href={`/duel/${duel.id}`}>Играть →</Link> : duel.status === 'completed' ? <Link href={`/duel/${duel.id}`}>Результат</Link> : <span className="duel-waiting">Отправлено</span>}</article>;
      })}</div> : <p className="friends-list-empty">Дуэлей пока нет. Найди соперника рядом и брось вызов.</p>}
    </section>
  );
}
