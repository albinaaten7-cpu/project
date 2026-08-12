import { supabase } from './supabase';
import type { StudySettings } from './studyData';
import type { Subject } from './studyPlanner';
import type { PracticeQuestion } from './practice';

export type LessonSection = {
  subject: string;
  topic: string;
  summary: string;
  keyPoints: string[];
  workedExample: string;
  quiz: Omit<PracticeQuestion, 'subject' | 'topic'>[];
};

export type DailyLesson = { dayNumber: number; title: string; mission: string; sections: LessonSection[] };

function parseJson(text: string) {
  const lesson = JSON.parse(text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()) as DailyLesson;
  if (!isValidLesson(lesson)) throw new Error('AI не создал игровые вопросы. Нажми на день ещё раз.');
  return lesson;
}

function isValidLesson(lesson: DailyLesson) {
  return Array.isArray(lesson.sections) && lesson.sections.length > 0 && lesson.sections.every((section) =>
    typeof section.summary === 'string' && Array.isArray(section.quiz) && section.quiz.length > 0 && section.quiz.every((quiz) =>
      typeof quiz.question === 'string' && Array.isArray(quiz.options) && quiz.options.length >= 2 && Number.isInteger(quiz.correctIndex) && quiz.correctIndex >= 0 && quiz.correctIndex < quiz.options.length &&
      Array.isArray(quiz.wrongExplanations) && quiz.wrongExplanations.length === quiz.options.length && quiz.options.every((_option, index) => index === quiz.correctIndex || Boolean(quiz.wrongExplanations?.[index]?.trim())),
    ),
  );
}

export function getTotalStudyDays(subjects: Subject[], studyDaysPerWeek: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastExam = Math.max(...subjects.map((subject) => new Date(`${subject.exam_date}T00:00:00`).getTime()));
  const calendarDays = Math.max(1, Math.ceil((lastExam - today.getTime()) / 86_400_000));
  return Math.min(120, Math.max(1, Math.ceil((calendarDays / 7) * studyDaysPerWeek)));
}

export async function loadDailyLessons() {
  const { data, error } = await supabase.from('daily_lessons').select('day_number, content').order('day_number');
  if (error) throw error;
  return new Map((data ?? []).flatMap((row) => {
    const lesson = row.content as DailyLesson;
    return isValidLesson(lesson) ? [[row.day_number, lesson] as const] : [];
  }));
}

export async function loadLessonHistory() {
  const { data, error } = await supabase.from('daily_lessons').select('day_number, content, created_at').order('day_number');
  if (error) throw error;
  return (data ?? []).map((row) => ({ dayNumber: row.day_number, title: (row.content as DailyLesson).title, createdAt: row.created_at }));
}

export async function generateDailyLesson(dayNumber: number, totalDays: number, subjects: Subject[], settings: StudySettings, previousLessons: DailyLesson[]) {
  const context = subjects.map((subject) => ({ name: subject.name, topics: subject.topics, examDate: subject.exam_date, currentGrade: subject.current_grade, targetGrade: subject.target_grade }));
  const completed = previousLessons.slice(-6).map((lesson) => ({ day: lesson.dayNumber, covered: lesson.sections.map((section) => ({ topic: section.topic, keyPoints: section.keyPoints })) }));
  const system = 'Ты создаёшь игровой урок школьнику на русском языке. Используй поиск и надёжные образовательные источники. Не выдумывай факты. Каждый новый день должен продвигать ученика: сначала основа, затем применение, смешанная практика и повторение. Объясняй коротко, ясно и конкретно.';
  const prompt = `Создай учебный день ${dayNumber} из ${totalDays}. Ученик: ${settings.country}, ${settings.region}, ${settings.schoolGrade} класс, ${settings.schoolQuarter} четверть. Доступно ${settings.dailyMinutes} минут. Предметы: ${JSON.stringify(context)}. Уже пройденные дни: ${JSON.stringify(completed)}.
Верни только JSON: {"dayNumber":${dayNumber},"title":"интересное название дня","mission":"одна мотивирующая миссия","sections":[{"subject":"предмет","topic":"одна из введённых тем","summary":"мини-конспект 80–140 слов: объясни суть, а не совет учиться","keyPoints":["3–5 точных фактов, формул, связей или правил"],"workedExample":"разобранный пример, событие, задача или применение","quiz":[{"question":"вопрос по материалу этого дня","options":["4 правдоподобных варианта"],"correctIndex":0,"explanation":"коротко почему правильный ответ верен","wrongExplanations":["4 строки по порядку вариантов: почему каждый неправильный ответ не подходит; для правильного варианта пустая строка"]}]}]}.
Выбери только материал, который реально помещается в ${settings.dailyMinutes} минут. Не повторяй уже пройденные объяснения и вопросы. Для дня ${dayNumber} дай следующий уровень глубины; повторение допустимо только в новом задании на закрепление. Создай 3–5 игровых вопросов.`;
  const { data, error } = await supabase.functions.invoke('ai', { body: { prompt, system, search: true } });
  if (error) throw new Error(error.message);
  if (typeof data?.error === 'string') throw new Error(data.error);
  const lesson = parseJson(data.text as string);
  const { data: authData } = await supabase.auth.getSession();
  if (!authData.session) throw new Error('Сессия закончилась. Обнови страницу.');
  const { error: saveError } = await supabase.from('daily_lessons').upsert(
    { user_id: authData.session.user.id, day_number: dayNumber, content: lesson },
    { onConflict: 'user_id,day_number' },
  );
  if (saveError) throw saveError;
  return lesson;
}

export function lessonQuestions(lesson: DailyLesson): PracticeQuestion[] {
  return lesson.sections.flatMap((section) => section.quiz.map((question) => ({ ...question, subject: section.subject, topic: section.topic })));
}
