import { loadMyFeedback, loadMySupportMessages, markFeedbackReplyRead, markSupportMessageRead } from './feedback';

export type AccountNotification = {
  id: string; source: 'support' | 'feedback'; subject: string;
  body: string; context: string | null; createdAt: string; isRead: boolean;
};

export async function loadAccountNotifications(): Promise<AccountNotification[]> {
  const [support, feedback] = await Promise.all([loadMySupportMessages(), loadMyFeedback()]);
  return [
    ...support.map((item): AccountNotification => ({ id: item.id, source: 'support', subject: 'Сообщение от администратора', body: item.message, context: null, createdAt: item.createdAt, isRead: Boolean(item.readAt) })),
    ...feedback.filter((item) => item.adminReply).map((item): AccountNotification => ({ id: item.id, source: 'feedback', subject: 'Ответ на твоё обращение', body: item.adminReply ?? '', context: item.message, createdAt: item.updatedAt, isRead: Boolean(item.replyReadAt) })),
  ].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function markAccountNotificationRead(item: AccountNotification) {
  if (item.isRead) return;
  if (item.source === 'support') await markSupportMessageRead(item.id);
  else await markFeedbackReplyRead(item.id);
}
