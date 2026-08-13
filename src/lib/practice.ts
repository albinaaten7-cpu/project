export type PracticeQuestion = {
  subject: string;
  topic: string;
  question: string;
  type?: 'choice' | 'true_false' | 'short_answer' | 'order';
  options?: string[];
  correctIndex?: number;
  explanation: string;
  wrongExplanations?: string[];
  acceptedAnswers?: string[];
  items?: string[];
};
