import { supabase } from './supabase';
import type { PracticeQuestion } from './practice';

export type QuizSession = { dayNumber: number; currentIndex: number; score: number; streak: number; mistakes: PracticeQuestion[]; completed: boolean };
export type TopicInsight = { topic: string; subject: string; correct: number; total: number; accuracy: number };
export type LearningStats = { completedLessons: number; correctAnswers: number; totalAnswers: number; studyMinutes: number; currentStreak: number; insights: TopicInsight[] };

export async function loadQuizSession(dayNumber: number) {
  const { data, error } = await supabase.from('quiz_sessions').select('day_number, current_index, score, streak, mistakes, completed').eq('day_number', dayNumber).maybeSingle();
  if (error) throw error;
  return data ? { dayNumber: data.day_number, currentIndex: data.current_index, score: data.score, streak: data.streak, mistakes: data.mistakes as PracticeQuestion[], completed: data.completed } : null;
}

export async function loadQuizSessions() {
  const { data, error } = await supabase.from('quiz_sessions').select('day_number, current_index, score, streak, mistakes, completed').order('day_number');
  if (error) throw error;
  return new Map((data ?? []).map((row) => [row.day_number, { dayNumber: row.day_number, currentIndex: row.current_index, score: row.score, streak: row.streak, mistakes: row.mistakes as PracticeQuestion[], completed: row.completed }]));
}

export async function saveQuizAnswer(dayNumber: number, questionIndex: number, question: PracticeQuestion, isCorrect: boolean, score: number, streak: number, mistakes: PracticeQuestion[], completed: boolean) {
  const { data: authData } = await supabase.auth.getSession();
  if (!authData.session) throw new Error('Сессия закончилась');
  const userId = authData.session.user.id;
  const [sessionResult, attemptResult] = await Promise.all([
    supabase.from('quiz_sessions').upsert({ user_id: userId, day_number: dayNumber, current_index: questionIndex + 1, score, streak, mistakes, completed, updated_at: new Date().toISOString() }),
    supabase.from('quiz_attempts').upsert({ user_id: userId, day_number: dayNumber, question_index: questionIndex, subject: question.subject, topic: question.topic, is_correct: isCorrect }, { onConflict: 'user_id,day_number,question_index' }),
  ]);
  if (sessionResult.error) throw sessionResult.error;
  if (attemptResult.error) throw attemptResult.error;
}

export async function restartQuizSession(dayNumber: number) {
  const { error } = await supabase.from('quiz_sessions').delete().eq('day_number', dayNumber);
  if (error) throw error;
}

function topicInsights(rows: Array<{ subject: string; topic: string; is_correct: boolean }>) {
  const groups = new Map<string, { topic: string; subject: string; correct: number; total: number }>();
  rows.forEach((row) => { const key = `${row.subject}|${row.topic}`; const item = groups.get(key) ?? { subject: row.subject, topic: row.topic, correct: 0, total: 0 }; item.total += 1; if (row.is_correct) item.correct += 1; groups.set(key, item); });
  return Array.from(groups.values()).map((item) => ({ ...item, accuracy: Math.round((item.correct / item.total) * 100) })).sort((a, b) => a.accuracy - b.accuracy);
}

export async function loadTopicInsights() {
  const { data, error } = await supabase.from('quiz_attempts').select('subject, topic, is_correct').order('answered_at', { ascending: false }).limit(200);
  if (error) throw error;
  return topicInsights(data ?? []);
}

export async function loadMistakeQuestions() {
  const { data, error } = await supabase.from('quiz_sessions').select('mistakes').order('updated_at', { ascending: false });
  if (error) throw error;
  const unique = new Map<string, PracticeQuestion>();
  (data ?? []).forEach((row) => (row.mistakes as PracticeQuestion[]).forEach((question) => unique.set(`${question.subject}|${question.topic}|${question.question}`, question)));
  return Array.from(unique.values()).slice(0, 20);
}

export async function loadLearningStats(dailyMinutes: number): Promise<LearningStats> {
  const [attemptsResult, completionsResult] = await Promise.all([
    supabase.from('quiz_attempts').select('subject, topic, is_correct'),
    supabase.from('quiz_completions').select('completed_at').order('completed_at', { ascending: false }),
  ]);
  if (attemptsResult.error) throw attemptsResult.error;
  if (completionsResult.error) throw completionsResult.error;
  const attempts = attemptsResult.data ?? [];
  const dates = Array.from(new Set((completionsResult.data ?? []).map((row) => row.completed_at.slice(0, 10))));
  let currentStreak = 0;
  const cursor = new Date(); cursor.setHours(0, 0, 0, 0);
  for (const date of dates) { if (date !== cursor.toISOString().slice(0, 10)) break; currentStreak += 1; cursor.setDate(cursor.getDate() - 1); }
  return { completedLessons: completionsResult.data?.length ?? 0, correctAnswers: attempts.filter((row) => row.is_correct).length, totalAnswers: attempts.length, studyMinutes: (completionsResult.data?.length ?? 0) * dailyMinutes, currentStreak, insights: topicInsights(attempts) };
}
