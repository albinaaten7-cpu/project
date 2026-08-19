import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { StudySettings } from './studyData';
import type { Subject } from './studyPlanner';
import type { PracticeQuestion } from './practice';
import type { TopicInsight } from './quizProgress';
import { hasUniqueQuestions, isValidCore, isValidLesson, isValidQuestion, questionKey } from './dailyLessonValidation';

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
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  try { return JSON.parse(cleaned) as T; }
  catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start < 0 || end <= start) throw new Error('AI вернул ответ без JSON.');
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  }
}

async function invokeJson<T>(prompt: string, system: string) {
  const { data, error } = await supabase.functions.invoke('ai', { body: { prompt, system, json: true, thinking: 'low' } });
  if (error instanceof FunctionsHttpError) {
    const details = await error.context.json().catch(() => null) as { error?: unknown } | null;
    if (typeof details?.error === 'string') throw new Error(details.error);
  }
  if (error) throw new Error('Не удалось связаться с AI. Попробуй немного позже.');
  if (typeof data?.error === 'string') throw new Error(data.error);
  return parseJson<T>(String(data?.text ?? ''));
}

export function getTotalStudyDays(planDays: number) {
  return Math.min(120, Math.max(1, planDays));
}

export function getLessonTarget(dayNumber: number, subjects: Subject[]) {
  const subject = subjects[(dayNumber - 1) % subjects.length];
  const topics = subject.topics.split(/[;\n]+/).map((topic) => topic.trim()).filter(Boolean);
  const topic = topics[Math.floor((dayNumber - 1) / subjects.length) % Math.max(1, topics.length)] ?? subject.topics.trim();
  return { subject, topic };
}

