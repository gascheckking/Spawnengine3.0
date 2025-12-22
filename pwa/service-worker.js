/* ============================================================
   SPAWNENGINE v3.1 — SERVICE WORKER (Final)
   "The Hub, Not Another App"
   Handles cache, updates, offline & mesh heartbeat
   ============================================================ */

const CACHE_NAME = "spawnengine-cache-v3.1";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/hud.html",
  "/offline.html",
  "/style.css",
  "/app.js",
  "/mesh-bg.js",
  "/assets/logo.png",
  "/assets/icons/icon-512.png",
];

/* —— INSTALL —— */
self.addEventListener("install", (event) => {
  console.log("⚙️ [SW] Installing SpawnEngine v3.1...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 [SW] Caching core assets...");
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

/* —— ACTIVATE —— */
self.addEventListener("activate", (event) => {
  console.log("♻️ [SW] Activated SpawnEngine");
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
  self.clients.claim();
});

/* —— FETCH HANDLER —— */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (!res || res.status !== 200 || res.type !== "basic") return res;
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match("/pwa/offline.html"));
    })
  );
});

/* —— MESSAGE CHANNEL —— */
self.addEventListener("message", async (event) => {
  const { type } = event.data || {};
  if (type === "CLEAR_CACHE") {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    event.source?.postMessage({ status: "Cache cleared" });
  }
});

/* —— MESH HEARTBEAT —— */
const MESH_PING_INTERVAL = 60 * 1000;
setInterval(async () => {
  try {
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    clients.forEach((client) =>
      client.postMessage({
        type: "MESH_HEARTBEAT",
        timestamp: Date.now(),
      })
    );
  } catch (err) {
    console.warn("[SW] Heartbeat error:", err);
  }
}, MESH_PING_INTERVAL);

/* —— UPDATE CHECKER —— */
async function checkForUpdates() {
  const cache = await caches.open(CACHE_NAME);
  for (const asset of CORE_ASSETS) {
    try {
      const netRes = await fetch(asset, { cache: "no-store" });
      if (!netRes.ok) continue;
      const cachedRes = await cache.match(asset);
      const netETag = netRes.headers.get("ETag");
      const cacheETag = cachedRes?.headers?.get("ETag");
      if (!cachedRes || (netETag && netETag !== cacheETag)) {
        console.log("🔁 [SW] Updated asset:", asset);
        await cache.put(asset, netRes.clone());
        const clients = await self.clients.matchAll({ includeUncontrolled: true });
        clients.forEach((client) =>
          client.postMessage({ type: "ASSET_UPDATED", asset })
        );
      }
    } catch (err) {
      console.warn("⚠️ [SW] Update check failed for", asset, err);
    }
  }
}

/* —— PERIODIC UPDATE (5 min) —— */
setInterval(checkForUpdates, 5 * 60 * 1000);