"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function DeleteExamButton({ id, label }: { id: string; label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!window.confirm(`Prüfung „${label}“ wirklich löschen?`)) return;

    setPending(true);
    // RLS: gelöscht wird nur, was dem eingeloggten Nutzer gehört.
    const { error } = await createClient().from("exams").delete().eq("id", id);
    setPending(false);

    if (error) {
      window.alert("Prüfung konnte nicht gelöscht werden.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={`${label} löschen`}
      className="pressable -mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50"
    >
      <Trash2 aria-hidden className="size-4" />
    </button>
  );
}
