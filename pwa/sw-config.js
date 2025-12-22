export default {
  cacheName: "spawnengine-mesh-v3.1",
  globPatterns: ["**/*.{html,css,js,png,jpg,svg,json,woff2}"],
  runtimeCaching: [
    {
      urlPattern: "/api/",
      handler: "NetworkFirst",
      options: {
        cacheName: "spawnengine-api-cache",
        expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
      },
    },
    {
      urlPattern: "/modules/",
      handler: "CacheFirst",
      options: {
        cacheName: "spawnengine-modules-cache",
        expiration: { maxEntries: 30, maxAgeSeconds: 259200 },
      },
    },
    {
      urlPattern: "/assets/",
      handler: "CacheFirst",
      options: {
        cacheName: "spawnengine-assets-cache",
        expiration: { maxEntries: 60, maxAgeSeconds: 259200 },
      },
    },
  ],
  description: "SpawnEngine Mesh Layer v3.1 — Offline-Ready PWA Configuration",
};