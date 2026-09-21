import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { describeSupabaseError } from "@/lib/supabase/errors";
import { DOCUMENTS_BUCKET, MAX_FILE_SIZE } from "@/features/documents/constants";
import { UUID_PATTERN } from "@/features/flashcards/types";
import { generateExam, generateFlashcards, GenerationError } from "@/features/pdf-import/generate";
import type { GenerateMode, GenerateResponse } from "@/features/pdf-import/types";

/** Die KI liest das ganze PDF, das dauert deutlich länger als eine normale Anfrage. */
export const maxDuration = 300;

/** Eine hängengebliebene Verarbeitung (Timeout, Absturz) gilt nach dieser Zeit als abgebrochen. */
const STALE_PROCESSING_MS = 6 * 60 * 1000;

function json(body: GenerateResponse, status = 200) {
  return NextResponse.json(body, { status });
}

/**
 * Erzeugt aus einem hochgeladenen PDF Karteikarten oder eine Probeprüfung und legt sie im Deck ab.
 * Body: { mode: "flashcards" | "exam", deckId: string }
 * Alle Datenbank- und Storage-Zugriffe laufen mit der Session des Nutzers, RLS gilt.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Ungültige Anfrage." }, 400);
  }

  const { mode, deckId } = (body ?? {}) as { mode?: unknown; deckId?: unknown };
  if (
    !UUID_PATTERN.test(id) ||
    typeof deckId !== "string" ||
    !UUID_PATTERN.test(deckId) ||
    (mode !== "flashcards" && mode !== "exam")
  ) {
    return json({ error: "Ungültige Anfrage." }, 400);
  }
  const generateMode: GenerateMode = mode;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "Bitte melde dich erneut an." }, 401);

  // RLS: fremde Dokumente und Decks liefern keine Zeile.
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("id, title, storage_path")
    .eq("id", id)
    .maybeSingle();
  if (docError) {
    return json({ error: describeSupabaseError(docError, "Dokument konnte nicht geladen werden.", "documents.select") }, 500);
  }
  if (!doc) return json({ error: "Dokument nicht gefunden." }, 404);

  const { data: deck, error: deckError } = await supabase
    .from("decks")
    .select("id")
    .eq("id", deckId)
    .maybeSingle();
  if (deckError) {
    return json({ error: describeSupabaseError(deckError, "Deck konnte nicht geladen werden.", "decks.select") }, 500);
  }
  if (!deck) return json({ error: "Deck nicht gefunden." }, 404);

  // Verarbeitung reservieren. Das Update trifft nur, wenn nicht schon eine frische läuft:
  // so löst ein Doppelklick keine zweite (teure) KI-Anfrage aus.
  const staleBefore = new Date(Date.now() - STALE_PROCESSING_MS).toISOString();
  const { data: claimed, error: claimError } = await supabase
    .from("documents")
    .update({ status: "processing" })
    .eq("id", id)
    .or(`status.neq.processing,updated_at.lt.${staleBefore}`)
    .select("id");
  if (claimError) {
    return json({ error: describeSupabaseError(claimError, "Dokument konnte nicht gesperrt werden.", "documents.claim") }, 500);
  }
  if (!claimed || claimed.length === 0) {
    return json({ error: "Dieses PDF wird gerade verarbeitet. Bitte warte einen Moment." }, 409);
  }

  const setStatus = (status: "ready" | "failed") =>
    supabase.from("documents").update({ status }).eq("id", id);

  try {
    const { data: file, error: downloadError } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .download(doc.storage_path);
    if (downloadError || !file) {
      console.error("[pdf-import] storage.download:", downloadError);
      throw new GenerationError("Die PDF-Datei konnte nicht geladen werden.", 404);
    }

    const pdf = Buffer.from(await file.arrayBuffer());
    // Defensiv: der Bucket erzwingt das schon, aber die KI-Kosten hängen an dieser Datei.
    if (pdf.length === 0 || pdf.length > MAX_FILE_SIZE || pdf.subarray(0, 5).toString("latin1") !== "%PDF-") {
      throw new GenerationError("Die Datei ist kein gültiges PDF.", 422);
    }

    if (generateMode === "flashcards") {
      const cards = await generateFlashcards(pdf);

      const { error: insertError } = await supabase
        .from("cards")
        .insert(cards.map((card) => ({ deck_id: deckId, front: card.front, back: card.back })));
      if (insertError) {
        throw new GenerationError(describeSupabaseError(insertError, "Karten konnten nicht gespeichert werden.", "cards.insert"), 500);
      }

      await setStatus("ready");
      return json({ cards: cards.length });
    }

    const exam = await generateExam(pdf);

    const { data: created, error: insertError } = await supabase
      .from("mock_exams")
      .insert({
        deck_id: deckId,
        document_id: id,
        title: exam.title ?? `Probeprüfung: ${doc.title}`.slice(0, 200),
        questions: exam.questions,
      })
      .select("id")
      .single();
    if (insertError || !created) {
      throw new GenerationError(
        describeSupabaseError(
          insertError ?? { code: "", message: "keine Zeile zurückgegeben" },
          "Probeprüfung konnte nicht gespeichert werden.",
          "mock_exams.insert",
        ),
        500,
      );
    }

    await setStatus("ready");
    return json({ examId: created.id });
  } catch (error) {
    await setStatus("failed");
    if (error instanceof GenerationError) return json({ error: error.message }, error.status);
    console.error("[pdf-import] unerwarteter Fehler:", error);
    return json({ error: "Unerwarteter Fehler bei der Verarbeitung." }, 500);
  }
}
