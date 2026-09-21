"use server";

import { createClient } from "@/lib/supabase/server";
import { nextReview } from "./srs";
import { UUID_PATTERN } from "./types";

export type ReviewActionResult = { error?: string };

/**
 * Bewertet eine Karte und schreibt den neuen SRS-Zustand plus einen Review-Eintrag.
 * Box und Fälligkeit werden hier berechnet und nie vom Client übernommen.
 * RLS stellt sicher, dass nur eigene Karten gelesen und geändert werden.
 */
export async function reviewCard(cardId: string, known: boolean): Promise<ReviewActionResult> {
  if (!UUID_PATTERN.test(cardId) || typeof known !== "boolean") {
    return { error: "Ungültige Anfrage." };
  }

  const supabase = await createClient();

  const { data: card, error: readError } = await supabase
    .from("cards")
    .select("id, box")
    .eq("id", cardId)
    .maybeSingle();

  if (readError || !card) return { error: "Karte nicht gefunden." };

  const now = new Date();
  const next = nextReview(card.box, known, now);

  const { error: updateError } = await supabase
    .from("cards")
    .update({
      box: next.box,
      due_at: next.dueAt.toISOString(),
      last_reviewed_at: now.toISOString(),
    })
    .eq("id", cardId);

  if (updateError) return { error: "Bewertung konnte nicht gespeichert werden." };

  const { error: reviewError } = await supabase.from("reviews").insert({
    card_id: cardId,
    known,
    box_before: card.box,
    box_after: next.box,
  });

  // Karte ist schon aktualisiert; nur die Statistik fehlt. Trotzdem melden statt still zu schlucken.
  if (reviewError) return { error: "Statistik konnte nicht gespeichert werden." };

  return {};
}
