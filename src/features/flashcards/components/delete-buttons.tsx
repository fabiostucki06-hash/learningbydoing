"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ICON_BUTTON =
  "pressable flex size-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50";

export function DeleteCardButton({ id, label }: { id: string; label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!window.confirm(`Karte „${label}“ wirklich löschen?`)) return;

    setPending(true);
    // RLS: gelöscht wird nur, was dem eingeloggten Nutzer gehört.
    const { error } = await createClient().from("cards").delete().eq("id", id);
    setPending(false);

    if (error) {
      window.alert("Karte konnte nicht gelöscht werden.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={`Karte ${label} löschen`}
      className={ICON_BUTTON}
    >
      <Trash2 aria-hidden className="size-4" />
    </button>
  );
}

export function DeleteDeckButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!window.confirm(`Deck „${title}“ mit allen Karten wirklich löschen?`)) return;

    setPending(true);
    // Karten und Reviews verschwinden per ON DELETE CASCADE mit.
    const { error } = await createClient().from("decks").delete().eq("id", id);

    if (error) {
      setPending(false);
      window.alert("Deck konnte nicht gelöscht werden.");
      return;
    }
    router.push("/practice");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={`Deck ${title} löschen`}
      className={`${ICON_BUTTON} -mr-2`}
    >
      <Trash2 aria-hidden className="size-5" />
    </button>
  );
}
