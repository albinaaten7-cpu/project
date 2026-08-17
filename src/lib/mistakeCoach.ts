import { supabase } from './supabase';
import type { PracticeQuestion } from './practice';

export type CoachMessage = { role: 'assistant' | 'user'; text: string };

export async function askMistakeCoach(messages: CoachMessage[], mistakes: PracticeQuestion[], current?: PracticeQuestion) {
  const mistakeContext = mistakes.slice(0, 10).map((question) => ({ subject: question.subject, topic: question.topic, question: question.question, correctExplanation: question.explanation }));
  const conversation = messages.slice(-6).map((message) => `${message.role === 'user' ? 'Ученик' : 'Наставник'}: ${message.text}`).join('\n');
  const currentContext = current ? { subject: current.subject, topic: current.topic, question: current.question, correctExplanation: current.explanation } : null;
  const system = 'Ты AI-наставник по работе над ошибками для школьника. Помогай понять ход решения. Сначала задавай наводящий вопрос или давай маленькую подсказку, а не готовый ответ. Пиши коротко, доброжелательно и по возрасту. Опирайся только на переданный контекст.';
  const prompt = `Сохранённые ошибки: ${JSON.stringify(mistakeContext)}. Текущий вопрос: ${JSON.stringify(currentContext)}. Диалог:\n${conversation}\nОтветь на последнее сообщение ученика.`;
  const { data, error } = await supabase.functions.invoke('ai', { body: { prompt, system, thinking: 'low' } });
  if (error) throw new Error(error.message);
  if (typeof data?.error === 'string') throw new Error(data.error);
  if (typeof data?.text !== 'string' || !data.text.trim()) throw new Error('Наставник не ответил.');
  return data.text.trim();
}
