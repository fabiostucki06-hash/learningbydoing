import { MAX_CARD_TEXT } from "@/features/flashcards/types";
import {
  EXAM_OPTION_COUNT,
  MAX_EXAM_QUESTIONS,
  MAX_GENERATED_CARDS,
  type ExamQuestion,
  type GeneratedCard,
} from "./types";

const MAX_EXAM_TITLE = 200;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= max ? trimmed : null;
}

/**
 * Die Modellantwort ist nur nach dem Schema geformt, nicht garantiert brauchbar (Längen, leere Texte,
 * Duplikate). Deshalb wird jede Karte geprüft; ungültige fallen weg statt den ganzen Import zu kippen.
 */
export function parseFlashcards(raw: unknown): GeneratedCard[] {
  if (!isRecord(raw) || !Array.isArray(raw.cards)) return [];

  const seen = new Set<string>();
  const cards: GeneratedCard[] = [];

  for (const item of raw.cards) {
    if (!isRecord(item)) continue;
    const front = text(item.front, MAX_CARD_TEXT);
    const back = text(item.back, MAX_CARD_TEXT);
    if (!front || !back) continue;

    const key = front.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    cards.push({ front, back });
    if (cards.length >= MAX_GENERATED_CARDS) break;
  }

  return cards;
}

/** Prüft eine einzelne Frage. Gibt null zurück, wenn sie nicht sauber beantwortbar ist. */
function parseQuestion(item: unknown): ExamQuestion | null {
  if (!isRecord(item)) return null;

  const question = text(item.question, MAX_CARD_TEXT);
  const explanation = text(item.explanation, MAX_CARD_TEXT);
  if (!question || !explanation) return null;

  if (!Array.isArray(item.options) || item.options.length !== EXAM_OPTION_COUNT) return null;
  const options: string[] = [];
  for (const option of item.options) {
    const cleaned = text(option, MAX_CARD_TEXT);
    if (cleaned === null) return null;
    options.push(cleaned);
  }
  // Zwei gleiche Antworten machen die Frage mehrdeutig.
  if (new Set(options.map((option) => option.toLowerCase())).size !== options.length) return null;

  const { correctIndex } = item;
  if (
    typeof correctIndex !== "number" ||
    !Number.isInteger(correctIndex) ||
    correctIndex < 0 ||
    correctIndex >= EXAM_OPTION_COUNT
  ) {
    return null;
  }

  return { question, options, correctIndex, explanation };
}

/** Fragen aus einem beliebigen JSON-Wert, z. B. der jsonb-Spalte `mock_exams.questions`. */
export function parseExamQuestions(raw: unknown): ExamQuestion[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(parseQuestion)
    .filter((question): question is ExamQuestion => question !== null)
    .slice(0, MAX_EXAM_QUESTIONS);
}

export function parseExam(raw: unknown): { title: string | null; questions: ExamQuestion[] } {
  if (!isRecord(raw)) return { title: null, questions: [] };
  return {
    title: text(raw.title, MAX_EXAM_TITLE),
    questions: parseExamQuestions(raw.questions),
  };
}
