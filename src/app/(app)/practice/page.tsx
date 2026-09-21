import type { Metadata } from "next";
import { BookOpen, CalendarClock, Library, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Üben" };

const MODES = [
  { icon: BookOpen, title: "Lernkarten", text: "Spaced Repetition aus deinen PDFs." },
  { icon: CalendarClock, title: "Prüfungsplaner", text: "Countdown und Lernplan bis zum Termin." },
  { icon: Library, title: "Altprüfungen", text: "Regionale Datenbank mit Prüfungen zum Üben." },
  { icon: Users, title: "Lerngruppen", text: "Gemeinsam lernen und Fortschritt teilen." },
];

export default function PracticePage() {
  return (
    <>
      <PageHeader title="Üben" description="Diese Lernmodi kommen als Nächstes." />

      <ul className="flex flex-col gap-3">
        {MODES.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Icon aria-hidden className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-medium">{title}</h2>
              <p className="text-sm text-muted">{text}</p>
            </div>
            <span className="shrink-0 rounded-full bg-surface-hover px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted">
              bald
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
