import { supabase } from './supabase';

export type DiscoveredUser = { userId: string; displayName: string; nickname: string; xp: number; lastSeenAt: string | null };
export type Friendship = { id: string; requesterId: string; addresseeId: string; status: 'pending' | 'accepted' | 'declined'; createdAt: string };

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
  const { error } = await supabase.rpc('send_friend_request', { p_addressee_id: addresseeId });
  if (error) throw error;
}

export async function respondToFriendRequest(id: string, accept: boolean) {
  const { error } = await supabase.rpc('respond_to_friend_request', { p_friendship_id: id, p_accept: accept });
  if (error) throw error;
}
