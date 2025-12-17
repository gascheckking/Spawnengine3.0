/* ============================================================
   SPAWNENGINE v3.1 — SERVICE WORKER
   "The Hub, Not Another App"
   Handles cache, updates, offline & mesh heartbeat
   ============================================================ */

/* —— init —— */
const CACHE_NAME = "spawnengine-cache-v3.1";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/mesh-bg.js",
  "/spawnengine-sdk.js",
  "/icons/icon-512.png",
];

/* —— install —— */
self.addEventListener("install", (event) => {
  console.log("⚙️ [SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 [SW] Caching core assets...");
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

/* —— activate —— */
self.addEventListener("activate", (event) => {
  console.log("♻️ [SW] Activated");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 [SW] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  return self.clients.claim();
});

/* —— fetch-handler —— */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests
  if (req.method !== "GET") return;

  // —— mesh-api-pass-through —— //
  if (url.pathname.startsWith("/api/")) {
    return; // don’t cache live API calls
  }

  // —— cache-first —— //
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      if (cachedRes) return cachedRes;
      return fetch(req)
        .then((netRes) => {
          const copy = netRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return netRes;
        })
        .catch(() => caches.match("/offline.html"));
    })
  );
});

/* —— message-channel —— */
self.addEventListener("message", (event) => {
  const { type } = event.data || {};
  if (type === "CLEAR_CACHE") {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    event.source.postMessage({ status: "Cache cleared" });
  }
});

/* —— mesh-heartbeat —— */
const MESH_PING_INTERVAL = 60 * 1000; // 1 min
setInterval(async () => {
  try {
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    clients.forEach((client) => {
      client.postMessage({
        type: "MESH_HEARTBEAT",
        timestamp: Date.now(),
      });
    });
  } catch (err) {
    console.warn("[SW] Heartbeat error:", err);
  }
}, MESH_PING_INTERVAL);

/* —— update-checker —— */
async function checkForUpdates() {
  const cache = await caches.open(CACHE_NAME);
  for (let asset of CORE_ASSETS) {
    try {
      const netRes = await fetch(asset, { cache: "no-store" });
      const cachedRes = await cache.match(asset);
      if (!cachedRes || netRes.headers.get("ETag") !== cachedRes.headers?.get("ETag")) {
        console.log("🔁 [SW] Asset updated:", asset);
        await cache.put(asset, netRes);
        const clients = await self.clients.matchAll({ includeUncontrolled: true });
        clients.forEach((client) =>
          client.postMessage({ type: "ASSET_UPDATED", asset })
        );
      }
    } catch (err) {
      console.warn("⚠️ [SW] Update check failed:", asset, err);
    }
  }
}

/* —— periodic-update —— */
setInterval(() => {
  checkForUpdates();
}, 5 * 60 * 1000); // every 5 minutes