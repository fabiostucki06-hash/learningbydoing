/**
 * Zentrale Env-Prüfung. Schlägt früh mit klarer Meldung fehl, statt
 * später mit kryptischen Supabase-Fehlern.
 *
 * Wichtig: `process.env.NEXT_PUBLIC_*` muss statisch ausgeschrieben werden,
 * sonst ersetzt Next.js die Werte im Browser-Bundle nicht.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase-Umgebungsvariablen fehlen. Bitte NEXT_PUBLIC_SUPABASE_URL und " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY setzen: lokal in .env.local (siehe .env.example), " +
        "auf Vercel unter Project Settings -> Environment Variables (für Production UND Preview).",
    );
  }

  return { url, key };
}
