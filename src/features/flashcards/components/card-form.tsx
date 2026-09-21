"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { describeSupabaseError } from "@/lib/supabase/errors";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MAX_CARD_TEXT } from "../types";

export function CardForm({ deckId }: { deckId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget; // nach dem await ist currentTarget null
    const data = new FormData(form);
    const front = String(data.get("front") ?? "").trim();
    const back = String(data.get("back") ?? "").trim();

    if (!front || !back) {
      setError("Bitte Vorder- und Rückseite ausfüllen.");
      return;
    }
    if (front.length > MAX_CARD_TEXT || back.length > MAX_CARD_TEXT) {
      setError(`Maximal ${MAX_CARD_TEXT} Zeichen pro Seite.`);
      return;
    }

    setPending(true);
    // RLS prüft zusätzlich, dass das Deck dem eingeloggten Nutzer gehört.
    const { error: insertError } = await createClient()
      .from("cards")
      .insert({ deck_id: deckId, front, back });
    setPending(false);

    if (insertError) {
      setError(
        describeSupabaseError(insertError, "Karte konnte nicht gespeichert werden.", "cards.insert"),
      );
      return;
    }

    form.reset();
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm"
      noValidate
    >
      <h2 className="font-medium">Neue Karte</h2>
      <Textarea label="Vorderseite" name="front" maxLength={MAX_CARD_TEXT} placeholder="Frage oder Begriff" />
      <Textarea label="Rückseite" name="back" maxLength={MAX_CARD_TEXT} placeholder="Antwort oder Erklärung" />

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <Button type="submit" variant="secondary" disabled={pending}>
        <Plus aria-hidden className="size-4" />
        {pending ? "Wird gespeichert …" : "Karte hinzufügen"}
      </Button>
    </form>
  );
}
