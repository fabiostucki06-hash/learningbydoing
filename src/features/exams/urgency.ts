export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;

export type Urgency = "past" | "critical" | "soon" | "normal";

/** Dringlichkeit anhand der Restzeit: < 24 h kritisch, < 7 Tage bald, sonst normal. */
export function getUrgency(msUntil: number): Urgency {
  if (msUntil <= 0) return "past";
  if (msUntil < DAY_MS) return "critical";
  if (msUntil < 7 * DAY_MS) return "soon";
  return "normal";
}

export function formatCountdown(msUntil: number): string {
  if (msUntil <= 0) return "Vorbei";

  const minutes = Math.max(1, Math.floor(msUntil / 60_000));
  if (minutes < 60) return `in ${minutes} Min.`;

  if (msUntil < DAY_MS) {
    const hours = Math.floor(minutes / 60);
    return `in ${hours} Std. ${minutes % 60} Min.`;
  }

  const days = Math.floor(msUntil / DAY_MS);
  return days === 1 ? "in 1 Tag" : `in ${days} Tagen`;
}

/**
 * Farben sind nie das einzige Signal: Der Countdown-Text und das Label tragen die Information,
 * die Farbe verstärkt sie nur.
 */
export const URGENCY_STYLES: Record<
  Urgency,
  { card: string; pill: string; label: string | null }
> = {
  critical: {
    card: "border-red-500/40 bg-red-500/5",
    pill: "bg-red-500/15 text-red-700 dark:text-red-300",
    label: "Unter 24 Std.",
  },
  soon: {
    card: "border-amber-500/40 bg-amber-500/5",
    pill: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
    label: "Diese Woche",
  },
  normal: {
    card: "border-border bg-surface",
    pill: "bg-brand/10 text-brand",
    label: null,
  },
  past: {
    card: "border-border bg-surface opacity-70",
    pill: "bg-surface-hover text-muted",
    label: null,
  },
};
