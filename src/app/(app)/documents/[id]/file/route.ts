import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DOCUMENTS_BUCKET } from "@/features/documents/constants";

const SIGNED_URL_TTL_SECONDS = 60;

/** Leitet auf eine kurzlebige Signed URL um. Der Bucket ist privat, die URL läuft nach 60 s ab. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS: liefert nur Dokumente des eingeloggten Nutzers.
  const { data: doc } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  if (!doc) {
    return new NextResponse("Nicht gefunden", { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(doc.storage_path, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    return new NextResponse("Datei nicht verfügbar", { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}
