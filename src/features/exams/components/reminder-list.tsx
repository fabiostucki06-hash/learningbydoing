import { Bell } from "lucide-react";
import type { Reminder } from "../reminders";

const LEVEL_STYLES: Record<Reminder["level"], string> = {
  critical: "border-red-500/40 bg-red-500/5",
  soon: "border-amber-500/40 bg-amber-500/5",
};

/** In-App-Erinnerungen und Lernimpulse für die nächsten Prüfungen. */
export function ReminderList({ reminders }: { reminders: Reminder[] }) {
  if (reminders.length === 0) return null;

  return (
    <section aria-label="Erinnerungen">
      <h2 className="mb-3 text-sm font-medium text-muted">Erinnerungen</h2>
      <ul className="flex flex-col gap-3">
        {reminders.map((reminder) => (
          <li
            key={reminder.id}
            className={`flex items-start gap-3 rounded-2xl border p-4 shadow-sm ${LEVEL_STYLES[reminder.level]}`}
          >
            <Bell aria-hidden className="mt-0.5 size-5 shrink-0 text-muted" />
            <div className="min-w-0">
              <h3 className="font-medium">{reminder.title}</h3>
              <p className="text-sm text-muted">{reminder.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
