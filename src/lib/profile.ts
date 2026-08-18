import { supabase } from './supabase';

export type Profile = { user_id: string; display_name: string; nickname: string; xp: number };

export async function loadProfile() {
  const { data, error } = await supabase.from('profiles').select('user_id, display_name, nickname, xp').maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function createProfile(displayName: string, chosenNickname?: string) {
  const { data: authData } = await supabase.auth.getSession();
  if (!authData.session) throw new Error('Сессия не найдена');
  const nickname = chosenNickname || `student_${authData.session.user.id.slice(0, 8)}`;
  const { data, error } = await supabase.from('profiles').upsert({ user_id: authData.session.user.id, display_name: displayName, nickname }).select('user_id, display_name, nickname, xp').single();
  if (error?.code === '23505') throw new Error('Этот никнейм уже занят.');
  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(displayName: string, nickname: string) {
  const { data: authData, error: authError } = await supabase.auth.updateUser({ data: { display_name: displayName } });
  if (authError) throw authError;
  const userId = authData.user.id;
  const { data, error } = await supabase.from('profiles').upsert({ user_id: userId, display_name: displayName, nickname }).select('user_id, display_name, nickname, xp').single();
  if (error?.code === '23505') throw new Error('Этот никнейм уже занят.');
  if (error) throw error;
  return data as Profile;
}

export async function awardQuizXp(dayNumber: number, score: number) {
  const { data, error } = await supabase.rpc('award_quiz_xp', { p_day_number: dayNumber, p_score: score });
  if (error) throw error;
  return data as Profile;
}

export function profileLevel(xp: number) {
  return Math.floor(xp / 100) + 1;
}
