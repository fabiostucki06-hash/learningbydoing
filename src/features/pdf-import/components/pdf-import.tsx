"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, FileText, Layers, Loader2, Sparkles, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_FILE_SIZE, PDF_MIME_TYPE } from "@/features/documents/constants";
import { formatFileSize } from "@/features/documents/format";
import { uploadPdf } from "@/features/documents/upload";
import type { GenerateMode, GenerateResponse } from "../types";

type Uploaded = { documentId: string; title: string };

const GENERATING_LABEL: Record<GenerateMode, string> = {
  flashcards: "Karteikarten werden erstellt …",
  exam: "Probeprüfung wird erstellt …",
};

/**
 * PDF-Import im Deck: hochladen, dann wählen, ob die KI Karteikarten oder eine Probeprüfung erzeugt.
 * Der Upload geht direkt in den Storage, die KI-Arbeit erledigt die Route /api/documents/[id]/generate.
 */
export function PdfImport({ deckId }: { deckId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState<Uploaded | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState<GenerateMode | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const busy = uploading || generating !== null;

  async function upload(file: File) {
    setError(null);
    setNotice(null);
    setUploading(true);
    try {
      const result = await uploadPdf(file);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setUploaded({ documentId: result.documentId, title: result.title });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) void upload(file);
  }

  async function generate(mode: GenerateMode) {
    if (!uploaded) return;
    setError(null);
    setNotice(null);
    setGenerating(mode);

    try {
      const response = await fetch(`/api/documents/${uploaded.documentId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, deckId }),
      });

      // Bei einem Timeout der Plattform kommt kein JSON zurück.
      const data: GenerateResponse | null = await response.json().catch(() => null);

      if (!response.ok || !data || data.error) {
        setError(
          data?.error ??
            (response.status === 504
              ? "Die Verarbeitung hat zu lange gedauert. Versuche es mit einem kürzeren PDF."
              : "Die Verarbeitung ist fehlgeschlagen."),
        );
        return;
      }

      if (mode === "exam" && data.examId) {
        router.push(`/practice/${deckId}/exam/${data.examId}`);
        return;
      }

      const count = data.cards ?? 0;
      setNotice(`${count} ${count === 1 ? "Karte" : "Karten"} zum Deck hinzugefügt.`);
      setUploaded(null);
      router.refresh();
    } catch {
      setError("Verbindung unterbrochen. Bitte versuche es erneut.");
    } finally {
      setGenerating(null);
    }
  }

  return (
    <section
      aria-label="PDF importieren"
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm"
    >
      <h2 className="flex items-center gap-2 font-medium">
        <Sparkles aria-hidden className="size-4 text-brand" />
        Aus PDF erstellen
      </h2>

      {uploaded ? (
        <>
          <div className="flex items-center gap-3 rounded-xl bg-surface-hover px-3 py-2">
            <FileText aria-hidden className="size-5 shrink-0 text-brand" />
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{uploaded.title}</span>
            <button
              type="button"
              onClick={() => setUploaded(null)}
              disabled={busy}
              aria-label="Anderes PDF wählen"
              className="pressable flex size-9 shrink-0 items-center justify-center rounded-lg text-muted hover:text-foreground disabled:opacity-50"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>

          <p className="text-sm text-muted">Was soll die KI aus diesem PDF machen?</p>

          <div className="grid gap-3">
            <Button disabled={busy} onClick={() => generate("flashcards")}>
              {generating === "flashcards" ? (
                <Loader2 aria-hidden className="size-4 animate-spin" />
              ) : (
                <Layers aria-hidden className="size-4" />
              )}
              Automatisch generierte Karteikarten
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => generate("exam")}>
              {generating === "exam" ? (
                <Loader2 aria-hidden className="size-4 animate-spin" />
              ) : (
                <ClipboardCheck aria-hidden className="size-4" />
              )}
              Probeprüfung erstellen
            </Button>
          </div>

          {generating && (
            <p role="status" className="text-center text-sm text-muted">
              {GENERATING_LABEL[generating]} Das kann bis zu einer Minute dauern.
            </p>
          )}
        </>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!busy) handleFiles(e.dataTransfer.files);
          }}
          className={`pressable flex min-h-32 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center focus-within:border-brand ${
            dragging ? "border-brand bg-brand/5" : "border-border"
          } ${uploading ? "cursor-wait opacity-70" : "hover:border-brand"}`}
        >
          <UploadCloud aria-hidden className="size-6 text-brand" />
          <span className="text-sm font-medium">
            {uploading ? "Wird hochgeladen …" : "PDF auswählen oder hierher ziehen"}
          </span>
          <span className="text-xs text-muted">Nur PDF, max. {formatFileSize(MAX_FILE_SIZE)}</span>
          <input
            ref={inputRef}
            type="file"
            accept={PDF_MIME_TYPE}
            disabled={busy}
            onChange={(e) => handleFiles(e.target.files)}
            className="sr-only"
          />
        </label>
      )}

      {notice && (
        <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="break-words text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </section>
  );
}
