"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  DOCUMENTS_BUCKET,
  MAX_FILE_SIZE,
  PDF_MIME_TYPE,
} from "../constants";
import { formatFileSize } from "../format";

/** Prüft die PDF-Signatur ("%PDF-"), nicht nur die Dateiendung oder den MIME-Type. */
async function looksLikePdf(file: File) {
  const header = await file.slice(0, 5).text();
  return header === "%PDF-";
}

async function validate(file: File): Promise<string | null> {
  if (file.size === 0) return "Die Datei ist leer.";
  if (file.size > MAX_FILE_SIZE) {
    return `Die Datei ist zu groß (max. ${formatFileSize(MAX_FILE_SIZE)}).`;
  }
  if (file.type !== PDF_MIME_TYPE || !(await looksLikePdf(file))) {
    return "Nur PDF-Dateien sind erlaubt.";
  }
  return null;
}

export function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);

    const validationError = await validate(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Bitte melde dich erneut an.");
        return;
      }

      const id = crypto.randomUUID();
      const storagePath = `${user.id}/${id}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .upload(storagePath, file, { contentType: PDF_MIME_TYPE, upsert: false });

      if (uploadError) {
        setError("Upload fehlgeschlagen. Bitte versuche es erneut.");
        return;
      }

      const { error: insertError } = await supabase.from("documents").insert({
        id,
        title: file.name.replace(/\.pdf$/i, "").slice(0, 200) || "Dokument",
        file_name: file.name.slice(0, 255),
        storage_path: storagePath,
        file_size: file.size,
        mime_type: PDF_MIME_TYPE,
      });

      if (insertError) {
        // Verwaiste Datei wieder entfernen.
        await supabase.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
        setError("Dokument konnte nicht gespeichert werden.");
        return;
      }

      router.refresh();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) void upload(file);
  }

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!uploading) handleFiles(e.dataTransfer.files);
        }}
        className={`pressable flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center shadow-sm focus-within:border-brand ${
          dragging ? "border-brand bg-brand/5" : "border-border bg-surface"
        } ${uploading ? "cursor-wait opacity-70" : "hover:border-brand"}`}
      >
        <span className="flex size-12 items-center justify-center rounded-2xl bg-brand/10">
          <UploadCloud aria-hidden className="size-6 text-brand" />
        </span>
        <span className="font-medium">
          {uploading ? "Wird hochgeladen …" : "PDF auswählen"}
        </span>
        <span className="text-sm text-muted">
          Nur PDF, max. {formatFileSize(MAX_FILE_SIZE)}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={PDF_MIME_TYPE}
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
          className="sr-only"
        />
      </label>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
