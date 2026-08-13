import { supabase } from './supabase';
import type { Subject } from './studyPlanner';

export type NewSubject = Omit<Subject, 'id'>;
export type StudySettings = {
  weeklyMinutes: number;
  schoolGrade: number;
  schoolQuarter: number;
  country: 'Казахстан' | 'США';
  region: string;
  dailyMinutes: number;
  studyDaysPerWeek: number;
  planDays: number;
};

export async function loadStudyData() {
  const [subjectsResult, settingsResult] = await Promise.all([
    supabase.from('subjects').select('id, name, current_grade, target_grade, exam_date, topics').order('exam_date'),
    supabase.from('study_settings').select('weekly_minutes, daily_minutes, study_days_per_week, plan_days, school_grade, school_quarter, country, region').maybeSingle(),
  ]);
  if (subjectsResult.error) throw subjectsResult.error;
  if (settingsResult.error) throw settingsResult.error;
  return {
    subjects: (subjectsResult.data ?? []) as Subject[],
    weeklyMinutes: settingsResult.data?.weekly_minutes ?? 420,
    schoolGrade: settingsResult.data?.school_grade ?? 7,
    schoolQuarter: settingsResult.data?.school_quarter ?? 1,
    country: (settingsResult.data?.country ?? 'Казахстан') as StudySettings['country'],
    region: settingsResult.data?.region ?? 'Русский язык обучения',
    dailyMinutes: settingsResult.data?.daily_minutes ?? 60,
    studyDaysPerWeek: settingsResult.data?.study_days_per_week ?? 5,
    planDays: settingsResult.data?.plan_days ?? 20,
  };
}

export async function addSubject(subject: NewSubject) {
  const { error } = await supabase.from('subjects').insert(subject);
  if (error) throw error;
}

export async function deleteSubject(id: string) {
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) throw error;
  await clearGeneratedRoute();
}

export async function updateSubjectTopics(id: string, topics: string) {
  const { error } = await supabase.from('subjects').update({ topics }).eq('id', id);
  if (error) throw error;
}

export async function updateSubject(id: string, subject: NewSubject) {
  const { error } = await supabase.from('subjects').update(subject).eq('id', id);
  if (error) throw error;
  await clearGeneratedRoute();
}

async function clearGeneratedRoute() {
  const results = await Promise.all([
    supabase.from('daily_lessons').delete().gte('day_number', 1),
    supabase.from('quiz_sessions').delete().gte('day_number', 1),
    supabase.from('quiz_attempts').delete().gte('day_number', 1),
  ]);
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
}

export async function saveStudySettings(userId: string, settings: StudySettings) {
  const { error } = await supabase.from('study_settings').upsert({
    user_id: userId,
    weekly_minutes: settings.weeklyMinutes,
    daily_minutes: settings.dailyMinutes,
    study_days_per_week: settings.studyDaysPerWeek,
    plan_days: settings.planDays,
    school_grade: settings.schoolGrade,
    school_quarter: settings.schoolQuarter,
    country: settings.country,
    region: settings.region,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
