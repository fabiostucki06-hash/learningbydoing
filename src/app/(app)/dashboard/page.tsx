import type { Metadata } from "next";
import { CalendarClock, FileText, Radar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

const PLACEHOLDERS = [
  {
    icon: CalendarClock,
    title: "Nächste Prüfung",
    text: "Sobald du Prüfungen anlegst, siehst du hier den Live-Countdown.",
  },
  {
    icon: FileText,
    title: "Deine Dokumente",
    text: "Lade ein PDF hoch und lass Karteikarten und Quiz erzeugen.",
  },
  {
    icon: Radar,
    title: "Wissenslücken-Radar",
    text: "Zeigt dir, welche Themen noch Lernbedarf haben.",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user!.id)
    .single();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Hallo{profile?.display_name ? `, ${profile.display_name}` : ""} 👋
      </h1>
      <p className="mt-1 text-muted">Schön, dass du da bist. Los geht&apos;s mit dem Lernen.</p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLACEHOLDERS.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
          >
            <Icon aria-hidden className="size-6 text-brand" />
            <h2 className="mt-3 font-medium">{title}</h2>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
