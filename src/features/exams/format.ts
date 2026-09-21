import { APP_TIME_ZONE } from "@/lib/time";

// Zeitzone und Tageszuordnung sind app-weit gemeinsam (auch für Lernstreaks), siehe lib/time.ts.
export { dayKey } from "@/lib/time";

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

export function formatExamDateTime(iso: string) {
  return dateTimeFormat.format(new Date(iso));
}

export function formatExamTime(iso: string) {
  return timeFormat.format(new Date(iso));
}
