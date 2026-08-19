import type { PracticeQuestion } from './practice';

type QuizQuestion = Omit<PracticeQuestion, 'subject' | 'topic'>;

type LessonLike = {
  title: string;
  mission: string;
  sections: Array<{
    subject: string;
    topic: string;
    summary: string;
    keyPoints: string[];
    workedExample: string;
    quiz: QuizQuestion[];
  }>;
};

export function isValidQuestion(quiz: QuizQuestion) {
  if (typeof quiz.question !== 'string' || typeof quiz.explanation !== 'string') return false;
  const type = quiz.type ?? 'choice';
  if (type === 'short_answer') return Array.isArray(quiz.acceptedAnswers) && quiz.acceptedAnswers.length > 0 && quiz.acceptedAnswers.every((answer) => Boolean(answer.trim()));
  if (type === 'order') return Array.isArray(quiz.items) && quiz.items.length >= 3 && quiz.items.length <= 6 && new Set(quiz.items).size === quiz.items.length;
  return Array.isArray(quiz.options) && quiz.options.length >= 2 && Number.isInteger(quiz.correctIndex) && quiz.correctIndex! >= 0 && quiz.correctIndex! < quiz.options.length &&
    Array.isArray(quiz.wrongExplanations) && quiz.wrongExplanations.length === quiz.options.length && quiz.options.every((_option, index) => index === quiz.correctIndex || Boolean(quiz.wrongExplanations?.[index]?.trim()));
}

export function questionKey(question: string) {
  return question.toLocaleLowerCase('ru-RU').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

export function hasUniqueQuestions(questions: QuizQuestion[]) {
  return new Set(questions.map((question) => questionKey(question.question))).size === questions.length;
}

export function isValidLesson(lesson: LessonLike) {
  if (!Array.isArray(lesson.sections) || lesson.sections.length === 0) return false;
  const questionCount = lesson.sections.reduce((total, section) => total + (Array.isArray(section.quiz) ? section.quiz.length : 0), 0);
  return questionCount >= 10 && questionCount <= 15 && lesson.sections.every((section) =>
    typeof section.summary === 'string' && Array.isArray(section.quiz) && section.quiz.length > 0 &&
      section.quiz.every(isValidQuestion) && hasUniqueQuestions(section.quiz),
  );
}

export function isValidCore(lesson: LessonLike) {
  return typeof lesson.title === 'string' && typeof lesson.mission === 'string' && lesson.sections?.length === 1 &&
    lesson.sections.every((section) => typeof section.subject === 'string' && typeof section.topic === 'string' &&
      typeof section.summary === 'string' && Array.isArray(section.keyPoints) && section.keyPoints.length === 3 &&
      typeof section.workedExample === 'string');
}
