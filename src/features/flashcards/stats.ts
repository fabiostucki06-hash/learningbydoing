import { isDue, isMastered } from "./srs";

type CardState = { box: number; due_at: string };

export type DeckStats = {
  total: number;
  due: number;
  mastered: number;
  /** Anteil gelernter Karten (Box >= MASTERED_BOX) in Prozent, 0-100. */
  masteredPercent: number;
};

export function summarizeCards(cards: CardState[], now: number): DeckStats {
  const total = cards.length;
  const due = cards.filter((card) => isDue(card.due_at, now)).length;
  const mastered = cards.filter((card) => isMastered(card.box)).length;

  return {
    total,
    due,
    mastered,
    masteredPercent: total === 0 ? 0 : Math.round((mastered / total) * 100),
  };
}
