export const DOCUMENTS_BUCKET = "documents";

/** Muss zum file_size_limit des Buckets passen (siehe Migration). */
export const MAX_FILE_SIZE = 20 * 1024 * 1024;

export const PDF_MIME_TYPE = "application/pdf";

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  uploaded: "Hochgeladen",
  processing: "Wird verarbeitet",
  ready: "Bereit",
  failed: "Fehlgeschlagen",
};
