import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, ChevronRight, FileText, GraduationCap, Radar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ExamCard } from "@/features/exams/components/exam-card";
import { ReminderList } from "@/features/exams/components/reminder-list";
import { getServerNow } from "@/features/exams/now";
import { buildReminders } from "@/features/exams/reminders";
import { EXAM_COLUMNS } from "@/features/exams/types";

export const metadata: Metadata = { title: "Start" };

const WIDGET_EXAMS = 3;
const REMINDER_LOOKAHEAD = 10;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = getServerNow();

  const [{ data: profile }, { count: documentCount }, { data: upcomingExams }] =
    await Promise.all([
      supabase.from("profiles").select("display_name").eq("id", user!.id).single(),
      // RLS zählt nur die eigenen Dokumente.
      supabase.from("documents").select("id", { count: "exact", head: true }),
      supabase
        .from("exams")
        .select(EXAM_COLUMNS)
        .gt("starts_at", new Date(now).toISOString())
        .order("starts_at", { ascending: true })
        .limit(REMINDER_LOOKAHEAD),
    ]);

  const name = profile?.display_name;
  const exams = upcomingExams ?? [];
  const reminders = buildReminders(exams, now);

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white shadow-lg shadow-indigo-500/20">
        <p className="text-sm text-white/80">Willkommen zurück</p>
        <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight">
          {name ? `Hallo, ${name} 👋` : "Hallo 👋"}
        </h1>
        <p className="mt-3 text-sm text-white/90">
          {documentCount
            ? `${documentCount} ${documentCount === 1 ? "Dokument" : "Dokumente"} in deiner Bibliothek.`
            : "Lade dein erstes PDF hoch und leg los."}
        </p>
      </section>

      <section aria-label="Nächste Prüfungen">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted">Nächste Prüfungen</h2>
          {exams.length > 0 && (
            <Link
              href="/exams"
              className="pressable -mr-2 inline-flex h-11 items-center gap-0.5 px-2 text-sm font-medium text-brand"
            >
              Alle
              <ChevronRight aria-hidden className="size-4" />
            </Link>
          )}
        </div>

        {exams.length === 0 ? (
          <Link
            href="/exams/new"
            className="pressable flex items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-4 shadow-sm"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <CalendarPlus aria-hidden className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-medium">Erste Prüfung eintragen</span>
              <span className="block text-sm text-muted">
                Countdown und Lernplan starten automatisch.
              </span>
            </span>
          </Link>
        ) : (
          <ul className="flex flex-col gap-3">
            {exams.slice(0, WIDGET_EXAMS).map((exam) => (
              <ExamCard key={exam.id} exam={exam} serverNow={now} showDelete={false} />
            ))}
          </ul>
        )}
      </section>

      <ReminderList reminders={reminders} />

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/documents"
          className="pressable flex min-h-24 flex-col justify-between rounded-2xl border border-border bg-surface p-4 shadow-sm"
        >
          <FileText aria-hidden className="size-6 text-brand" />
          <span className="text-sm font-medium">PDF hochladen</span>
        </Link>
        <Link
          href="/practice"
          className="pressable flex min-h-24 flex-col justify-between rounded-2xl border border-border bg-surface p-4 shadow-sm"
        >
          <GraduationCap aria-hidden className="size-6 text-brand" />
          <span className="text-sm font-medium">Üben</span>
        </Link>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Radar aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium">Wissenslücken-Radar</h3>
          <p className="text-sm text-muted">Zeigt, welche Themen noch Lernbedarf haben.</p>
        </div>
        <span className="shrink-0 rounded-full bg-surface-hover px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted">
          bald
        </span>
      </div>
    </div>
  );
}
