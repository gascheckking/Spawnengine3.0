/* ============================================================
   SPAWNENGINE INIT v1.0
   Entry point — boots SpawnEngine Core & Genesis world
   ============================================================ */

import { SpawnEngine } from "./core/spawn-engine.js";
import { WorldEngine } from "./core/worlds/world-engine.js";
import { WorldMint } from "./core/worlds/world-mint.js";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("⚙️ Booting SpawnEngine auto sequence...");
  await SpawnEngine.init();

  // 🌐 Create Genesis world
  if (WorldEngine?.createWorld) {
    WorldEngine.createWorld("Genesis", "@spawniz");
    console.log("🌍 SpawnVerse online (Genesis world created)");
  }

  // 🧩 Optional: trigger WorldHub render if loaded
  if (window.renderWorlds) {
    try {
      renderWorlds();
      console.log("🧩 WorldHub rendered");
    } catch (err) {
      console.warn("WorldHub not loaded yet:", err);
    }
  }
});