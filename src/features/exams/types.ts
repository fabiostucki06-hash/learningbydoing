import type { Tables } from "@/types/database";

export type ExamSummary = Pick<
  Tables<"exams">,
  "id" | "subject" | "title" | "starts_at" | "topics"
>;

/** Spalten, die alle Prüfungs-Ansichten laden. */
export const EXAM_COLUMNS = "id, subject, title, starts_at, topics";
