"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ExamSummary } from "../types";
import { dayKey, formatExamTime } from "../format";
import { useNow } from "../use-now";
import { getUrgency, type Urgency } from "../urgency";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const DOT_COLORS: Record<Urgency, string> = {
  critical: "bg-red-500",
  soon: "bg-amber-500",
  normal: "bg-brand",
  past: "bg-muted",
};

type Cursor = { year: number; month: number }; // month: 0-11

function toKey({ year, month }: Cursor, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Monatsansicht: Tage mit Prüfungen tragen einen Punkt in Dringlichkeitsfarbe. */
export function ExamCalendar({
  exams,
  serverNow,
}: {
  exams: ExamSummary[];
  serverNow: number;
}) {
  const now = useNow(serverNow);
  const todayKey = dayKey(now);

  const [cursor, setCursor] = useState<Cursor>(() => {
    const [year, month] = dayKey(serverNow).split("-").map(Number);
    return { year, month: month - 1 };
  });
  const [selected, setSelected] = useState<string | null>(null);

  const examsByDay = useMemo(() => {
    const map = new Map<string, ExamSummary[]>();
    for (const exam of exams) {
      const key = dayKey(exam.starts_at);
      map.set(key, [...(map.get(key) ?? []), exam]);
    }
    return map;
  }, [exams]);

  // Reine Kalender-Arithmetik in UTC: unabhängig von der Zeitzone des Geräts.
  const firstOfMonth = new Date(Date.UTC(cursor.year, cursor.month, 1));
  const leadingBlanks = (firstOfMonth.getUTCDay() + 6) % 7; // Woche beginnt am Montag
  const daysInMonth = new Date(Date.UTC(cursor.year, cursor.month + 1, 0)).getUTCDate();
  const monthLabel = firstOfMonth.toLocaleString("de-CH", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  function shiftMonth(delta: number) {
    setCursor(({ year, month }) => {
      const next = new Date(Date.UTC(year, month + delta, 1));
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });
    setSelected(null);
  }

  const selectedExams = selected ? (examsByDay.get(selected) ?? []) : [];

  return (
    <section
      aria-label="Prüfungskalender"
      className="rounded-2xl border border-border bg-surface p-3 shadow-sm"
    >
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          aria-label="Vorheriger Monat"
          className="pressable flex size-11 items-center justify-center rounded-xl text-muted hover:bg-surface-hover"
        >
          <ChevronLeft aria-hidden className="size-5" />
        </button>
        <h2 className="font-medium capitalize">{monthLabel}</h2>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label="Nächster Monat"
          className="pressable flex size-11 items-center justify-center rounded-xl text-muted hover:bg-surface-hover"
        >
          <ChevronRight aria-hidden className="size-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted">
        {WEEKDAYS.map((day) => (
          <span key={day} className="py-1">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <span key={`blank-${i}`} aria-hidden />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const key = toKey(cursor, day);
          const dayExams = examsByDay.get(key);
          const isToday = key === todayKey;
          const isSelected = key === selected;

          // Punktfarbe nach dem dringendsten (frühesten noch offenen) Termin des Tages.
          const urgency = dayExams
            ? dayExams
                .map((exam) => getUrgency(new Date(exam.starts_at).getTime() - now))
                .sort((a, b) => Object.keys(DOT_COLORS).indexOf(a) - Object.keys(DOT_COLORS).indexOf(b))[0]
            : null;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(isSelected ? null : key)}
              aria-pressed={isSelected}
              aria-label={`${day}. ${monthLabel}${
                dayExams ? `, ${dayExams.length} ${dayExams.length === 1 ? "Prüfung" : "Prüfungen"}` : ""
              }`}
              className={`pressable relative flex h-11 items-center justify-center rounded-xl text-sm ${
                isSelected
                  ? "bg-brand font-semibold text-white"
                  : isToday
                    ? "font-semibold text-brand ring-1 ring-brand/40"
                    : "hover:bg-surface-hover"
              }`}
            >
              {day}
              {urgency && (
                <span
                  aria-hidden
                  className={`absolute bottom-1.5 size-1.5 rounded-full ${
                    isSelected ? "bg-white" : DOT_COLORS[urgency]
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-3 border-t border-border pt-3">
          {selectedExams.length === 0 ? (
            <p className="text-sm text-muted">Keine Prüfung an diesem Tag.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {selectedExams.map((exam) => (
                <li key={exam.id} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-medium">
                    {exam.title ? `${exam.subject} · ${exam.title}` : exam.subject}
                  </span>
                  <span className="shrink-0 text-muted">{formatExamTime(exam.starts_at)} Uhr</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
