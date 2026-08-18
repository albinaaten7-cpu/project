import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { QuizRound } from '../components/QuizRound';
import { discoverUsers, loadDuel, respondToDuel, submitDuelScore, type Duel } from '../lib/friends';
import { supabase } from '../lib/supabase';

export function DuelPage({ duelId }: { duelId: string }) {
  const [duel, setDuel] = useState<Duel | null>(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [opponentName, setOpponentName] = useState('Соперник');
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function refresh() { try { setDuel(await loadDuel(duelId)); } catch { setMessage('Дуэль не найдена.'); } }

  useEffect(() => {
    async function start() {
      const { data } = await supabase.auth.getUser();
      if (!data.user || data.user.is_anonymous) { setMessage('Сначала войди в аккаунт.'); setLoading(false); return; }
      setCurrentUserId(data.user.id);
      try {
        const [nextDuel, users] = await Promise.all([loadDuel(duelId), discoverUsers()]);
        setDuel(nextDuel);
        const opponentId = nextDuel.challengerId === data.user.id ? nextDuel.opponentId : nextDuel.challengerId;
        setOpponentName(users.find((user) => user.userId === opponentId)?.displayName ?? 'Соперник');
      } catch { setMessage('Не удалось открыть дуэль.'); }
      finally { setLoading(false); }
    }
    void start();
  }, [duelId]);

  useEffect(() => {
    if (!duel || duel.status === 'completed' || duel.status === 'declined') return;
    const timer = window.setInterval(() => void refresh(), 4000);
    return () => window.clearInterval(timer);
  }, [duel?.status, duelId]);

  async function answerInvite(accept: boolean) {
    try { await respondToDuel(duelId, accept); await refresh(); }
    catch { setMessage('Не получилось ответить на приглашение.'); }
  }

  function answer(correct: boolean) { if (correct) setScore((value) => value + 10); }
  async function next() {
    if (!duel) return;
    const nextIndex = index + 1;
    setIndex(nextIndex);
    if (nextIndex >= duel.questions.length) {
      try { await submitDuelScore(duel.id, score); await refresh(); }
      catch { setMessage('Не удалось сохранить результат.'); }
    }
  }

  if (loading) return <main className="centered">Подключаемся к дуэли…</main>;
  if (!duel || !currentUserId) return <main className="duel-page"><section className="duel-state"><h1>Дуэль недоступна</h1><p>{message}</p><Link href="/friends">К друзьям</Link></section></main>;
  const incoming = duel.opponentId === currentUserId;
  const ownScore = duel.challengerId === currentUserId ? duel.challengerScore : duel.opponentScore;
  const rivalScore = duel.challengerId === currentUserId ? duel.opponentScore : duel.challengerScore;
  const ownFinished = duel.challengerId === currentUserId ? duel.challengerFinishedAt : duel.opponentFinishedAt;
  if (duel.status === 'pending') return <main className="duel-page"><header className="duel-header"><Link href="/friends">← Друзья</Link><b>⚡ Дуэль</b></header><section className="duel-state duel-invite-state"><span>⚡</span><h1>{incoming ? `${opponentName} бросает тебе вызов!` : `Вызов для ${opponentName} отправлен`}</h1><p>{incoming ? 'Пять одинаковых вопросов. Победит тот, кто даст больше правильных ответов.' : 'Мы сообщим, когда соперник примет приглашение.'}</p>{incoming && <div><button onClick={() => void answerInvite(true)}>Принять вызов</button><button className="ghost" onClick={() => void answerInvite(false)}>Отказаться</button></div>}</section></main>;
  if (duel.status === 'declined') return <main className="duel-page"><section className="duel-state"><span>🤝</span><h1>Вызов отклонён</h1><p>Можно выбрать другого соперника и попробовать снова.</p><Link href="/friends">Найти соперника</Link></section></main>;
  if (duel.status === 'completed') { const won = duel.winnerId === currentUserId; const draw = duel.winnerId === null; return <main className="duel-page"><section className="duel-state duel-result"><span>{draw ? '🤝' : won ? '🏆' : '🎯'}</span><h1>{draw ? 'Ничья!' : won ? 'Ты победил!' : `${opponentName} победил`}</h1><div><b>{ownScore ?? 0}</b><i>:</i><b>{rivalScore ?? 0}</b></div><p>Отличный баттл! Можно сыграть ещё раз с этим или другим другом.</p><Link href="/friends">Вернуться к друзьям</Link></section></main>; }
  if (ownFinished) return <main className="duel-page"><section className="duel-state"><span className="duel-pulse">⚡</span><h1>Твой результат: {ownScore} XP</h1><p>Ждём, когда {opponentName} закончит квиз…</p><Link href="/friends">К друзьям</Link></section></main>;
  return <main className="duel-page"><header className="duel-header"><Link href="/friends">← Выйти</Link><b>⚡ Ты против {opponentName}</b><span>{score} XP</span></header><div className="duel-progress"><i style={{ width: `${(index / duel.questions.length) * 100}%` }} /></div><p className="duel-round">Вопрос {index + 1} из {duel.questions.length}</p>{index < duel.questions.length && <QuizRound key={index} question={duel.questions[index]} onAnswer={answer} onNext={() => void next()} isLast={index === duel.questions.length - 1} />}{message && <p className="account-message">{message}</p>}</main>;
}
