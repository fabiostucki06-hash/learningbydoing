// Service Worker als Route statt statischer Datei: Die Build-ID steckt im Quelltext, also ändert sich
// sw.js bei jedem Deployment. Nur dadurch erkennt der Browser beim Update-Check (registration.update())
// eine neue Version, auch wenn die App gerade offen ist.
export const dynamic = "force-static";

const BUILD_ID = `${process.env.NEXT_PUBLIC_COMMIT_SHA}-${process.env.NEXT_PUBLIC_BUILD_TIME}`;

// Bewusst keine Backticks oder ${...} im Worker-Code: er steckt in einem Template-String.
const WORKER = `
// Minimaler Service Worker: Update-Erkennung + Offline-Fallback.
// KEIN Caching von HTML, RSC-Payloads, Server Actions, API-Routen oder Supabase-Requests:
// die App ist login-geschützt, veraltete/fremde Seiten dürfen nie aus dem Cache kommen.
const STATIC_CACHE = "static-" + BUILD_ID;
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      // cache: "reload" umgeht den HTTP-Cache, damit immer die aktuelle Offline-Seite landet.
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
      // Neuer Worker übernimmt sofort, statt hinter dem alten zu warten.
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      // Alle Caches früherer Builds verwerfen.
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Supabase (API, Storage) und alles andere Cross-Origin läuft unangetastet durch.
  if (url.origin !== self.location.origin) return;

  // Seitenaufrufe: immer Netzwerk, nur bei Verbindungsfehler die Offline-Seite.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) || Response.error()),
    );
    return;
  }

  // Gehashte, unveränderliche Build-Assets (JS, CSS, Fonts): Cache-first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
`;

export function GET() {
  return new Response(`const BUILD_ID = ${JSON.stringify(BUILD_ID)};\n${WORKER}`, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
