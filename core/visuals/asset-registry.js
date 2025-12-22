/* ============================================================
   SPAWNENGINE · Asset Registry v1.0
   Maps all visual/sound assets for global access
   ============================================================ */

export const AssetRegistry = {
  images: {
    logo: "/assets/logo.png",
    favicon: "/assets/icons/favicon.png",
    packBg: "/assets/img/pack-bg.webp",
    packBgTitle: "/assets/img/pack-bg-title.webp",
    arenaBg: "/assets/img/arena-bg.webp",
    relic: "/assets/img/relic.webp",
  },

  sounds: {
    reveal: "/assets/sounds/reveal.mp3",
    success: "/assets/sounds/success.mp3",
    xpGain: "/assets/sounds/xp-gain.mp3",
    alert: "/assets/sounds/alert.mp3",
  },

  /**
   * Fetches a visual or audio asset by key
   */
  get(type, key) {
    if (type === "image") return this.images[key] || null;
    if (type === "sound") return this.sounds[key] || null;
    return null;
  },

  /**
   * Preloads core image assets
   */
  preload() {
    Object.values(this.images).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    console.log("🖼️ AssetRegistry preloaded images");
  },
};

/* Global exposure */
if (typeof window !== "undefined") {
  window.AssetRegistry = AssetRegistry;
  document.addEventListener("DOMContentLoaded", () => AssetRegistry.preload());
}