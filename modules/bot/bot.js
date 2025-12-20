/* ============================================================
   SPAWNENGINE BOT MODULE v4.0
   Background automation (mock)
   ============================================================ */

import { MeshCore } from "../../core/mesh-core.js";
import { MeshBridge } from "../../core/mesh-bridge.js";

export const SpawnBot = {
  init() {
    console.log("%c🤖 [SpawnBot] Initialized", "color:#3cf6ff");
    this.autoXP();
    this.autoSync();
  },

  // —— Auto XP loop —— //
  autoXP() {
    setInterval(() => {
      if (!MeshCore?.updateXP || !MeshBridge?.event) {
        console.warn("[SpawnBot] Core not ready, skipping XP tick.");
        return;
      }

      const bonus = Math.floor(Math.random() * 5) + 1;
      MeshCore.updateXP(bonus);
      MeshBridge.event("AUTO_XP", `SpawnBot granted ${bonus} XP`, bonus);

      console.log(`⚡ [SpawnBot] +${bonus} XP granted automatically`);
    }, 60_000); // every 60 seconds
  },

  // —— Auto Sync loop —— //
  autoSync() {
    setInterval(() => {
      if (!MeshBridge?.event) return;
      MeshBridge.event("SYNC", "SpawnBot mesh sync complete");
      console.log("🔁 [SpawnBot] Mesh sync completed");
    }, 120_000); // every 2 minutes
  },
};