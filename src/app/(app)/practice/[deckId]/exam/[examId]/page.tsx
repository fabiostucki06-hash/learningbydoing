import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buttonStyles } from "@/components/ui/button";
import { UUID_PATTERN } from "@/features/flashcards/types";
import { ExamSession } from "@/features/pdf-import/components/exam-session";
import { parseExamQuestions } from "@/features/pdf-import/parse";

export const metadata: Metadata = { title: "Probeprüfung" };

export default async function ExamPage({
  params,
}: {
  params: Promise<{ deckId: string; examId: string }>;
}) {
  const { deckId, examId } = await params;
  if (!UUID_PATTERN.test(deckId) || !UUID_PATTERN.test(examId)) notFound();

  const supabase = await createClient();

  // RLS: fremde Prüfungen liefern keine Zeile und damit 404. Das Deck muss zur URL passen.
  const { data: exam } = await supabase
    .from("mock_exams")
    .select("id, title, questions, deck_id, decks(title)")
    .eq("id", examId)
    .eq("deck_id", deckId)
    .maybeSingle();
  if (!exam) notFound();

  // Die Spalte ist jsonb: nicht blind vertrauen, sondern wie beim Erzeugen prüfen.
  const questions = parseExamQuestions(exam.questions);

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Keine Fragen</h1>
        <p className="text-sm text-muted">Diese Probeprüfung enthält keine lesbaren Fragen.</p>
        <Link href={`/practice/${deckId}`} className={buttonStyles("primary", "w-full")}>
          Zurück zum Deck
        </Link>
      </div>
    );
  }

  return (
    <ExamSession
      deckId={deckId}
      deckTitle={exam.decks?.title ?? "Deck"}
      title={exam.title}
      questions={questions}
    />
  );
}
