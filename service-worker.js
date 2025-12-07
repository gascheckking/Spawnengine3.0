// service-worker.js — SpawnEngine · Mesh HUD PWA

const CACHE_NAME = "spawnengine-mesh-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/style.css",
  "/app.js",
  "/supcast.js",
  "/mesh-bg.js",
  "/manifest.json",
  "/logo.png",
  "/api/mesh-feed.js",
  "/api/pack-actions.js",
  "/api/user-profile.js",
  "/api/spawnengine-token.js",
  "/api/activity.js",
];

// Install – cacha shellen
self.addEventListener("install", (event) => {
  console.log("[SW] Installing and caching assets...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate – rensa gamla cacher
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating new service worker and cleaning old caches...");
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

// Fetch – cache-first + offline fallback
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        event.waitUntil(
          fetch(request)
            .then((response) =>
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response.clone());
              })
            )
            .catch(() => {})
        );
        return cached;
      }

      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => {
          if (request.mode === "navigate") {
            return caches.match("/offline.html");
          }
          return caches.match("/index.html");
        });
    })
  );
});