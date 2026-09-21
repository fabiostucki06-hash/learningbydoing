// Minimaler Service Worker: Installierbarkeit + Offline-Fallback.
// Bewusst KEIN Caching von HTML, RSC-Payloads, Server Actions oder Supabase-Requests:
// die App ist login-geschützt, veraltete/fremde Seiten dürfen nie aus dem Cache kommen.
const STATIC_CACHE = "static-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
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
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) ?? Response.error()),
    );
    return;
  }

  // Gehashte, unveränderliche Build-Assets (JS, CSS, Fonts): Cache-first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
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
