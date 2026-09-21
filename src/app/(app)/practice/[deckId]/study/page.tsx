import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buttonStyles } from "@/components/ui/button";
import { getServerNow } from "@/features/exams/now";
import { StudySession } from "@/features/flashcards/components/study-session";
import { STUDY_SESSION_LIMIT, UUID_PATTERN } from "@/features/flashcards/types";

export const metadata: Metadata = { title: "Lernen" };

export default async function StudyPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = await params;
  if (!UUID_PATTERN.test(deckId)) notFound();

  const supabase = await createClient();

  const { data: deck } = await supabase
    .from("decks")
    .select("id, title")
    .eq("id", deckId)
    .maybeSingle();
  if (!deck) notFound();

  // Fällige Karten, die am längsten warten zuerst. Neue Karten sind sofort fällig.
  const { data: cards } = await supabase
    .from("cards")
    .select("id, front, back")
    .eq("deck_id", deckId)
    .lte("due_at", new Date(getServerNow()).toISOString())
    .order("due_at", { ascending: true })
    .limit(STUDY_SESSION_LIMIT);

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Nichts fällig</h1>
        <p className="text-sm text-muted">In diesem Deck ist gerade keine Karte zu wiederholen.</p>
        <Link href={`/practice/${deck.id}`} className={buttonStyles("primary", "w-full")}>
          Zurück zum Deck
        </Link>
      </div>
    );
  }

  return <StudySession deckId={deck.id} deckTitle={deck.title} cards={cards} />;
}
