/* ============================================================
   SPAWNENGINE · Miniapp Registry v1.0
   Mesh Citizens · Feed · XP · Automations Integration
   ============================================================ */

import { MeshSync } from "../kernel/mesh-sync.js";
import { SpawnChain } from "../spawnchain/spawn-chain.js";

export const MiniappRegistry = {
  apps: [],

  register(app) {
    if (!app?.id) return console.warn("❌ Invalid app registration");
    this.apps.push(app);
    MeshSync?.sync?.("miniapp_registered", { id: app.id, type: app.type });
    SpawnChain?.register?.({ id: app.id, name: app.type, code: app.config });
    console.log(`🧩 Miniapp registered: ${app.id} (${app.type})`);
  },

  attachXP(appId, amount = 5) {
    const app = this.apps.find(a => a.id === appId);
    if (!app) return;
    app.xp = (app.xp || 0) + amount;
    console.log(`⚡ XP +${amount} → ${app.type}`);
  },

  publishFeed(appId, message) {
    const app = this.apps.find(a => a.id === appId);
    if (!app) return;
    const entry = `[${app.type}] ${message}`;
    console.log(`📰 Feed: ${entry}`);
  },

  attachAutomation(appId, rule) {
    const app = this.apps.find(a => a.id === appId);
    if (!app) return;
    app.automation = rule;
    console.log(`🤖 Automation attached to ${app.type}: ${rule}`);
  },

  list() {
    return this.apps;
  }
};

if (typeof window !== "undefined") window.MiniappRegistry = MiniappRegistry;