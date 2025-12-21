/* ============================================================
   SPAWNENGINE · Miniapp Registry v1.1
   Mesh Citizens · Feed · XP · Automations Integration
   ------------------------------------------------------------
   Handles registration, XP sync, feed messages & automation rules
   Connected to MeshSync and SpawnChain
   ============================================================ */

import { MeshSync } from "../kernel/mesh-sync.js";
import { SpawnChain } from "../spawnchain/spawn-chain.js";

export const MiniappRegistry = {
  apps: [],
  initialized: false,

  /* —— INIT —— */
  init() {
    if (this.initialized) return;
    this.initialized = true;
    console.log("%c🧩 [MiniappRegistry] Initialized", "color:#4df2ff");
    MeshSync?.sync?.("registry_init");
  },

  /* —— REGISTER MINIAPP —— */
  register(app) {
    if (!app?.id || !app?.type) {
      console.warn("❌ Invalid app registration:", app);
      return;
    }

    this.apps.push(app);

    MeshSync?.sync?.("miniapp_registered", { id: app.id, type: app.type });
    SpawnChain?.register?.({
      id: app.id,
      name: app.type,
      code: JSON.stringify(app.config || {}),
    });

    console.log(`🧩 Miniapp registered: ${app.id} (${app.type})`);
  },

  /* —— XP ATTACH —— */
  attachXP(appId, amount = 5) {
    const app = this.apps.find((a) => a.id === appId);
    if (!app) {
      console.warn("⚠️ App not found:", appId);
      return;
    }
    app.xp = (app.xp || 0) + amount;
    MeshSync?.sync?.("miniapp_xp_gain", { id: appId, amount });
    console.log(`⚡ XP +${amount} → ${app.type} (${app.id})`);
  },

  /* —— FEED PUBLISH —— */
  publishFeed(appId, message) {
    const app = this.apps.find((a) => a.id === appId);
    if (!app) {
      console.warn("⚠️ App not found for feed:", appId);
      return;
    }
    const entry = `[${app.type}] ${message}`;
    console.log(`📰 Feed: ${entry}`);
    MeshSync?.sync?.("miniapp_feed", { id: appId, entry });
  },

  /* —— AUTOMATION ATTACH —— */
  attachAutomation(appId, rule) {
    const app = this.apps.find((a) => a.id === appId);
    if (!app) {
      console.warn("⚠️ App not found for automation:", appId);
      return;
    }
    app.automation = rule;
    MeshSync?.sync?.("miniapp_automation", { id: appId, rule });
    console.log(`🤖 Automation attached to ${app.type}: ${rule}`);
  },

  /* —— LIST REGISTERED APPS —— */
  list() {
    console.log(`📦 Listing ${this.apps.length} miniapps`);
    return this.apps;
  },
};

/* —— GLOBAL EXPOSURE —— */
if (typeof window !== "undefined") {
  window.MiniappRegistry = MiniappRegistry;
  setTimeout(() => MiniappRegistry.init(), 300);
}