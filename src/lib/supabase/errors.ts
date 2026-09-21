import type { PostgrestError } from "@supabase/supabase-js";

/** PostgREST/Postgres-Codes für "Tabelle oder Funktion existiert nicht" (Migration fehlt). */
const MISSING_OBJECT_CODES = new Set(["PGRST205", "PGRST202", "42P01", "42883"]);

/** Postgres: insufficient_privilege, das ist auch der Code bei verletzter Row Level Security. */
const INSUFFICIENT_PRIVILEGE = "42501";

/**
 * Baut aus einem Supabase-Fehler eine Meldung für die Oberfläche und schreibt den vollen Fehler in die
 * Konsole (Browser-Konsole bzw. Vercel-Logs). So ist sichtbar, WARUM eine Abfrage scheitert, statt nur
 * "hat nicht geklappt". Enthält bewusst Code und Text der Datenbank, damit Fehler schnell auffindbar sind.
 */
export function describeSupabaseError(
  error: Pick<PostgrestError, "code" | "message">,
  fallback: string,
  context: string,
): string {
  console.error(`[supabase] ${context}:`, error);

  const detail = [error.code, error.message].filter(Boolean).join(": ");

  if (error.code && MISSING_OBJECT_CODES.has(error.code)) {
    return `${fallback} Die Datenbank-Tabelle fehlt: bitte die Migrationen aus supabase/migrations im Supabase-SQL-Editor ausführen. (${detail})`;
  }
  if (error.code === INSUFFICIENT_PRIVILEGE) {
    return `${fallback} Keine Berechtigung (Row Level Security). (${detail})`;
  }
  return `${fallback} (${detail})`;
}
