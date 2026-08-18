import { useCallback, useEffect, useState } from 'react';
import { loadAccountNotifications, markAccountNotificationRead, type AccountNotification } from '../lib/accountNotifications';

export function NotificationBell() {
  const [items, setItems] = useState<AccountNotification[]>([]);
  const [selected, setSelected] = useState<AccountNotification | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try { setItems(await loadAccountNotifications()); setError(''); }
    catch { setError('Не удалось загрузить сообщения.'); }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 15000);
    const onFocus = () => void load();
    window.addEventListener('focus', onFocus);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', onFocus); };
  }, [load]);

  async function openMessage(item: AccountNotification) {
    setSelected(item);
    if (!item.isRead) {
      try { await markAccountNotificationRead(item); setItems((current) => current.map((entry) => entry.id === item.id && entry.source === item.source ? { ...entry, isRead: true } : entry)); }
      catch { setError('Не удалось отметить сообщение прочитанным.'); }
    }
  }

  const unread = items.filter((item) => !item.isRead).length;
  return (
    <>
      <button className="notification-bell" type="button" aria-label={`Сообщения: ${unread} непрочитанных`} onClick={() => { setOpen(true); setSelected(null); void load(); }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>{unread > 0 && <b>{unread > 9 ? '9+' : unread}</b>}</button>
      {open && <div className="notification-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className="notification-center" role="dialog" aria-modal="true" aria-label="Сообщения"><header>{selected ? <button className="notification-back" onClick={() => setSelected(null)}>←</button> : <div><span>Почта</span><h2>Сообщения</h2></div>}<button className="notification-close" onClick={() => setOpen(false)} aria-label="Закрыть">×</button></header>{selected ? <article className="notification-letter"><span>От: ADMINENTER</span><h3>{selected.subject}</h3><small>{new Date(selected.createdAt).toLocaleString('ru-RU')}</small>{selected.context && <blockquote><b>Твоё обращение</b>{selected.context}</blockquote>}<p>{selected.body}</p></article> : <div className="notification-list">{error && <p className="notification-error">{error}</p>}{items.length ? items.map((item) => <button type="button" key={`${item.source}-${item.id}`} className={item.isRead ? '' : 'is-unread'} onClick={() => void openMessage(item)}><i /><div><strong>ADMINENTER</strong><b>{item.subject}</b><p>{item.body}</p></div><time>{new Date(item.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}</time></button>) : !error && <div className="notification-empty"><span>✉</span><h3>Сообщений пока нет</h3><p>Ответы и советы администратора появятся здесь.</p></div>}</div>}</section></div>}
    </>
  );
}
