import { createClient } from "@/lib/supabase/client";
import { DOCUMENTS_BUCKET, MAX_FILE_SIZE, PDF_MIME_TYPE } from "./constants";
import { formatFileSize } from "./format";

export type UploadResult =
  | { ok: true; documentId: string; title: string }
  | { ok: false; error: string };

/** Prüft die PDF-Signatur ("%PDF-"), nicht nur die Dateiendung oder den MIME-Type. */
async function looksLikePdf(file: File) {
  const header = await file.slice(0, 5).text();
  return header === "%PDF-";
}

export async function validatePdf(file: File): Promise<string | null> {
  if (file.size === 0) return "Die Datei ist leer.";
  if (file.size > MAX_FILE_SIZE) {
    return `Die Datei ist zu groß (max. ${formatFileSize(MAX_FILE_SIZE)}).`;
  }
  if (file.type !== PDF_MIME_TYPE || !(await looksLikePdf(file))) {
    return "Nur PDF-Dateien sind erlaubt.";
  }
  return null;
}

/**
 * Lädt ein PDF direkt aus dem Browser in den privaten Bucket und legt die Dokument-Zeile an.
 * Der Upload läuft am Server vorbei, damit große Dateien nicht durch dessen Body-Limit müssen.
 */
export async function uploadPdf(file: File): Promise<UploadResult> {
  const validationError = await validatePdf(file);
  if (validationError) return { ok: false, error: validationError };

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Bitte melde dich erneut an." };

  const id = crypto.randomUUID();
  const storagePath = `${user.id}/${id}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(storagePath, file, { contentType: PDF_MIME_TYPE, upsert: false });

  if (uploadError) {
    return { ok: false, error: "Upload fehlgeschlagen. Bitte versuche es erneut." };
  }

  const title = file.name.replace(/\.pdf$/i, "").slice(0, 200) || "Dokument";

  const { error: insertError } = await supabase.from("documents").insert({
    id,
    title,
    file_name: file.name.slice(0, 255),
    storage_path: storagePath,
    file_size: file.size,
    mime_type: PDF_MIME_TYPE,
  });

  if (insertError) {
    // Verwaiste Datei wieder entfernen.
    await supabase.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
    return { ok: false, error: "Dokument konnte nicht gespeichert werden." };
  }

  return { ok: true, documentId: id, title };
}
