import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Alles außer statische Assets, Next-Internals und PWA-Dateien. Manifest, Service Worker und
  // Offline-Seite werden vom Browser ohne Session abgerufen und dürfen nicht auf /login umgeleitet werden.
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|sw\\.js|offline\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
