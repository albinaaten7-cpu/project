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

function parseJson(text: string) {
  const lesson = JSON.parse(text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()) as DailyLesson;
  if (!isValidLesson(lesson)) throw new Error('AI не создал игровые вопросы. Нажми на день ещё раз.');
  return lesson;
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

export function getTotalStudyDays(subjects: Subject[], studyDaysPerWeek: number, planDays: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDates = subjects.flatMap((subject) => subject.exam_date ? [new Date(`${subject.exam_date}T00:00:00`).getTime()] : []).filter(Number.isFinite);
  if (examDates.length === 0) return Math.min(120, Math.max(1, planDays));
  const lastExam = Math.max(...examDates);
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

export async function generateDailyLesson(dayNumber: number, totalDays: number, subjects: Subject[], settings: StudySettings, previousLessons: DailyLesson[], insights: TopicInsight[]) {
  const context = subjects.map((subject) => ({ name: subject.name, topics: subject.topics, examDate: subject.exam_date, currentGrade: subject.current_grade, targetGrade: subject.target_grade }));
  const completed = previousLessons.slice(-6).map((lesson) => ({ day: lesson.dayNumber, covered: lesson.sections.map((section) => ({ topic: section.topic, keyPoints: section.keyPoints })) }));
  const practiced = insights.reduce((total, insight) => total + insight.total, 0);
  const accuracy = practiced ? Math.round(insights.reduce((total, insight) => total + insight.correct, 0) / practiced * 100) : null;
  const difficulty = accuracy === null ? 'обычный стартовый уровень' : accuracy >= 80 ? 'повышенная сложность: меньше подсказок, больше применения' : accuracy < 50 ? 'базовый уровень: маленькие шаги и один наглядный пример' : 'средняя сложность с применением';
  const weakTopics = insights.filter((insight) => insight.accuracy < 70).slice(0, 4).map((insight) => ({ subject: insight.subject, topic: insight.topic, accuracy: insight.accuracy }));
  const system = 'Ты создаёшь игровой урок школьнику на русском языке. Используй поиск и надёжные образовательные источники. Не выдумывай факты. Каждый новый день должен продвигать ученика: сначала основа, затем применение, смешанная практика и повторение. Объясняй коротко, ясно и конкретно.';
  const prompt = `Создай учебный день ${dayNumber} из ${totalDays}. Ученик: ${settings.country}, ${settings.schoolGrade} класс. Доступно ${settings.dailyMinutes} минут. Предметы и точные темы указаны учеником: ${JSON.stringify(context)}. Уже пройденные дни: ${JSON.stringify(completed)}. Текущий уровень: ${difficulty}. Слабые темы по прошлым ответам: ${JSON.stringify(weakTopics)}.
Верни только JSON: {"dayNumber":${dayNumber},"title":"интересное название дня","mission":"одна мотивирующая миссия","sections":[{"subject":"предмет","topic":"одна из введённых тем","summary":"мини-конспект 60–100 слов: объясни суть, а не совет учиться","keyPoints":["3–4 точных факта, формулы, связи или правила"],"workedExample":"один коротко разобранный пример, событие, задача или применение","quiz":[ВОПРОСЫ]}]}.
Используй форматы вопросов по смыслу темы:
1. Выбор: {"type":"choice","question":"...","options":["4 варианта"],"correctIndex":0,"explanation":"...","wrongExplanations":["по одной строке для каждого варианта, у правильного пустая строка"]}.
2. Верно/неверно: {"type":"true_false","question":"утверждение","options":["Верно","Неверно"],"correctIndex":0,"explanation":"...","wrongExplanations":["...",""]}.
3. Короткий ответ: {"type":"short_answer","question":"...","acceptedAnswers":["основной ответ","допустимый вариант"],"explanation":"..."}.
4. Порядок: {"type":"order","question":"...","items":["элементы сразу в правильном порядке"],"explanation":"..."}. Порядок используй только для реальной хронологии, этапов процесса или алгоритма.
Выбери только материал, который реально помещается в ${settings.dailyMinutes} минут. Не повторяй уже пройденные объяснения и вопросы. Для дня ${dayNumber} дай следующий уровень глубины. Если есть слабые темы, включи 2–3 новых задания на их понимание, не копируя старые вопросы. Создай ровно 10 разных игровых вопросов суммарно во всех sections и используй минимум 2 подходящих формата. Вопросы должны проверять понимание, применение и типичные ошибки, а не только запоминание.`;
  const researchWords = /истори|географ|право|обществ|соврем|статист|новост/i;
  const needsResearch = context.some((subject) => researchWords.test(`${subject.name} ${subject.topics}`));
  const { data, error } = await supabase.functions.invoke('ai', { body: { prompt, system, search: needsResearch } });
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
