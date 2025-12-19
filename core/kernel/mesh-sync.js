
/* ============================================================
   SPAWNENGINE · MeshSync v1.0
   Live synchronization between Kernel, ForgeAI and SpawnChain
   ============================================================ */

import { MeshKernel } from "./mesh-kernel.js";
import { ForgeAI } from "../forge/forge-ai.js";
import { SpawnChain } from "../spawnchain/spawn-chain.js";

export const MeshSync = {
  active: false,

  init() {
    this.active = true;
    console.log("🛰 MeshSync active");
    this.loop();
  },

  loop() {
    setInterval(() => {
      const insight = `${Object.keys(MeshKernel.state.modules).length} mods | ${ForgeAI.state.generatedModules.length} builds | ${SpawnChain.ledger.length} chain blocks`;
      MeshKernel.logEvent(`MeshSync update: ${insight}`);
    }, 12000);
  },
};