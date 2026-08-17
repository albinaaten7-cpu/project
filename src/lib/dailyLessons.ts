import { supabase } from './supabase';
import type { StudySettings } from './studyData';
import type { Subject } from './studyPlanner';
import type { PracticeQuestion } from './practice';
import type { TopicInsight } from './quizProgress';

export type LessonSection = {
  subject: string;
  topic: string;
  summary: string;
  keyPoints: string[];
  workedExample: string;
  quiz: Omit<PracticeQuestion, 'subject' | 'topic'>[];
};

export type DailyLesson = { dayNumber: number; title: string; mission: string; sections: LessonSection[] };

function parseJson<T>(text: string) {
  return JSON.parse(text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()) as T;
}

function isValidQuestion(quiz: Omit<PracticeQuestion, 'subject' | 'topic'>) {
  if (typeof quiz.question !== 'string' || typeof quiz.explanation !== 'string') return false;
  const type = quiz.type ?? 'choice';
  if (type === 'short_answer') return Array.isArray(quiz.acceptedAnswers) && quiz.acceptedAnswers.length > 0 && quiz.acceptedAnswers.every((answer) => Boolean(answer.trim()));
  if (type === 'order') return Array.isArray(quiz.items) && quiz.items.length >= 3 && quiz.items.length <= 6 && new Set(quiz.items).size === quiz.items.length;
  return Array.isArray(quiz.options) && quiz.options.length >= 2 && Number.isInteger(quiz.correctIndex) && quiz.correctIndex! >= 0 && quiz.correctIndex! < quiz.options.length &&
    Array.isArray(quiz.wrongExplanations) && quiz.wrongExplanations.length === quiz.options.length && quiz.options.every((_option, index) => index === quiz.correctIndex || Boolean(quiz.wrongExplanations?.[index]?.trim()));
}

function isValidLesson(lesson: DailyLesson) {
  if (!Array.isArray(lesson.sections) || lesson.sections.length === 0) return false;
  const questionCount = lesson.sections.reduce((total, section) => total + (Array.isArray(section.quiz) ? section.quiz.length : 0), 0);
  return questionCount >= 10 && questionCount <= 15 && lesson.sections.every((section) =>
    typeof section.summary === 'string' && Array.isArray(section.quiz) && section.quiz.length > 0 && section.quiz.every(isValidQuestion),
  );
}

function isValidCore(lesson: DailyLesson) {
  return typeof lesson.title === 'string' && typeof lesson.mission === 'string' && lesson.sections?.length === 1 &&
    lesson.sections.every((section) => typeof section.subject === 'string' && typeof section.topic === 'string' &&
      typeof section.summary === 'string' && Array.isArray(section.keyPoints) && section.keyPoints.length === 3 &&
      typeof section.workedExample === 'string');
}

async function invokeJson<T>(prompt: string, system: string, search = false) {
  const { data, error } = await supabase.functions.invoke('ai', { body: { prompt, system, search, json: true, thinking: search ? 'medium' : 'low' } });
  if (error) throw new Error(error.message);
  if (typeof data?.error === 'string') throw new Error(data.error);
  return parseJson<T>(String(data?.text ?? ''));
}

