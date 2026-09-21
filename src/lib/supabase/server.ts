import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";
import type { Database } from "@/types/database";

/**
 * Supabase-Client für Server Components, Server Actions und Route Handlers.
 * Pro Request neu erzeugen (nie global cachen), da er an die Cookies gebunden ist.
 */
export async function createClient() {
  const { url, key } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Aufruf aus einer Server Component: Cookies sind dort read-only.
          // Unkritisch, weil proxy.ts die Session bei jedem Request auffrischt.
        }
      },
    },
  });
}
