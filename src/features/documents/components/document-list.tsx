import { FileText } from "lucide-react";
import type { Tables } from "@/types/database";
import { DOCUMENT_STATUS_LABELS } from "../constants";
import { formatDate, formatFileSize } from "../format";
import { DeleteButton } from "./delete-button";

type Document = Pick<
  Tables<"documents">,
  "id" | "title" | "file_size" | "status" | "created_at"
>;

export function DocumentList({ documents }: { documents: Document[] }) {
  if (documents.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">
        Noch keine Dokumente. Lade dein erstes PDF hoch.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {documents.map((doc) => (
        <li key={doc.id} className="flex items-center gap-3 p-4">
          <FileText aria-hidden className="size-6 shrink-0 text-brand" />
          <div className="min-w-0 flex-1">
            {/* Eigener Tab: Route leitet auf eine kurzlebige Signed URL um. */}
            <a
              href={`/documents/${doc.id}/file`}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate font-medium hover:text-brand hover:underline"
            >
              {doc.title}
            </a>
            <p className="text-xs text-muted">
              {formatFileSize(doc.file_size)} · {formatDate(doc.created_at)} ·{" "}
              {DOCUMENT_STATUS_LABELS[doc.status] ?? doc.status}
            </p>
          </div>
          <DeleteButton id={doc.id} title={doc.title} />
        </li>
      ))}
    </ul>
  );
}
