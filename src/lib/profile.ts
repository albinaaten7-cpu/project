import { supabase } from './supabase';

export type Profile = { user_id: string; display_name: string; character_name: string; xp: number };

export async function loadProfile() {
  const { data, error } = await supabase.from('profiles').select('user_id, display_name, character_name, xp').maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function createProfile(displayName: string, characterName: string) {
  const { data: authData } = await supabase.auth.getSession();
  if (!authData.session) throw new Error('Сессия не найдена');
  const { data, error } = await supabase.from('profiles').upsert({ user_id: authData.session.user.id, display_name: displayName, character_name: characterName }).select().single();
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
