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
      <p className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted shadow-sm">
        Noch keine Dokumente. Lade dein erstes PDF hoch.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center gap-1 rounded-2xl border border-border bg-surface pr-2 shadow-sm"
        >
          {/* Eigener Tab: Route leitet auf eine kurzlebige Signed URL um. */}
          <a
            href={`/documents/${doc.id}/file`}
            target="_blank"
            rel="noopener noreferrer"
            className="pressable flex min-h-16 min-w-0 flex-1 items-center gap-3 rounded-2xl p-3"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <FileText aria-hidden className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{doc.title}</span>
              <span className="block truncate text-xs text-muted">
                {formatFileSize(doc.file_size)} · {formatDate(doc.created_at)} ·{" "}
                {DOCUMENT_STATUS_LABELS[doc.status] ?? doc.status}
              </span>
            </span>
          </a>
          <DeleteButton id={doc.id} title={doc.title} />
        </li>
      ))}
    </ul>
  );
}
