/* ============================================================
   SPAWNENGINE · Core Engine v1.7 (Hybrid Integration Build)
   Master Orchestrator — MeshKernel · ForgeAI · SpawnChain · WorldEngine · Factory · Miniapps
   ============================================================ */

import { MeshKernel } from "./kernel/mesh-kernel.js";
import { MeshSync } from "./kernel/mesh-sync.js";
import { EventLoop } from "./kernel/event-loop.js";

import { ForgeAI } from "./forge/forge-ai.js";
import { ForgeUI } from "./forge/forge-ui.js";
import { ForgeTerminal } from "./forge/forge-terminal.js";

import { SpawnChain } from "./spawnchain/spawn-chain.js";

import { WorldEngine } from "./worlds/world-engine.js";
import { WorldMint } from "./worlds/world-mint.js";
import { WorldHub } from "./worlds/worldhub.js";

import { FactoryEngine } from "./factory/factory-engine.js";
import { MiniappRegistry } from "./miniapps/miniapp-registry.js";

export const SpawnEngine = {
  initialized: false,

  async init() {
    if (this.initialized) {
      console.warn("⚠️ SpawnEngine already initialized");
      return;
    }

    console.log("%c🚀 Booting SpawnEngine Core v1.7", "color:#3cf6ff; font-weight:bold;");

    try {
      /* —— CORE SYSTEMS —— */
      if (MeshKernel?.init) await MeshKernel.init();
      if (SpawnChain?.init) SpawnChain.init();

      /* —— FORGE MODULES —— */
      setTimeout(() => {
        try {
          ForgeAI.init?.();
          ForgeUI.init?.();
          ForgeAI.renderForgePanel?.("meshFeed");
          console.log("🧬 Forge subsystem online");
        } catch (err) {
          console.error("❌ Forge init failed:", err);
        }
      }, 2500);

      /* —— TERMINAL —— */
      setTimeout(() => {
        try {
          ForgeTerminal.init?.("forgeTerminal");
          console.log("💻 Forge Terminal active");
        } catch (err) {
          console.error("❌ ForgeTerminal init failed:", err);
        }
      }, 4500);

      /* —— NETWORK SYNC —— */
      setTimeout(() => {
        try {
          MeshSync.init?.();
          console.log("🌐 MeshSync active");
        } catch (err) {
          console.error("❌ MeshSync init failed:", err);
        }
      }, 6000);

      /* —— EVENT LOOP —— */
      setTimeout(() => {
        try {
          EventLoop.start?.();
          console.log("⏱ EventLoop running");
        } catch (err) {
          console.error("❌ EventLoop start failed:", err);
        }
      }, 7500);

      /* —— WORLD ENGINE LINK —— */
      setTimeout(() => {
        try {
          if (WorldEngine && WorldMint) {
            window.WorldEngine = WorldEngine;
            window.WorldMint = WorldMint;
            console.log("🌍 WorldEngine & WorldMint linked");
          }
        } catch (err) {
          console.error("❌ WorldEngine link failed:", err);
        }
      }, 8500);

      /* —— WORLD HUB INIT —— */
      setTimeout(() => {
        try {
          if (WorldHub?.init) {
            WorldHub.init("worldHubView");
            console.log("🪐 WorldHub view initialized");
          }
        } catch (err) {
          console.error("❌ WorldHub init failed:", err);
        }
      }, 9500);

      /* —— FACTORY + MINIAPP SYSTEM —— */
      setTimeout(() => {
        try {
          FactoryEngine.init();
          window.FactoryEngine = FactoryEngine;
          window.MiniappRegistry = MiniappRegistry;
          console.log("🏗️ Builder Mode + Miniapp System ready");
        } catch (err) {
          console.error("❌ Factory/Miniapp init failed:", err);
        }
      }, 10500);

      this.initialized = true;
      console.log("%c✅ SpawnEngine Core Online", "color:#b9ff7a; font-weight:bold;");
    } catch (err) {
      console.error("❌ SpawnEngine init failed:", err);
    }
  },

  /* —— Helper methods —— */
  createWorld(name) {
    if (!WorldEngine) return console.warn("WorldEngine missing");
    return WorldEngine.createWorld(name);
  },

  mintWorld(worldId) {
    if (!WorldMint) return console.warn("WorldMint missing");
    return WorldMint.mintWorld(worldId);
  },

  registerMiniapp(appName, config) {
    if (!MiniappRegistry) return console.warn("MiniappRegistry missing");
    return MiniappRegistry.register(appName, config);
  },
};

/* —— Global Exposure —— */
if (typeof window !== "undefined") {
  window.SpawnEngine = SpawnEngine;
  console.log("%c🧩 SpawnEngine Core v1.7 registered globally", "color:#14b8a6;");
}

/* —— Auto Boot —— */
document.addEventListener("DOMContentLoaded", async () => {
  console.log("⚙️ Booting SpawnEngine auto sequence...");
  await SpawnEngine.init();

  // Bonus: skapa Genesis-world om ingen finns
  if (window.WorldEngine && WorldEngine.listWorlds().length === 0) {
    WorldEngine.createWorld("Genesis", "@spawniz");
    console.log("🌐 Genesis world auto-created");
  }
});