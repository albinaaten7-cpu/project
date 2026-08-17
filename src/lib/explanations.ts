import { supabase } from './supabase';
import type { PracticeQuestion } from './practice';

export async function explainQuestionSimply(question: PracticeQuestion, chosenAnswer: string, correctAnswer: string) {
  const system = 'Ты добрый школьный наставник. Переформулируй данное готовое объяснение проще. Не добавляй новых фактов и не меняй правильный ответ.';
  const prompt = `Предмет: ${question.subject}. Тема: ${question.topic}. Вопрос: ${question.question}. Ответ ученика: ${chosenAnswer}. Правильный ответ: ${correctAnswer}. Готовое объяснение: ${question.explanation}. Объясни ошибку простыми словами в 2–3 коротких предложениях и приведи одну понятную аналогию, если она уместна.`;
  const { data, error } = await supabase.functions.invoke('ai', { body: { prompt, system, thinking: 'low' } });
  if (error) throw new Error(error.message);
  if (typeof data?.error === 'string') throw new Error(data.error);
  if (typeof data?.text !== 'string' || !data.text.trim()) throw new Error('Объяснение не загрузилось.');
  return data.text.trim();
}
