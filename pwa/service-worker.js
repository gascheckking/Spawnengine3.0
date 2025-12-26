/* ======================================================
   SPAWNENGINE v6.0 — Service Worker (Mesh + React Hybrid)
   Combines stable caching + heartbeat + offline fallback
   ====================================================== */

const CACHE_NAME = "spawnengine-cache-v6.0";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline.html",
  "/assets/icons/favicon.png",
  "/assets/logo.png",
];

/* —— INSTALL —— */
self.addEventListener("install", (event) => {
  console.log("⚙️ [SW] Installing SpawnEngine v6.0...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

/* —— ACTIVATE —— */
self.addEventListener("activate", (event) => {
  console.log("♻️ [SW] Activated SpawnEngine v6.0");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* —— FETCH HANDLER —— */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const req = event.request;
  const url = new URL(req.url);

  // Skip APIs to allow live data
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req)
        .then((res) => {
          if (!res || res.status !== 200 || res.type !== "basic") return res;
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match("/offline.html"))
    )
  );
});

/* —— MESSAGE HANDLER —— */
self.addEventListener("message", async (event) => {
  const { type } = event.data || {};
  if (type === "CLEAR_CACHE") {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    event.source?.postMessage({ status: "Cache cleared" });
  }
});

/* —— HEARTBEAT (for Firebase Bridge) —— */
const MESH_PING_INTERVAL = 60 * 1000;
setInterval(async () => {
  try {
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    for (const client of clients) {
      client.postMessage({
        type: "MESH_HEARTBEAT",
        timestamp: Date.now(),
      });
    }
  } catch (err) {
    console.warn("[SW] Heartbeat error:", err);
  }
}, MESH_PING_INTERVAL);