export function getTotalStudyDays(planDays: number) {
  return Math.min(120, Math.max(1, planDays));
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

export async function generateDailyLessonCore(dayNumber: number, totalDays: number, subjects: Subject[], settings: StudySettings, previousLessons: DailyLesson[], insights: TopicInsight[], retry = false): Promise<DailyLesson> {
  const selectedSubject = subjects[(dayNumber - 1) % subjects.length];
  const topics = selectedSubject.topics.split(/[;\n]+/).map((topic) => topic.trim()).filter(Boolean);
  const selectedTopic = topics[Math.floor((dayNumber - 1) / subjects.length) % Math.max(1, topics.length)] ?? selectedSubject.topics;
  const context = { name: selectedSubject.name, topic: selectedTopic, currentGrade: selectedSubject.current_grade, targetGrade: selectedSubject.target_grade };
  const completed = previousLessons.slice(-6).map((lesson) => ({ day: lesson.dayNumber, covered: lesson.sections.map((section) => ({ topic: section.topic, keyPoints: section.keyPoints })) }));
  const practiced = insights.reduce((total, insight) => total + insight.total, 0);
  const accuracy = practiced ? Math.round(insights.reduce((total, insight) => total + insight.correct, 0) / practiced * 100) : null;
  const difficulty = accuracy === null ? 'обычный стартовый уровень' : accuracy >= 80 ? 'повышенная сложность: меньше подсказок, больше применения' : accuracy < 50 ? 'базовый уровень: маленькие шаги и один наглядный пример' : 'средняя сложность с применением';
  const weakTopics = insights.filter((insight) => insight.accuracy < 70).slice(0, 4).map((insight) => ({ subject: insight.subject, topic: insight.topic, accuracy: insight.accuracy }));
  const system = 'Ты создаёшь точный школьный мини-конспект на русском языке. Используй надёжные образовательные источники, не выдумывай факты и не добавляй темы, которых нет в запросе.';
  const prompt = `Создай только конспект учебного дня ${dayNumber} из ${totalDays}. Ученик: ${settings.country}, ${settings.schoolGrade} класс. Время: ${settings.dailyMinutes} минут. Точная цель: ${JSON.stringify(context)}. Уже пройдено: ${JSON.stringify(completed)}. Уровень: ${difficulty}. Слабые темы: ${JSON.stringify(weakTopics)}.
Верни только JSON: {"dayNumber":${dayNumber},"title":"интересное название","mission":"короткая миссия","sections":[{"subject":"${selectedSubject.name}","topic":"${selectedTopic}","summary":"точный мини-конспект 55–80 слов","keyPoints":["ровно 3 точных правила или факта"],"workedExample":"разобранный пример в 2–3 предложениях","quiz":[]}]}.
Сейчас НЕ создавай вопросы. Объясни суть темы конкретно, без советов вроде «прочитай и повтори».`;
  const researchWords = /истори|географ|право|обществ|соврем|статист|новост/i;
  try {
    const lesson = await invokeJson<DailyLesson>(prompt, system, researchWords.test(`${selectedSubject.name} ${selectedTopic}`));
    if (!isValidCore(lesson)) throw new Error('invalid lesson core');
    lesson.sections[0].quiz = [];
    return lesson;
  } catch {
    if (!retry) return generateDailyLessonCore(dayNumber, totalDays, subjects, settings, previousLessons, insights, true);
    throw new Error('AI не закончил конспект. Попробуй открыть день ещё раз.');
  }
}

async function generateQuizBatch(lesson: DailyLesson, settings: StudySettings, batch: 1 | 2, retry = false) {
  const section = lesson.sections[0];
  const system = 'Ты создаёшь точные игровые вопросы школьнику на русском языке. Используй только факты из переданного конспекта. Верни строго 5 разных вопросов.';
  const focus = batch === 1 ? 'основа темы и типичные ошибки' : 'применение, связи и более глубокое понимание';
  const prompt = `Ученик: ${settings.country}, ${settings.schoolGrade} класс. Предмет: ${section.subject}. Тема: ${section.topic}. Конспект: ${section.summary}. Главное: ${JSON.stringify(section.keyPoints)}. Пример: ${section.workedExample}.
Создай ровно 5 вопросов (${focus}) и верни только JSON {"quiz":[ВОПРОСЫ]}. ${retry ? 'Предыдущий ответ имел неверный формат — особенно внимательно проверь все поля. ' : ''}
Допустимые форматы:
1. {"type":"choice","question":"...","options":["ровно 4 варианта"],"correctIndex":0,"explanation":"до 18 слов","wrongExplanations":["для каждого варианта причина до 12 слов, у правильного пустая строка"]}.
2. {"type":"true_false","question":"...","options":["Верно","Неверно"],"correctIndex":0,"explanation":"...","wrongExplanations":["...",""]}.
3. {"type":"short_answer","question":"...","acceptedAnswers":["ответ","вариант"],"explanation":"..."}.
4. {"type":"order","question":"...","items":["3–6 уникальных элементов в правильном порядке"],"explanation":"..."}.
Используй минимум 2 подходящих формата. Не повторяй вопросы из другой части: эта часть №${batch}.`;
  try {
    const result = await invokeJson<{ quiz: Omit<PracticeQuestion, 'subject' | 'topic'>[] }>(prompt, system);
    if (Array.isArray(result.quiz) && result.quiz.length === 5 && result.quiz.every(isValidQuestion)) return result.quiz;
  } catch { if (!retry) return generateQuizBatch(lesson, settings, batch, true); }
  if (!retry) return generateQuizBatch(lesson, settings, batch, true);
  throw new Error(`AI не создал часть ${batch} квиза. Попробуй ещё раз.`);
}

export async function completeDailyLesson(lesson: DailyLesson, settings: StudySettings) {
  const [first, second] = await Promise.all([generateQuizBatch(lesson, settings, 1), generateQuizBatch(lesson, settings, 2)]);
  const complete = { ...lesson, sections: [{ ...lesson.sections[0], quiz: [...first, ...second] }] };
  if (!isValidLesson(complete)) throw new Error('Квиз собрался не полностью. Попробуй ещё раз.');
  return complete;
}

export async function saveDailyLesson(dayNumber: number, lesson: DailyLesson) {
  const { data: authData } = await supabase.auth.getSession();
  if (!authData.session) throw new Error('Сессия закончилась. Обнови страницу.');
  const { error: saveError } = await supabase.from('daily_lessons').upsert(
    { user_id: authData.session.user.id, day_number: dayNumber, content: lesson },
    { onConflict: 'user_id,day_number' },
  );
  if (saveError) throw saveError;
}

export function lessonQuestions(lesson: DailyLesson): PracticeQuestion[] {
  return lesson.sections.flatMap((section) => section.quiz.map((question) => ({ ...question, subject: section.subject, topic: section.topic })));
}
