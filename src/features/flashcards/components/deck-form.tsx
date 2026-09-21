"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_DECK_TITLE } from "../types";

export function DeckForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const title = String(new FormData(event.currentTarget).get("title") ?? "").trim();
    if (!title || title.length > MAX_DECK_TITLE) {
      setError(`Bitte einen Titel mit 1–${MAX_DECK_TITLE} Zeichen eingeben.`);
      return;
    }

    setPending(true);
    // user_id setzt die Datenbank per Default (auth.uid()); RLS lässt nur eigene Zeilen zu.
    const { data, error: insertError } = await createClient()
      .from("decks")
      .insert({ title })
      .select("id")
      .single();

    if (insertError || !data) {
      setError("Deck konnte nicht erstellt werden.");
      setPending(false);
      return;
    }

    router.push(`/practice/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="Titel"
        name="title"
        required
        maxLength={MAX_DECK_TITLE}
        placeholder="z. B. Biologie: Zellen"
        autoFocus
      />

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Wird erstellt …" : "Deck erstellen"}
      </Button>
    </form>
  );
}
