/* ======================================================
   SPAWNENGINE v6.0 — Service Worker (React Compatible)
   ====================================================== */

const CACHE_NAME = "spawnengine-cache-v6.0";
const ASSETS = ["/", "/index.html", "/manifest.json", "/assets/icons/favicon.png"];

self.addEventListener("install", (event) => {
  console.log("⚙️ [SW] Installing...");
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("♻️ [SW] Activated");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});