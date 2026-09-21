import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
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
    <>
      <PageHeader
        title="Dokumente"
        description="Lade Skripte, Folien oder Altprüfungen als PDF hoch."
      />

      <UploadForm />

      <h2 className="mb-3 mt-8 text-sm font-medium text-muted">Deine Dokumente</h2>
      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          Dokumente konnten nicht geladen werden.
        </p>
      ) : (
        <DocumentList documents={documents ?? []} />
      )}
    </>
  );
}
