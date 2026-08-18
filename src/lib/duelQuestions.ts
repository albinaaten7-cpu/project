import type { PracticeQuestion } from './practice';

export const DUEL_QUESTIONS: PracticeQuestion[] = [
  { subject: 'Математика', topic: 'Устный счёт', question: 'Сколько будет 15 × 6?', type: 'choice', options: ['80', '90', '100', '120'], correctIndex: 1, explanation: '15 × 6 = 90.' },
  { subject: 'Логика', topic: 'Последовательности', question: 'Какое число следующее: 2, 4, 8, 16, …?', type: 'choice', options: ['18', '24', '30', '32'], correctIndex: 3, explanation: 'Каждое число умножается на 2, поэтому 16 × 2 = 32.' },
  { subject: 'Русский язык', topic: 'Части речи', question: 'Какая часть речи отвечает на вопрос «что делать?»', type: 'choice', options: ['Существительное', 'Глагол', 'Прилагательное', 'Наречие'], correctIndex: 1, explanation: 'На вопросы «что делать?» и «что сделать?» отвечает глагол.' },
  { subject: 'География', topic: 'Материки', question: 'Какой материк самый большой?', type: 'choice', options: ['Африка', 'Евразия', 'Австралия', 'Южная Америка'], correctIndex: 1, explanation: 'Евразия — крупнейший материк Земли.' },
  { subject: 'Биология', topic: 'Растения', question: 'Как называется процесс, при котором растения создают питательные вещества из света?', type: 'choice', options: ['Дыхание', 'Испарение', 'Фотосинтез', 'Прорастание'], correctIndex: 2, explanation: 'Этот процесс называется фотосинтезом.' },
] as const;
