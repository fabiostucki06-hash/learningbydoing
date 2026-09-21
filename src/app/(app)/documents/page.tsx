import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { UploadForm } from "@/features/documents/components/upload-form";
import { DocumentList } from "@/features/documents/components/document-list";

export const metadata: Metadata = { title: "Dokumente" };

export default async function DocumentsPage() {
  const supabase = await createClient();

  // RLS filtert automatisch auf die Dokumente des eingeloggten Nutzers.
  const { data: documents, error } = await supabase
    .from("documents")
    .select("id, title, file_size, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Dokumente</h1>
      <p className="mt-1 text-muted">
        Lade Skripte, Folien oder Altprüfungen als PDF hoch.
      </p>

      <div className="mt-6">
        <UploadForm />
      </div>

      <h2 className="mb-3 mt-10 font-medium">Deine Dokumente</h2>
      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          Dokumente konnten nicht geladen werden.
        </p>
      ) : (
        <DocumentList documents={documents ?? []} />
      )}
    </div>
  );
}
