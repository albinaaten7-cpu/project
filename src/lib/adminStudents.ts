import { supabase } from './supabase';

type RegisteredUser = { user_id: string; email: string | null; created_at: string; last_sign_in_at: string | null };

export type AdminStudent = {
  userId: string;
  email: string;
  name: string;
  nickname: string;
  registeredAt: string;
  lastSignInAt: string | null;
  xp: number;
  answers: number;
  correctAnswers: number;
  completedLessons: number;
};

export async function loadAdminStudents(adminUserId: string): Promise<AdminStudent[]> {
  const [usersResult, profilesResult, attemptsResult, completionsResult] = await Promise.all([
    supabase.rpc('admin_list_registered_users'),
    supabase.from('profiles').select('user_id, display_name, nickname, xp').neq('user_id', adminUserId),
    supabase.from('quiz_attempts').select('user_id, is_correct'),
    supabase.from('quiz_completions').select('user_id'),
  ]);
  if (usersResult.error) throw usersResult.error;
  if (profilesResult.error) throw profilesResult.error;
  if (attemptsResult.error) throw attemptsResult.error;
  if (completionsResult.error) throw completionsResult.error;

  const profiles = new Map((profilesResult.data ?? []).map((profile) => [profile.user_id, profile]));
  const users = (usersResult.data ?? []) as RegisteredUser[];
  return users.filter((user) => user.user_id !== adminUserId).map((user): AdminStudent => {
    const profile = profiles.get(user.user_id);
    const attempts = (attemptsResult.data ?? []).filter((row) => row.user_id === user.user_id);
    return {
      userId: user.user_id,
      email: user.email ?? 'Email не указан',
      name: profile?.display_name ?? user.email?.split('@')[0] ?? 'Ученик',
      nickname: profile?.nickname ?? 'без_ника',
      registeredAt: user.created_at,
      lastSignInAt: user.last_sign_in_at,
      xp: profile?.xp ?? 0,
      answers: attempts.length,
      correctAnswers: attempts.filter((row) => row.is_correct).length,
      completedLessons: (completionsResult.data ?? []).filter((row) => row.user_id === user.user_id).length,
    };
  }).sort((a, b) => b.xp - a.xp);
}
