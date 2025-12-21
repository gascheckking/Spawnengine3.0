/* ============================================================
   SPAWNVERSE · WorldEngine v1.3
   Mesh-connected World Builder & Registry System
   ------------------------------------------------------------
   Handles creation, listing, module linking & XP reward sync.
   Fully integrated with MeshCore (v3.2) and HUD event pipeline.
   ============================================================ */

import { MeshCore } from "../mesh-core.js";

export const WorldEngine = {
  worlds: [],
  initialized: false,

  /* —— INIT —— */
  init() {
    if (this.initialized) return;
    this.initialized = true;
    console.log("%c🌐 [WorldEngine] Initialized", "color:#8affb3");
    MeshCore.pushEvent?.("🌐 WorldEngine active");
  },

  /* —— CREATE WORLD —— */
  createWorld(name, owner = MeshCore.state?.user || "@anon") {
    const id = "WORLD-" + Math.floor(Math.random() * 99999);
    const world = {
      id,
      name,
      owner,
      createdAt: new Date().toLocaleString(),
      modules: [],
      xp: 0,
    };
    this.worlds.push(world);
    console.log(`🌍 Created new world: ${name} (${id})`);

    // XP reward for world creation
    MeshCore.gainXP?.(50, "New World Created");
    MeshCore.pushEvent?.(`🌍 World '${name}' registered`);

    // Toast / visual feedback (optional)
    if (window.spawnMeshPulse) window.spawnMeshPulse("#4df2ff");

    return world;
  },

  /* —— ADD MODULE TO WORLD —— */
  addModuleToWorld(worldId, module) {
    const w = this.worlds.find((w) => w.id === worldId);
    if (!w) {
      console.warn("⚠️ World not found:", worldId);
      MeshCore.pushEvent?.(`❌ Failed to attach module to ${worldId}`);
      return;
    }

    w.modules.push(module);
    w.xp += 10;

    MeshCore.gainXP?.(10, `Added module to ${w.name}`);
    MeshCore.pushEvent?.(`🔧 Module '${module.name || "unnamed"}' added to ${w.name}`);

    console.log(`🔧 Module ${module.name} added to ${w.name}`);
  },

  /* —— LIST WORLDS —— */
  listWorlds() {
    console.log("🌐 Active Worlds:", this.worlds.length);
    return this.worlds;
  },

  /* —— GET WORLD —— */
  getWorld(id) {
    return this.worlds.find((w) => w.id === id);
  },

  /* —— DELETE WORLD —— */
  deleteWorld(id) {
    const index = this.worlds.findIndex((w) => w.id === id);
    if (index === -1) return false;

    const [removed] = this.worlds.splice(index, 1);
    MeshCore.pushEvent?.(`🗑️ World '${removed.name}' deleted`);
    console.log(`🗑️ Deleted world: ${removed.name}`);
    return true;
  },

  /* —— XP SYNC —— */
  syncXP(worldId, amount = 10) {
    const w = this.getWorld(worldId);
    if (!w) return;
    w.xp += amount;
    MeshCore.gainXP?.(amount, `World XP Sync`);
    MeshCore.pushEvent?.(`⚡ ${w.name} XP +${amount}`);
  },
};

/* —— GLOBAL EXPOSURE —— */
if (typeof window !== "undefined") {
  window.WorldEngine = WorldEngine;
  console.log("%c🧩 WorldEngine module loaded (v1.3)", "color:#4df2ff");
  setTimeout(() => WorldEngine.init(), 250);
}