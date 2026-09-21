/**
 * Spaced Repetition nach Leitner mit 5 Boxen.
 * Gewusst: eine Box höher, Fälligkeit nach dem Intervall der neuen Box.
 * Nicht gewusst: zurück in Box 1, kurze Wiedervorlage (RELEARN_DELAY_MS).
 */

export const MIN_BOX = 1;
export const MAX_BOX = 5;

/** Intervall in Tagen je Box (Index = Box - 1). */
export const BOX_INTERVAL_DAYS = [1, 2, 4, 8, 16] as const;

/** Ab dieser Box gilt eine Karte als "gelernt" (für die Fortschrittsanzeige). */
export const MASTERED_BOX = 4;

export const RELEARN_DELAY_MS = 10 * 60 * 1000;

const DAY_MS = 24 * 60 * 60 * 1000;

function clampBox(box: number) {
  if (!Number.isFinite(box)) return MIN_BOX;
  return Math.min(MAX_BOX, Math.max(MIN_BOX, Math.round(box)));
}

export type ReviewResult = { box: number; dueAt: Date };

export function nextReview(currentBox: number, known: boolean, now: Date): ReviewResult {
  if (!known) {
    return { box: MIN_BOX, dueAt: new Date(now.getTime() + RELEARN_DELAY_MS) };
  }

  const box = Math.min(MAX_BOX, clampBox(currentBox) + 1);
  return { box, dueAt: new Date(now.getTime() + BOX_INTERVAL_DAYS[box - 1] * DAY_MS) };
}

export function isDue(dueAt: string, now: number) {
  return new Date(dueAt).getTime() <= now;
}

export function isMastered(box: number) {
  return box >= MASTERED_BOX;
}

function previousDayKey(key: string) {
  return new Date(Date.parse(`${key}T00:00:00Z`) - DAY_MS).toISOString().slice(0, 10);
}

/**
 * Streak = aufeinanderfolgende Lerntage bis heute. Wer heute noch nicht gelernt hat, behält den
 * Streak vom Vortag (er reißt erst, wenn auch gestern gefehlt hat).
 * @param days Lerntage als "YYYY-MM-DD", beliebige Reihenfolge
 */
export function computeStreak(days: string[], todayKey: string): number {
  const studied = new Set(days);

  let cursor = todayKey;
  if (!studied.has(cursor)) cursor = previousDayKey(cursor);

  let streak = 0;
  while (studied.has(cursor)) {
    streak += 1;
    cursor = previousDayKey(cursor);
  }
  return streak;
}
