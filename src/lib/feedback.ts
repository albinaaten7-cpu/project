import { supabase } from './supabase';

export type FeedbackCategory = 'problem' | 'idea' | 'question';
export type FeedbackStatus = 'open' | 'in_progress' | 'resolved';
export type FeedbackItem = {
  id: string; userId: string; category: FeedbackCategory; message: string;
  status: FeedbackStatus; adminReply: string | null; createdAt: string;
};
export type SupportMessage = { id: string; userId: string; message: string; createdAt: string };

function mapFeedback(row: Record<string, unknown>): FeedbackItem {
  return { id: String(row.id), userId: String(row.user_id), category: row.category as FeedbackCategory, message: String(row.message), status: row.status as FeedbackStatus, adminReply: row.admin_reply ? String(row.admin_reply) : null, createdAt: String(row.created_at) };
}

export async function loadMyFeedback() {
  const { data, error } = await supabase.from('feedback').select('id, user_id, category, message, status, admin_reply, created_at').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapFeedback);
}

export async function createFeedback(category: FeedbackCategory, message: string) {
  const { error } = await supabase.from('feedback').insert({ category, message: message.trim() });
  if (error) throw error;
}

export async function loadMySupportMessages() {
  const { data, error } = await supabase.from('support_messages').select('id, user_id, message, created_at').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({ id: row.id, userId: row.user_id, message: row.message, createdAt: row.created_at })) as SupportMessage[];
}

export async function loadAllFeedback() {
  const { data, error } = await supabase.from('feedback').select('id, user_id, category, message, status, admin_reply, created_at').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapFeedback);
}

export async function answerFeedback(id: string, adminReply: string, status: FeedbackStatus) {
  const { error } = await supabase.from('feedback').update({ admin_reply: adminReply.trim(), status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function sendSupportMessage(userId: string, message: string) {
  const { error } = await supabase.from('support_messages').insert({ user_id: userId, message: message.trim() });
  if (error) throw error;
}
