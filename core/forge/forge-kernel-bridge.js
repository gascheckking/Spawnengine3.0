/* ============================================================
   SPAWNENGINE · Forge-Kernel Bridge v1.0
   Connects AutoBuilder ⇆ ForgeAI ⇆ MeshKernel ⇆ SpawnChain
   ============================================================ */

import { MeshKernel } from "../kernel/mesh-kernel.js";
import { AutoBuilder } from "../kernel/autobuilder.js";
import { ForgeAI } from "./forge-ai.js";
import { SpawnChain } from "../spawnchain/spawn-chain.js";

/* ============================================================
   BRIDGE CORE
   ============================================================ */
export const ForgeKernelBridge = {
  active: false,
  interval: null,
  lastSync: null,

  init() {
    if (this.active) return;
    this.active = true;
    console.log("🧩 Forge-Kernel Bridge activated");
    this.startBridge();
  },

  /* ------------------------------------------------------------
     Startar periodisk synk mellan AutoBuilder & ForgeAI
  ------------------------------------------------------------ */
  startBridge() {
    this.interval = setInterval(() => {
      const ideas = AutoBuilder.getProposals?.() || [];
      if (ideas.length === 0) return;

      // Välj slumpmässig idé och generera modul
      const idea = ideas[Math.floor(Math.random() * ideas.length)];
      const module = ForgeAI.generateModuleSuggestion(idea);
      ForgeAI.state.generatedModules.push(module);

      // Registrera i Kernel & SpawnChain
      MeshKernel.registerModule?.(module.name, "1.0");
      SpawnChain.register?.(module);

      // Logga och XP-förstärk
      MeshKernel.logEvent?.(`Bridge auto-generated module: ${module.name}`);
      if (window.MeshCore?.gainXP) window.MeshCore.gainXP(15, "AutoForge Bridge");

      // Visuell pulse
      if (window.MeshVisualizer) window.MeshVisualizer.trigger("xp_gain");

      this.lastSync = new Date().toLocaleTimeString();
      console.log(`🧠 [Bridge] Synced idea → ForgeAI → Chain (${this.lastSync})`);
    }, 25000);
  },

  /* ------------------------------------------------------------
     Manuell trigger (kan kallas från terminal eller devtools)
  ------------------------------------------------------------ */
  triggerNow() {
    const ideas = AutoBuilder.getProposals?.() || [];
    if (ideas.length === 0) return console.warn("⚠️ No ideas to forge.");
    const idea = ideas[Math.floor(Math.random() * ideas.length)];
    const module = ForgeAI.generateModuleSuggestion(idea);
    ForgeAI.state.generatedModules.push(module);
    MeshKernel.registerModule?.(module.name);
    SpawnChain.register?.(module);
    console.log(`🧱 [Bridge Manual] Generated: ${module.name}`);
  },
};

/* ============================================================
   GLOBAL EXPOSURE
   ============================================================ */
if (typeof window !== "undefined") {
  window.ForgeKernelBridge = ForgeKernelBridge;
  setTimeout(() => ForgeKernelBridge.init(), 1500);
}