export function lessonMatchesTarget(lesson: DailyLesson, dayNumber: number, subjects: Subject[]) {
  const target = getLessonTarget(dayNumber, subjects);
  const section = lesson.sections[0];
  return section?.subject.trim().toLocaleLowerCase('ru-RU') === target.subject.name.trim().toLocaleLowerCase('ru-RU') &&
    section?.topic.trim().toLocaleLowerCase('ru-RU') === target.topic.trim().toLocaleLowerCase('ru-RU');
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

export async function generateDailyLessonCore(dayNumber: number, totalDays: number, subjects: Subject[], settings: StudySettings, previousLessons: DailyLesson[], insights: TopicInsight[], attempt = 0): Promise<DailyLesson> {
  const { subject: selectedSubject, topic: selectedTopic } = getLessonTarget(dayNumber, subjects);
  const sameText = (first: string, second: string) => first.trim().toLocaleLowerCase('ru-RU') === second.trim().toLocaleLowerCase('ru-RU');
  const context = { name: selectedSubject.name, topic: selectedTopic, currentGrade: selectedSubject.current_grade, targetGrade: selectedSubject.target_grade };
  const completed = previousLessons.slice(-6).flatMap((lesson) => lesson.sections
    .filter((section) => sameText(section.subject, selectedSubject.name) && sameText(section.topic, selectedTopic))
    .map((section) => ({ day: lesson.dayNumber, topic: section.topic, keyPoints: section.keyPoints })));
  const practiced = insights.reduce((total, insight) => total + insight.total, 0);
  const accuracy = practiced ? Math.round(insights.reduce((total, insight) => total + insight.correct, 0) / practiced * 100) : null;
  const difficulty = accuracy === null ? 'обычный стартовый уровень' : accuracy >= 80 ? 'повышенная сложность: меньше подсказок, больше применения' : accuracy < 50 ? 'базовый уровень: маленькие шаги и один наглядный пример' : 'средняя сложность с применением';
  const weakTopics = insights.filter((insight) => insight.accuracy < 70 && sameText(insight.subject, selectedSubject.name) && sameText(insight.topic, selectedTopic))
    .slice(0, 4).map((insight) => ({ subject: insight.subject, topic: insight.topic, accuracy: insight.accuracy }));
  const system = 'Ты создаёшь точный школьный мини-конспект на русском языке. Используй надёжные образовательные источники, не выдумывай факты и не добавляй темы, которых нет в запросе.';
  const prompt = `Создай только конспект учебного дня ${dayNumber} из ${totalDays}. Ученик: ${settings.country}, ${settings.schoolGrade} класс. Время: ${settings.dailyMinutes} минут. Точная цель: ${JSON.stringify(context)}. Уже пройдено: ${JSON.stringify(completed)}. Уровень: ${difficulty}. Слабые темы: ${JSON.stringify(weakTopics)}.
Верни только JSON: {"dayNumber":${dayNumber},"title":"интересное название","mission":"короткая миссия","sections":[{"subject":"${selectedSubject.name}","topic":"${selectedTopic}","summary":"точный мини-конспект 55–80 слов","keyPoints":["ровно 3 точных правила или факта"],"workedExample":"разобранный пример в 2–3 предложениях","quiz":[]}]}.
${attempt > 0 ? 'Это повторная попытка: не добавляй Markdown, комментарии или текст вне JSON.' : ''}
Сейчас НЕ создавай вопросы. Объясни только точную тему «${selectedTopic}». Любую другую тему игнорируй. Пиши конкретно, без советов вроде «прочитай и повтори».`;
  try {
    const lesson = await invokeJson<DailyLesson>(prompt, system);
    if (!isValidCore(lesson)) throw new Error('invalid lesson core');
    lesson.sections[0] = { ...lesson.sections[0], subject: selectedSubject.name, topic: selectedTopic, quiz: [] };
    return lesson;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Лимит Gemini')) throw error;
    if (attempt < 2) return generateDailyLessonCore(dayNumber, totalDays, subjects, settings, previousLessons, insights, attempt + 1);
    throw error instanceof Error ? error : new Error('AI не закончил конспект. Попробуй открыть день ещё раз.');
  }
}

async function generateQuiz(lesson: DailyLesson, settings: StudySettings, previousQuestions: string[], retry = false) {
  const section = lesson.sections[0];
  const excluded = previousQuestions.slice(-30);
  const system = 'Ты создаёшь точные игровые вопросы школьнику на русском языке. Используй только факты из переданного конспекта. Верни строго 10 разных вопросов без повторов.';
  const prompt = `Ученик: ${settings.country}, ${settings.schoolGrade} класс. Предмет: ${section.subject}. Тема: ${section.topic}. Конспект: ${section.summary}. Главное: ${JSON.stringify(section.keyPoints)}. Пример: ${section.workedExample}.
Создай ровно 10 вопросов и верни только JSON {"quiz":[ВОПРОСЫ]}. Первые 5 проверяют основу и типичные ошибки, следующие 5 — применение и более глубокое понимание. Уже использованные вопросы, которые нельзя повторять или перефразировать: ${JSON.stringify(excluded)}. ${retry ? 'Предыдущий ответ имел неверный формат или повторы — особенно внимательно проверь все поля и уникальность формулировок. ' : ''}
Допустимые форматы:
1. {"type":"choice","question":"...","options":["ровно 4 варианта"],"correctIndex":0,"explanation":"до 18 слов","wrongExplanations":["для каждого варианта причина до 12 слов, у правильного пустая строка"]}.
2. {"type":"true_false","question":"...","options":["Верно","Неверно"],"correctIndex":0,"explanation":"...","wrongExplanations":["...",""]}.
3. {"type":"short_answer","question":"...","acceptedAnswers":["ответ","вариант"],"explanation":"..."}.
4. {"type":"order","question":"...","items":["3–6 уникальных элементов в правильном порядке"],"explanation":"..."}.
Используй минимум 2 подходящих формата. Каждый вопрос должен проверять отдельную мысль или отдельный способ применения. Не перефразируй один вопрос несколько раз.`;
  try {
    const result = await invokeJson<{ quiz: Omit<PracticeQuestion, 'subject' | 'topic'>[] }>(prompt, system);
    const previousKeys = new Set(excluded.map(questionKey));
    if (Array.isArray(result.quiz) && result.quiz.length === 10 && result.quiz.every(isValidQuestion) &&
      hasUniqueQuestions(result.quiz) && result.quiz.every((question) => !previousKeys.has(questionKey(question.question)))) return result.quiz;
  } catch { if (!retry) return generateQuiz(lesson, settings, previousQuestions, true); }
  if (!retry) return generateQuiz(lesson, settings, previousQuestions, true);
  throw new Error('AI не создал 10 разных вопросов. Попробуй ещё раз.');
}

export async function completeDailyLesson(lesson: DailyLesson, settings: StudySettings, previousQuestions: string[] = []) {
  const quiz = await generateQuiz(lesson, settings, previousQuestions);
  const complete = { ...lesson, sections: [{ ...lesson.sections[0], quiz }] };
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
