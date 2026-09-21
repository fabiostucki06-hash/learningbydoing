import type { ExamSummary } from "./types";
import { DAY_MS, formatCountdown, getUrgency } from "./urgency";

export type Reminder = {
  id: string;
  level: "critical" | "soon";
  title: string;
  text: string;
};

const MAX_REMINDERS = 3;

/**
 * In-App-Erinnerungen aus den anstehenden Prüfungen (Eingabe: nach Termin sortiert).
 * - unter 24 h: Schluss-Check
 * - unter 7 Tagen: Tagesplan, der die Themen gleichmäßig über die letzten Tage verteilt
 * Push-Benachrichtigungen können später dieselbe Funktion serverseitig nutzen.
 */
export function buildReminders(exams: ExamSummary[], now: number): Reminder[] {
  const reminders: Reminder[] = [];

  for (const exam of exams) {
    const msUntil = new Date(exam.starts_at).getTime() - now;
    const urgency = getUrgency(msUntil);

    if (urgency === "critical") {
      reminders.push({
        id: exam.id,
        level: "critical",
        title: `${exam.subject}: ${formatCountdown(msUntil)}`,
        text: "Letzter Check: Themen kurz durchgehen und das Material bereitlegen.",
      });
    } else if (urgency === "soon") {
      const daysLeft = Math.floor(msUntil / DAY_MS); // 1..6
      const title = `${exam.subject}: noch ${daysLeft} ${daysLeft === 1 ? "Tag" : "Tage"}`;
      const topic = exam.topics.length
        ? exam.topics[(6 - daysLeft) % exam.topics.length]
        : null;

      reminders.push({
        id: exam.id,
        level: "soon",
        title,
        text: topic
          ? `Heute lernen: ${topic}`
          : "Trag Themen bei der Prüfung ein, dann bekommst du einen Tagesplan.",
      });
    }
  }

  // Kritische zuerst; innerhalb der Stufe bleibt die Terminreihenfolge erhalten.
  reminders.sort((a, b) => Number(b.level === "critical") - Number(a.level === "critical"));
  return reminders.slice(0, MAX_REMINDERS);
}
