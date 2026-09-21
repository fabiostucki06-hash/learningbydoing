import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { describeSupabaseError } from "@/lib/supabase/errors";
import { PageHeader } from "@/components/layout/page-header";
import { buttonStyles } from "@/components/ui/button";
import { ExamCalendar } from "@/features/exams/components/exam-calendar";
import { ExamCard } from "@/features/exams/components/exam-card";
import { getServerNow } from "@/features/exams/now";
import { EXAM_COLUMNS } from "@/features/exams/types";

export const metadata: Metadata = { title: "Prüfungen" };

const MAX_PAST_EXAMS = 10;

export default async function ExamsPage() {
  const supabase = await createClient();

  // RLS filtert automatisch auf die Prüfungen des eingeloggten Nutzers.
  const { data, error } = await supabase
    .from("exams")
    .select(EXAM_COLUMNS)
    .order("starts_at", { ascending: true });

  const exams = data ?? [];
  const now = getServerNow();
  const upcoming = exams.filter((exam) => new Date(exam.starts_at).getTime() > now);
  const past = exams
    .filter((exam) => new Date(exam.starts_at).getTime() <= now)
    .reverse()
    .slice(0, MAX_PAST_EXAMS);

  return (
    <>
      <PageHeader title="Prüfungen" description="Termine, Themen und Countdown an einem Ort." />

      <Link href="/exams/new" className={buttonStyles("primary", "mb-5 w-full")}>
        <CalendarPlus aria-hidden className="size-4" />
        Neue Prüfung
      </Link>

      {error ? (
        <p role="alert" className="break-words text-sm text-red-600 dark:text-red-400">
          {describeSupabaseError(error, "Prüfungen konnten nicht geladen werden.", "exams.select")}
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          <ExamCalendar exams={exams} serverNow={now} />

          <section>
            <h2 className="mb-3 text-sm font-medium text-muted">Anstehend</h2>
            {upcoming.length === 0 ? (
              <p className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted shadow-sm">
                Keine anstehenden Prüfungen. Trag deinen nächsten Termin ein.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {upcoming.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} serverNow={now} />
                ))}
              </ul>
            )}
          </section>

          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium text-muted">Vergangen</h2>
              <ul className="flex flex-col gap-3">
                {past.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} serverNow={now} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </>
  );
}
