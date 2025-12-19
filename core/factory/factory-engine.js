/* ============================================================
   SPAWNENGINE · Factory Engine v1.0
   Builder Mode — Onchain Roblox Deployment System
   ============================================================ */

import { SpawnChain } from "../spawnchain/spawn-chain.js";
import { MeshSync } from "../kernel/mesh-sync.js";

export const FactoryEngine = {
  registry: [],
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;
    console.log("🏗️ Factory Engine initialized");
  },

  async deploy(type, config = {}, owner = "@anon") {
    const id = "APP-" + Math.floor(Math.random() * 999999);
    const timestamp = new Date().toLocaleString();

    const app = {
      id,
      type,
      owner,
      config,
      createdAt: timestamp,
      status: "deployed",
      xp: 0,
    };

    this.registry.push(app);

    // Log to Mesh + SpawnChain
    MeshSync?.sync?.("app_deployed", { type, owner, id });
    SpawnChain?.register?.({ id, name: type + " Factory", code: JSON.stringify(config) });

    console.log(`🚀 [Factory] Deployed ${type} module (${id})`);
    return app;
  },

  list() {
    return this.registry;
  },

  get(id) {
    return this.registry.find(a => a.id === id);
  }
};

if (typeof window !== "undefined") window.FactoryEngine = FactoryEngine;