import type { PracticeQuestion } from './practice';
import { supabase } from './supabase';

export type DiscoveredUser = { userId: string; displayName: string; nickname: string; xp: number; lastSeenAt: string | null };
export type Friendship = { id: string; requesterId: string; addresseeId: string; status: 'pending' | 'accepted' | 'declined'; createdAt: string };
export type Duel = { id: string; challengerId: string; opponentId: string; status: 'pending' | 'active' | 'declined' | 'completed'; questions: PracticeQuestion[]; challengerScore: number | null; opponentScore: number | null; winnerId: string | null; challengerFinishedAt: string | null; opponentFinishedAt: string | null; createdAt: string };

export async function touchPresence() {
  const { data } = await supabase.auth.getSession();
  if (!data.session || data.session.user.is_anonymous) return;
  const { error } = await supabase.from('user_presence').upsert({ user_id: data.session.user.id, last_seen_at: new Date().toISOString() });
  if (error) throw error;
}

export async function discoverUsers(query = ''): Promise<DiscoveredUser[]> {
  const { data, error } = await supabase.rpc('discover_users', { p_query: query });
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => ({ userId: String(row.user_id), displayName: String(row.display_name), nickname: String(row.nickname), xp: Number(row.xp), lastSeenAt: row.last_seen_at ? String(row.last_seen_at) : null }));
}

export async function loadFriendships(): Promise<Friendship[]> {
  const { data, error } = await supabase.from('friendships').select('id, requester_id, addressee_id, status, created_at').neq('status', 'declined').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({ id: row.id, requesterId: row.requester_id, addresseeId: row.addressee_id, status: row.status, createdAt: row.created_at })) as Friendship[];
}

export async function sendFriendRequest(addresseeId: string) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Сначала войди в аккаунт');
  const { error } = await supabase.from('friendships').insert({ requester_id: data.user.id, addressee_id: addresseeId });
  if (error) throw error;
}

export async function respondToFriendRequest(id: string, accept: boolean) {
  const { error } = await supabase.rpc('respond_to_friend_request', { p_friendship_id: id, p_accept: accept });
  if (error) throw error;
}

export async function loadDuels(): Promise<Duel[]> {
  const { data, error } = await supabase.from('duels').select('id, challenger_id, opponent_id, status, questions, challenger_score, opponent_score, winner_id, challenger_finished_at, opponent_finished_at, created_at').order('created_at', { ascending: false }).limit(30);
  if (error) throw error;
  return (data ?? []).map(mapDuel);
}

export async function loadDuel(id: string) {
  const { data, error } = await supabase.from('duels').select('id, challenger_id, opponent_id, status, questions, challenger_score, opponent_score, winner_id, challenger_finished_at, opponent_finished_at, created_at').eq('id', id).single();
  if (error) throw error;
  return mapDuel(data);
}

function mapDuel(row: Record<string, unknown>): Duel {
  return { id: String(row.id), challengerId: String(row.challenger_id), opponentId: String(row.opponent_id), status: row.status as Duel['status'], questions: row.questions as PracticeQuestion[], challengerScore: row.challenger_score === null ? null : Number(row.challenger_score), opponentScore: row.opponent_score === null ? null : Number(row.opponent_score), winnerId: row.winner_id ? String(row.winner_id) : null, challengerFinishedAt: row.challenger_finished_at ? String(row.challenger_finished_at) : null, opponentFinishedAt: row.opponent_finished_at ? String(row.opponent_finished_at) : null, createdAt: String(row.created_at) };
}

export async function createDuel(opponentId: string, questions: PracticeQuestion[]) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Сначала войди в аккаунт');
  const { data, error } = await supabase.from('duels').insert({ challenger_id: auth.user.id, opponent_id: opponentId, questions }).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function respondToDuel(id: string, accept: boolean) {
  const { error } = await supabase.rpc('respond_to_duel', { p_duel_id: id, p_accept: accept });
  if (error) throw error;
}

export async function submitDuelScore(id: string, score: number) {
  const { error } = await supabase.rpc('submit_duel_score', { p_duel_id: id, p_score: score });
  if (error) throw error;
}
