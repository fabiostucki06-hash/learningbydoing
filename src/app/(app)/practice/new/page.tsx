import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DeckForm } from "@/features/flashcards/components/deck-form";

export const metadata: Metadata = { title: "Neues Deck" };

export default function NewDeckPage() {
  return (
    <>
      <Link
        href="/practice"
        className="pressable -ml-2 mb-2 inline-flex h-11 items-center gap-1 rounded-xl px-2 text-sm text-muted"
      >
        <ChevronLeft aria-hidden className="size-4" />
        Üben
      </Link>

      <PageHeader title="Neues Deck" description="Danach kannst du Karten hinzufügen." />

      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <DeckForm />
      </div>
    </>
  );
}
