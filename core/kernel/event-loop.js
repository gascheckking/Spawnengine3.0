/* ============================================================
   SPAWNENGINE · EventLoop v1.0
   Autonomous runtime evolution loop
   ============================================================ */

import { MeshKernel } from "./mesh-kernel.js";
import { ForgeAI } from "../forge/forge-ai.js";
import { SpawnChain } from "../spawnchain/spawn-chain.js";

export const EventLoop = {
  ticks: 0,
  interval: null,

  start() {
    if (this.interval) return console.warn("⚠️ EventLoop already running");
    console.log("⏱ [EventLoop] Autonomous evolution started…");

    this.interval = setInterval(() => {
      this.ticks++;
      const tick = this.ticks;

      // 🧩 Kernel heartbeat
      if (tick % 5 === 0) {
        MeshKernel.logEvent(`Runtime heartbeat (${tick})`);
      }

      // 🧬 Auto-create new Forge modules every 10 ticks
      if (tick % 10 === 0) {
        const idea = {
          title: `EvoMod ${tick}`,
          desc: "Auto-generated evolution node",
        };
        const mod = ForgeAI.generateModuleSuggestion(idea);
        ForgeAI.state.generatedModules.push(mod);
        console.log(`🧱 [ForgeAI] Evolution module generated: ${mod.name}`);
      }

      // 🔗 Register latest Forge module to SpawnChain
      if (tick % 15 === 0) {
        const latest = ForgeAI.state.generatedModules.slice(-1);
        latest.forEach((m) => {
          SpawnChain.register(m);
          console.log(`🪙 [SpawnChain] Module registered: ${m.name}`);
        });
      }
    }, 5000);
  },
};