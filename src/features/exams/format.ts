/**
 * Alle Termine werden in einer festen Zeitzone dargestellt. Das macht Server- und Client-Render
 * identisch (kein Hydration-Mismatch) und hält Tages-Zuordnung im Kalender stabil.
 */
export const APP_TIME_ZONE = "Europe/Zurich";

const dateTimeFormat = new Intl.DateTimeFormat("de-CH", {
  timeZone: APP_TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const timeFormat = new Intl.DateTimeFormat("de-CH", {
  timeZone: APP_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

// en-CA liefert ISO-Reihenfolge "YYYY-MM-DD".
const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatExamDateTime(iso: string) {
  return dateTimeFormat.format(new Date(iso));
}

export function formatExamTime(iso: string) {
  return timeFormat.format(new Date(iso));
}

/** Kalendertag ("YYYY-MM-DD") eines Zeitpunkts in APP_TIME_ZONE. */
export function dayKey(value: string | number | Date) {
  return dayKeyFormat.format(new Date(value));
}
