/* ============================================================
   SPAWNENGINE · SpawnChain v1.0
   Local pseudo-chain ledger for AI-built modules
   ============================================================ */

import { ForgeAI } from "../forge/forge-ai.js";

export const SpawnChain = {
  ledger: [],
  network: "mesh-local",

  init() {
    console.log("🔗 SpawnChain initialized");
    this.autoRegister();
  },

  hashData(data) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(data)))).slice(0, 24);
  },

  autoRegister() {
    setInterval(() => {
      const modules = ForgeAI.state.generatedModules;
      if (modules.length === 0) return;

      const newOnes = modules.filter(m => !this.ledger.find(x => x.id === m.id));
      newOnes.forEach(m => this.register(m));
    }, 10000);
  },

  register(module) {
    const record = {
      id: module.id,
      name: module.name,
      hash: this.hashData(module.code),
      ts: new Date().toLocaleString(),
      status: "verified",
      block: this.ledger.length + 1,
    };
    this.ledger.push(record);
    console.log(`🪙 [SpawnChain] Registered module: ${module.name} (${record.hash})`);
  },

  getLedger() {
    return this.ledger.slice(-10);
  },

  renderLedger(containerId = "meshFeed") {
    const el = document.getElementById(containerId);
    if (!el) return;
    const items = this.getLedger();
    el.innerHTML += `
      <div class="feed-item">🔗 SpawnChain Ledger:</div>
      ${items.map(i => `<div class="feed-sub">#${i.block} · ${i.name} · ${i.hash}</div>`).join("")}
    `;
  },
};

