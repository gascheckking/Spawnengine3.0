// ============================================================
// SPAWNENGINE · ForgeKernelBridge v1.0
// ------------------------------------------------------------
// Kopplar AutoBuilder → ForgeAI → SpawnChain → MeshCore
// ============================================================

import { MeshCore } from "../kernel/mesh-kernel.js";
import { ForgeAI } from "./forge-ai.js";
import { SpawnChain } from "../spawnchain/spawn-chain.js";

export const ForgeKernelBridge = {
  register(moduleName, source) {
    try {
      const block = {
        id: Date.now(),
        name: moduleName,
        origin: source || "ForgeAI",
        timestamp: new Date().toISOString(),
      };

      // 🧱 Registrera block i SpawnChain
      if (SpawnChain?.register) SpawnChain.register(block);

      // 🧠 Logga i MeshCore
      if (MeshCore?.pushEvent)
        MeshCore.pushEvent(`🔗 ForgeBridge: ${moduleName} synced`);

      // 💫 Visuell effekt
      if (window.spawnMeshPulse) spawnMeshPulse("#4df2ff");

      console.log(`[ForgeBridge] Module synced: ${moduleName}`);
    } catch (err) {
      console.error("❌ ForgeKernelBridge error:", err);
    }
  },

  init() {
    console.log("🧬 ForgeKernelBridge ready");
  },
};

// 🔁 Auto-initiera när sidan laddats
if (typeof window !== "undefined") ForgeKernelBridge.init();