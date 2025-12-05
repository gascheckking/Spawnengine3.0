// service-worker.js — SpawnEngine · Mesh HUD PWA

const CACHE_NAME = "spawnengine-mesh-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/supcast.js",
  "/mesh-bg.js",
  "/manifest.json",
  "/logo.png"
];

// Install – cacha shellen
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate – rensa gamla cacher
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch – cache-first för egna filer, fallback offline
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Bara hantera samma origin (din app)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Uppdatera i bakgrunden
        event.waitUntil(
          fetch(request)
            .then((response) => {
              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response.clone());
              });
            })
            .catch(() => {})
        );
        return cached;
      }

      // Ingen cache – hämta från nätet och cacha
      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(() => {
          // Offline fallback: visa index.html
          return caches.match("/index.html");
        });
    })
  );
});