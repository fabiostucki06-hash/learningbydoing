import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Layers, Library, Plus, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { describeSupabaseError } from "@/lib/supabase/errors";
import { dayKey } from "@/lib/time";
import { PageHeader } from "@/components/layout/page-header";
import { buttonStyles } from "@/components/ui/button";
import { ProgressBar } from "@/features/flashcards/components/progress-bar";
import { StatsStrip } from "@/features/flashcards/components/stats-strip";
import { computeStreak } from "@/features/flashcards/srs";
import { summarizeCards } from "@/features/flashcards/stats";
import { getServerNow } from "@/features/exams/now";

export const metadata: Metadata = { title: "Üben" };

const UPCOMING = [
  { icon: Library, title: "Altprüfungen", text: "Regionale Datenbank mit Prüfungen zum Üben." },
  { icon: Users, title: "Lerngruppen", text: "Gemeinsam lernen und Fortschritt teilen." },
];

export default async function PracticePage() {
  const supabase = await createClient();
  const now = getServerNow();
  const today = dayKey(now);

  // RLS beschränkt alles auf den eingeloggten Nutzer. Hinweis: PostgREST liefert standardmäßig
  // höchstens 1000 Zeilen; bei sehr vielen Karten müsste die Statistik in die Datenbank wandern.
  const [decksResult, cardsResult, studyDaysResult, todayResult] = await Promise.all([
    supabase.from("decks").select("id, title, created_at").order("created_at", { ascending: false }),
    supabase.from("cards").select("deck_id, box, due_at"),
    supabase.rpc("study_days"),
    supabase.from("reviews").select("known").eq("reviewed_on", today),
  ]);

  const decks = decksResult.data ?? [];
  const cards = cardsResult.data ?? [];
  const todayReviews = todayResult.data ?? [];

  const streak = computeStreak((studyDaysResult.data ?? []).map((row) => row.day), today);
  const accuracyToday = todayReviews.length
    ? Math.round((todayReviews.filter((r) => r.known).length / todayReviews.length) * 100)
    : null;

  return (
    <>
      <PageHeader title="Üben" description="Karteikarten mit Spaced Repetition." />

      <div className="flex flex-col gap-5">
        <StatsStrip
          streak={streak}
          reviewedToday={todayReviews.length}
          accuracyToday={accuracyToday}
        />

        <Link href="/practice/new" className={buttonStyles("primary", "w-full")}>
          <Plus aria-hidden className="size-4" />
          Neues Deck
        </Link>

        <section aria-label="Decks">
          <h2 className="mb-3 text-sm font-medium text-muted">Deine Decks</h2>
          {decksResult.error ? (
            <p role="alert" className="break-words text-sm text-red-600 dark:text-red-400">
              {describeSupabaseError(decksResult.error, "Decks konnten nicht geladen werden.", "decks.select")}
            </p>
          ) : decks.length === 0 ? (
            <p className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted shadow-sm">
              Noch keine Decks. Erstelle dein erstes Deck und füge Karten hinzu.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {decks.map((deck) => {
                const stats = summarizeCards(
                  cards.filter((card) => card.deck_id === deck.id),
                  now,
                );
                return (
                  <li key={deck.id}>
                    <Link
                      href={`/practice/${deck.id}`}
                      className="pressable block rounded-2xl border border-border bg-surface p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                          <Layers aria-hidden className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-medium">{deck.title}</h3>
                          <p className="text-sm text-muted">
                            {stats.total} {stats.total === 1 ? "Karte" : "Karten"}
                            {stats.due > 0 && ` · ${stats.due} fällig`}
                          </p>
                        </div>
                        {stats.due > 0 && (
                          <span className="shrink-0 rounded-full bg-brand px-2.5 py-1 text-xs font-medium text-white">
                            {stats.due}
                          </span>
                        )}
                        <ChevronRight aria-hidden className="size-4 shrink-0 text-muted" />
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1">
                          <ProgressBar
                            percent={stats.masteredPercent}
                            label={`Fortschritt ${deck.title}`}
                          />
                        </div>
                        <span className="shrink-0 text-xs text-muted">
                          {stats.masteredPercent} % gelernt
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-label="Bald verfügbar">
          <h2 className="mb-3 text-sm font-medium text-muted">Bald verfügbar</h2>
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
                <span className="shrink-0 rounded-full bg-surface-hover px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted">
                  bald
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
