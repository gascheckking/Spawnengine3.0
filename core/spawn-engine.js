/* ============================================================
   SPAWNENGINE · Core Engine v1.2
   Master Orchestrator — MeshKernel · ForgeAI · SpawnChain · EventLoop
   ============================================================ */

import { MeshKernel } from "./kernel/mesh-kernel.js";
import { MeshSync } from "./kernel/mesh-sync.js";
import { EventLoop } from "./kernel/event-loop.js";
import { ForgeAI } from "./forge/forge-ai.js";
import { ForgeUI } from "./forge/forge-ui.js";
import { ForgeTerminal } from "./forge/forge-terminal.js";
import { SpawnChain } from "./spawnchain/spawn-chain.js";

export const SpawnEngine = {
  initialized: false,

  async init() {
    if (this.initialized) {
      console.warn("⚠️ SpawnEngine already initialized");
      return;
    }

    console.log("%c🚀 Booting SpawnEngine Core v1.2", "color:#3cf6ff; font-weight:bold;");

    try {
      // 🧠 Initiera kärnsystem
      if (MeshKernel?.init) await MeshKernel.init();
      if (SpawnChain?.init) SpawnChain.init();

      // 🧬 Initiera Forge
      setTimeout(() => {
        ForgeAI.init();
        ForgeUI.init();
        ForgeAI.renderForgePanel("meshFeed");
      }, 3000);

      // 💻 Initiera ForgeTerminal
      setTimeout(() => {
        ForgeTerminal.init("forgeTerminal");
      }, 5000);

      // 🌐 Initiera MeshSync
      setTimeout(() => {
        MeshSync.init();
      }, 7000);

      // ⏱ Starta autonoma loopen
      setTimeout(() => {
        EventLoop.start();
      }, 9000);

      this.initialized = true;
      console.log("%c✅ SpawnEngine Core Online", "color:#b9ff7a; font-weight:bold;");
    } catch (err) {
      console.error("❌ SpawnEngine init failed:", err);
    }
  },
};

/* —— Global exposure —— */
window.SpawnEngine = window.SpawnEngine || {};
window.SpawnEngine.Core = SpawnEngine;

console.log("%c🧩 SpawnEngine Core module loaded", "color:#14b8a6;");