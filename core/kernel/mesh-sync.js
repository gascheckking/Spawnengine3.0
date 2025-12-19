/* ============================================================
   SPAWNENGINE · MeshSync v3.1 (Reforge Build)
   Live synchronization between Kernel, ForgeAI, SpawnChain & Visualizer
   ============================================================ */

import { MeshKernel } from "./mesh-kernel.js";
import { ForgeAI } from "../forge/forge-ai.js";
import { SpawnChain } from "../spawnchain/spawn-chain.js";

/* ============================================================
   MESH SYNC · Core
   ============================================================ */
export const MeshSync = {
  active: false,
  syncCount: 0,

  init() {
    this.active = true;
    console.log("🛰 MeshSync active");
    this.loop();
  },

  /* ------------------------------------------------------------
     SYNC LOOP — runs every 12s to update core systems
  ------------------------------------------------------------ */
  loop() {
    setInterval(() => {
      if (!this.active) return;

      this.syncCount++;
      const tick = this.syncCount;

      const modCount = Object.keys(MeshKernel?.state?.modules || {}).length;
      const builds = ForgeAI?.state?.generatedModules?.length || 0;
      const blocks = SpawnChain?.ledger?.length || 0;
      const insight = `${modCount} mods | ${builds} builds | ${blocks} blocks`;

      MeshKernel.logEvent(`MeshSync update #${tick}: ${insight}`);

      // 🌌 Trigger a soft mesh pulse every loop
      if (window.MeshVisualizer && tick % 2 === 0) {
        window.MeshVisualizer.trigger("xp_gain");
      }
    }, 12000);
  },

  /* ------------------------------------------------------------
     SYNC EVENT — called manually by other systems
  ------------------------------------------------------------ */
  sync(event, payload = {}) {
    console.log(`🛰 Syncing event: ${event}`);
    if (SpawnChain?.push) SpawnChain.push(event, payload);

    // 🔗 Visual pulse per event type
    if (window.MeshVisualizer) window.MeshVisualizer.trigger(event);
  },
};

/* ============================================================
   GLOBAL EXPOSURE
   ============================================================ */
if (typeof window !== "undefined") {
  window.MeshSync = MeshSync;
}