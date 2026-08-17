import { supabase } from './supabase';
import type { PracticeQuestion } from './practice';
import type { StudySettings } from './studyData';
import type { Subject } from './studyPlanner';

type DiagnosticResponse = { questions: PracticeQuestion[] };

function isQuestion(value: PracticeQuestion) {
  return typeof value.question === 'string' && typeof value.explanation === 'string' &&
    typeof value.subject === 'string' && typeof value.topic === 'string' &&
    Array.isArray(value.options) && value.options.length >= 2 &&
    Number.isInteger(value.correctIndex) && value.correctIndex! >= 0 && value.correctIndex! < value.options.length &&
    Array.isArray(value.wrongExplanations) && value.wrongExplanations.length === value.options.length;
}

export async function generateDiagnostic(subjects: Subject[], settings: StudySettings) {
  const context = subjects.map((subject) => ({ subject: subject.name, topics: subject.topics, currentGrade: subject.current_grade, targetGrade: subject.target_grade }));
  const system = 'Ты создаёшь короткую входную диагностику школьнику. Проверяй понимание указанных учеником тем, не добавляй темы от себя. Пиши ясно и фактологически точно.';
  const prompt = `Ученик: ${settings.country}, ${settings.schoolGrade} класс. Темы: ${JSON.stringify(context)}.
Верни только JSON {"questions":[ровно 5 вопросов]}. Каждый вопрос: {"subject":"предмет из списка","topic":"тема из списка","type":"choice или true_false","question":"короткий вопрос на понимание","options":["варианты"],"correctIndex":0,"explanation":"почему ответ верный, до 18 слов","wrongExplanations":["почему каждый вариант ошибочен, для правильного пустая строка"]}.
Используй смесь базовых и прикладных вопросов. Не подсказывай правильный ответ формулировкой.`;
  const { data, error } = await supabase.functions.invoke('ai', { body: { prompt, system, json: true, thinking: 'low' } });
  if (error) throw new Error(error.message);
  if (typeof data?.error === 'string') throw new Error(data.error);
  const parsed = JSON.parse(String(data?.text ?? '').replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()) as DiagnosticResponse;
  if (!Array.isArray(parsed.questions) || parsed.questions.length !== 5 || !parsed.questions.every(isQuestion)) throw new Error('Не удалось собрать диагностику. Попробуй ещё раз.');
  return parsed.questions;
}
