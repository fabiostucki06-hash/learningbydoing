"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_TOPICS = 30;

function parseTopics(raw: string) {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((topic) => topic.trim())
        .filter(Boolean),
    ),
  );
}

export function ExamForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const subject = String(form.get("subject") ?? "").trim();
    const title = String(form.get("title") ?? "").trim();
    const startsAt = new Date(String(form.get("startsAt") ?? ""));
    const topics = parseTopics(String(form.get("topics") ?? ""));

    if (!subject || subject.length > 100) {
      setError("Bitte ein Fach mit 1–100 Zeichen eingeben.");
      return;
    }
    if (title.length > 100) {
      setError("Der Titel darf höchstens 100 Zeichen lang sein.");
      return;
    }
    if (Number.isNaN(startsAt.getTime())) {
      setError("Bitte Datum und Uhrzeit angeben.");
      return;
    }
    if (startsAt.getTime() <= Date.now()) {
      setError("Der Termin muss in der Zukunft liegen.");
      return;
    }
    if (topics.length > MAX_TOPICS || topics.some((topic) => topic.length > 100)) {
      setError(`Maximal ${MAX_TOPICS} Themen mit je höchstens 100 Zeichen.`);
      return;
    }

    setPending(true);
    // user_id setzt die Datenbank per Default (auth.uid()); RLS lässt nur eigene Zeilen zu.
    const { error: insertError } = await createClient()
      .from("exams")
      .insert({
        subject,
        title: title || null,
        // datetime-local liefert Ortszeit des Geräts; toISOString() macht daraus einen eindeutigen Zeitpunkt.
        starts_at: startsAt.toISOString(),
        topics,
      });

    if (insertError) {
      setError("Prüfung konnte nicht gespeichert werden.");
      setPending(false);
      return;
    }

    router.push("/exams");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input label="Fach" name="subject" required maxLength={100} placeholder="z. B. Mathematik" />
      <Input
        label="Titel (optional)"
        name="title"
        maxLength={100}
        placeholder="z. B. Test 3"
      />
      <Input label="Datum und Uhrzeit" name="startsAt" type="datetime-local" required />
      <Input
        label="Themen (optional)"
        name="topics"
        placeholder="Ableitungen, Integrale, Kurvendiskussion"
        hint="Mit Komma trennen. Daraus entsteht dein Tagesplan."
      />

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Wird gespeichert …" : "Prüfung speichern"}
      </Button>
    </form>
  );
}
