import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ClipboardCheck, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { describeSupabaseError } from "@/lib/supabase/errors";
import { buttonStyles } from "@/components/ui/button";
import { formatExamDateTime } from "@/features/exams/format";
import { getServerNow } from "@/features/exams/now";
import { CardForm } from "@/features/flashcards/components/card-form";
import {
  DeleteCardButton,
  DeleteDeckButton,
  DeleteExamButton,
} from "@/features/flashcards/components/delete-buttons";
import { ProgressBar } from "@/features/flashcards/components/progress-bar";
import { isDue } from "@/features/flashcards/srs";
import { summarizeCards } from "@/features/flashcards/stats";
import { UUID_PATTERN } from "@/features/flashcards/types";
import { PdfImport } from "@/features/pdf-import/components/pdf-import";

export const metadata: Metadata = { title: "Deck" };

export default async function DeckPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = await params;
  if (!UUID_PATTERN.test(deckId)) notFound();

  const supabase = await createClient();

  // RLS: fremde Decks liefern keine Zeile und damit 404.
  const { data: deck } = await supabase
    .from("decks")
    .select("id, title")
    .eq("id", deckId)
    .maybeSingle();
  if (!deck) notFound();

  const { data: cardsData, error } = await supabase
    .from("cards")
    .select("id, front, back, box, due_at")
    .eq("deck_id", deckId)
    .order("created_at", { ascending: false });

  const { data: examsData, error: examsError } = await supabase
    .from("mock_exams")
    .select("id, title, created_at, questions")
    .eq("deck_id", deckId)
    .order("created_at", { ascending: false });
  const exams = examsData ?? [];

  const cards = cardsData ?? [];
  const now = getServerNow();
  const stats = summarizeCards(cards, now);
  const nextDue = cards
    .filter((card) => !isDue(card.due_at, now))
    .map((card) => card.due_at)
    .sort()[0];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href="/practice"
          className="pressable -ml-2 inline-flex h-11 items-center gap-1 rounded-xl px-2 text-sm text-muted"
        >
          <ChevronLeft aria-hidden className="size-4" />
          Üben
        </Link>
        <div className="flex items-start gap-2">
          <h1 className="min-w-0 flex-1 break-words text-2xl font-semibold tracking-tight">
            {deck.title}
          </h1>
          <DeleteDeckButton id={deck.id} title={deck.title} />
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <dl className="grid grid-cols-3 gap-2 text-center">
          <div>
            <dt className="text-[11px] text-muted">Karten</dt>
            <dd className="text-lg font-semibold">{stats.total}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted">Fällig</dt>
            <dd className="text-lg font-semibold">{stats.due}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted">Gelernt</dt>
            <dd className="text-lg font-semibold">{stats.masteredPercent} %</dd>
          </div>
        </dl>
        <div className="mt-3">
          <ProgressBar percent={stats.masteredPercent} label="Gelernte Karten" />
        </div>
      </section>

      {stats.due > 0 ? (
        <Link href={`/practice/${deck.id}/study`} className={buttonStyles("primary", "w-full")}>
          <Play aria-hidden className="size-4" />
          Lernen ({stats.due} fällig)
        </Link>
      ) : (
        <p className="rounded-2xl border border-border bg-surface p-4 text-center text-sm text-muted shadow-sm">
          {stats.total === 0
            ? "Füge deine erste Karte hinzu, dann kannst du lernen."
            : `Alles erledigt. Nächste Karte fällig: ${formatExamDateTime(nextDue)}.`}
        </p>
      )}

      <PdfImport deckId={deck.id} />

      {(exams.length > 0 || examsError) && (
        <section aria-label="Probeprüfungen">
          <h2 className="mb-3 text-sm font-medium text-muted">Probeprüfungen ({exams.length})</h2>
          {examsError ? (
            <p role="alert" className="break-words text-sm text-red-600 dark:text-red-400">
              {describeSupabaseError(
                examsError,
                "Probeprüfungen konnten nicht geladen werden.",
                "mock_exams.select",
              )}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {exams.map((exam) => (
                <li
                  key={exam.id}
                  className="flex items-center gap-2 rounded-2xl border border-border bg-surface p-2 pl-4 shadow-sm"
                >
                  <Link
                    href={`/practice/${deck.id}/exam/${exam.id}`}
                    className="pressable flex min-h-11 min-w-0 flex-1 items-center gap-3"
                  >
                    <ClipboardCheck aria-hidden className="size-5 shrink-0 text-brand" />
                    <span className="min-w-0">
                      <span className="line-clamp-2 break-words font-medium">{exam.title}</span>
                      <span className="text-xs text-muted">
                        {Array.isArray(exam.questions) ? exam.questions.length : 0} Fragen
                      </span>
                    </span>
                  </Link>
                  <DeleteExamButton id={exam.id} title={exam.title} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <CardForm deckId={deck.id} />

      <section aria-label="Karten">
        <h2 className="mb-3 text-sm font-medium text-muted">Karten ({stats.total})</h2>
        {error ? (
          <p role="alert" className="break-words text-sm text-red-600 dark:text-red-400">
            {describeSupabaseError(error, "Karten konnten nicht geladen werden.", "cards.select")}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {cards.map((card) => (
              <li
                key={card.id}
                className="flex items-start gap-2 rounded-2xl border border-border bg-surface p-4 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 break-words font-medium">{card.front}</p>
                  <p className="mt-1 line-clamp-2 break-words text-sm text-muted">{card.back}</p>
                  <span className="mt-2 inline-block rounded-full bg-surface-hover px-2.5 py-0.5 text-[11px] text-muted">
                    Box {card.box} von 5
                  </span>
                </div>
                <DeleteCardButton id={card.id} label={card.front.slice(0, 40)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
