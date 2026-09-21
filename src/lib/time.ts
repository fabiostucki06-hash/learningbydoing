/**
 * Alle Termine und Lerntage werden in einer festen Zeitzone dargestellt. Das macht Server- und
 * Client-Render identisch (kein Hydration-Mismatch). Die Datenbank rechnet für Lerntage ebenfalls
 * in Europe/Zurich (reviews.reviewed_on).
 */
export const APP_TIME_ZONE = "Europe/Zurich";

// en-CA liefert ISO-Reihenfolge "YYYY-MM-DD".
const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Kalendertag ("YYYY-MM-DD") eines Zeitpunkts in APP_TIME_ZONE. */
export function dayKey(value: string | number | Date) {
  return dayKeyFormat.format(new Date(value));
}
