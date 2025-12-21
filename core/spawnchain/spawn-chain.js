/* ============================================================
   SPAWNENGINE · SpawnChain v1.2
   Local Pseudo-Chain Ledger for AI-Built & User-Minted Modules
   ------------------------------------------------------------
   Integrates with:
   - ForgeAI (module generation)
   - MeshCore (XP sync + events)
   - MeshVisualizer (chain pulses)
   ============================================================ */

import { ForgeAI } from "../forge/forge-ai.js";
import { MeshCore } from "../mesh-core.js";
import { MeshVisualizer } from "../visuals/mesh-visualizer.js";

export const SpawnChain = {
  ledger: [],
  network: "mesh-local",
  initialized: false,

  /* —— INIT —— */
  init() {
    if (this.initialized) return;
    this.initialized = true;

    console.log("%c🔗 [SpawnChain] Initialized", "color:#4df2ff");
    MeshCore.pushEvent?.("🧩 SpawnChain active");
    this.autoRegister();
  },

  /* —— HASH DATA —— */
  hashData(data) {
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(data)))).slice(0, 32);
    } catch (e) {
      console.warn("⚠️ Hashing failed", e);
      return "ERR_HASH";
    }
  },

  /* —— AUTO REGISTER NEW AI MODULES —— */
  autoRegister() {
    setInterval(() => {
      if (!ForgeAI?.state?.generatedModules?.length) return;

      const newOnes = ForgeAI.state.generatedModules.filter(
        (m) => !this.ledger.find((x) => x.id === m.id)
      );

      newOnes.forEach((m) => this.register(m, "auto"));
    }, 10000);
  },

  /* —— REGISTER MODULE / ACTION —— */
  register(module, mode = "manual") {
    const record = {
      id: module.id || `mod-${Date.now()}`,
      name: module.name || "Unnamed Module",
      hash: this.hashData(module.code || module.name),
      ts: new Date().toLocaleString(),
      status: "verified",
      block: this.ledger.length + 1,
      source: mode,
    };

    this.ledger.push(record);

    MeshCore.gainXP?.(10, "Module Registered");
    MeshCore.pushEvent?.(`🔗 ${record.name} registered on SpawnChain`);
    MeshVisualizer.trigger("mint");

    console.log(
      `%c🪙 [SpawnChain] Registered → #${record.block} ${record.name} (${record.hash})`,
      "color:#8affb3"
    );

    return record;
  },

  /* —— GET LEDGER (last 10) —— */
  getLedger() {
    return this.ledger.slice(-10);
  },

  /* —— RENDER LEDGER TO UI —— */
  renderLedger(containerId = "meshFeed") {
    const el = document.getElementById(containerId);
    if (!el) return;

    const items = this.getLedger();
    el.innerHTML = `
      <div class="feed-item">🔗 SpawnChain Ledger</div>
      ${items
        .map(
          (i) => `
        <div class="feed-sub">
          <span>#${i.block}</span> · <strong>${i.name}</strong> · <code>${i.hash}</code>
        </div>`
        )
        .join("")}
    `;
  },
};

/* —— GLOBAL ACCESS —— */
if (typeof window !== "undefined") {
  window.SpawnChain = SpawnChain;
  setTimeout(() => SpawnChain.init(), 500);
}