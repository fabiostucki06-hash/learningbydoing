"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DOCUMENTS_BUCKET } from "./constants";

export type DeleteResult = { error?: string };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Löscht Datei und Datenbankzeile. RLS stellt sicher, dass nur eigene Dokumente betroffen sind. */
export async function deleteDocument(id: string): Promise<DeleteResult> {
  if (!UUID_PATTERN.test(id)) {
    return { error: "Ungültige Dokument-ID." };
  }

  const supabase = await createClient();

  const { data: doc, error: readError } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  if (readError || !doc) {
    return { error: "Dokument nicht gefunden." };
  }

  // Erst die Zeile löschen: schlägt das fehl, bleibt die Datei erhalten und nichts geht verloren.
  const { error: deleteError } = await supabase
    .from("documents")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return { error: "Dokument konnte nicht gelöscht werden." };
  }

  // Schlägt das Entfernen der Datei fehl, bleibt nur eine verwaiste Datei im Bucket zurück.
  await supabase.storage.from(DOCUMENTS_BUCKET).remove([doc.storage_path]);

  revalidatePath("/documents");
  return {};
}
