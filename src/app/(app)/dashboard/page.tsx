import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, ChevronRight, FileText, GraduationCap, Radar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Start" };

const UPCOMING = [
  {
    icon: CalendarClock,
    title: "Nächste Prüfung",
    text: "Live-Countdown, sobald du Prüfungen anlegst.",
  },
  {
    icon: Radar,
    title: "Wissenslücken-Radar",
    text: "Zeigt, welche Themen noch Lernbedarf haben.",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { count: documentCount }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user!.id).single(),
    // RLS zählt nur die eigenen Dokumente.
    supabase.from("documents").select("id", { count: "exact", head: true }),
  ]);

  const name = profile?.display_name;

  return (
    <div className="flex flex-col gap-4">
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

      <h2 className="mt-2 text-sm font-medium text-muted">Bald verfügbar</h2>
      <ul className="flex flex-col gap-3">
        {UPCOMING.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Icon aria-hidden className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium">{title}</h3>
              <p className="text-sm text-muted">{text}</p>
            </div>
            <ChevronRight aria-hidden className="size-4 shrink-0 text-muted" />
          </li>
        ))}
      </ul>
    </div>
  );
}
