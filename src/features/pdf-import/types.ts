export type GenerateMode = "flashcards" | "exam";

export type ExamQuestion = {
  question: string;
  /** Immer genau EXAM_OPTION_COUNT Antworten. */
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type GeneratedCard = { front: string; back: string };

export type GenerateResponse = {
  error?: string;
  /** Anzahl neu angelegter Karten (mode = flashcards). */
  cards?: number;
  /** ID der neuen Probeprüfung (mode = exam). */
  examId?: string;
};

export const MAX_GENERATED_CARDS = 40;
export const MAX_EXAM_QUESTIONS = 15;
export const EXAM_OPTION_COUNT = 4;
