import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export const ADMIN_LOGIN = 'admin.accountenter';
export const ADMIN_USERNAME = 'ADMINENTER';
const ADMIN_EMAIL = 'admin.accountenter@gmail.com';

export function isAdmin(user: User | null) {
  return user?.email?.toLowerCase() === ADMIN_EMAIL;
}

export async function signInAsAdmin(login: string, password: string) {
  const normalizedLogin = login.trim().toLowerCase();
  if (normalizedLogin !== ADMIN_LOGIN && normalizedLogin !== ADMIN_USERNAME.toLowerCase() && normalizedLogin !== ADMIN_EMAIL) {
    throw new Error('Неверный логин администратора.');
  }

  const signIn = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
  if (!signIn.error) return signIn.data.user;

  const signUp = await supabase.auth.signUp({
    email: ADMIN_EMAIL,
    password,
    options: { data: { display_name: 'ADMINENTER' } },
  });
  if (signUp.error) throw signUp.error;
  if (!signUp.data.session || !signUp.data.user?.identities?.length) {
    throw new Error('Неверный пароль администратора.');
  }
  return signUp.data.user;
}

export async function signInToAccount(identifier: string, password: string) {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const adminIdentifiers = [ADMIN_LOGIN, ADMIN_USERNAME.toLowerCase(), ADMIN_EMAIL];
  if (adminIdentifiers.includes(normalizedIdentifier)) return signInAsAdmin(identifier, password);
  if (!normalizedIdentifier.includes('@')) {
    throw new Error('Для обычного аккаунта введи email. Никнейм доступен для ADMINENTER.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedIdentifier, password });
  if (error) throw new Error('Неверный email или пароль.');
  return data.user;
}
