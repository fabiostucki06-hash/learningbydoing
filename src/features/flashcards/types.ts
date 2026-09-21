import type { Tables } from "@/types/database";

export type Deck = Pick<Tables<"decks">, "id" | "title" | "created_at">;

export type Card = Pick<Tables<"cards">, "id" | "deck_id" | "front" | "back" | "box" | "due_at">;

/** Was die Lernansicht pro Karte braucht. */
export type StudyCard = Pick<Card, "id" | "front" | "back">;

export const MAX_CARD_TEXT = 2000;
export const MAX_DECK_TITLE = 100;
/** Maximale Kartenzahl pro Lernrunde, damit Sitzungen überschaubar bleiben. */
export const STUDY_SESSION_LIMIT = 30;

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
