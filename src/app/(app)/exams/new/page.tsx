import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ExamForm } from "@/features/exams/components/exam-form";

export const metadata: Metadata = { title: "Neue Prüfung" };

export default function NewExamPage() {
  return (
    <>
      <Link
        href="/exams"
        className="pressable -ml-2 mb-2 inline-flex h-11 items-center gap-1 rounded-xl px-2 text-sm text-muted"
      >
        <ChevronLeft aria-hidden className="size-4" />
        Prüfungen
      </Link>

      <PageHeader title="Neue Prüfung" />

      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <ExamForm />
      </div>
    </>
  );
}
