// service-worker.js — SpawnEngine · Mesh HUD v0.4
// Enkel cache för PWA (offline + snabbare load)

const CACHE_NAME = "spawnengine-mesh-v1";

// Lägg till de viktigaste filerna här
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/logo.png",
  "/manifest.json",
  "/supcast.js"
];

// Install — cacha assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate — städa gamla cacher
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch — cache-first med nätverks-fallback
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Bara GET-requests
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cachedRes) => {
      if (cachedRes) return cachedRes;

      return fetch(req).then((networkRes) => {
        // spara i cache för nästa gång (bästa effort)
        const clone = networkRes.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        return networkRes;
      });
    })
  );
});