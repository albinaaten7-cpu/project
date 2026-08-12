export type PracticeQuestion = {
  subject: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  wrongExplanations?: string[];
};
