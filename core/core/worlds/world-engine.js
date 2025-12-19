/* ============================================================
   SPAWNVERSE · World Engine v1.0
   Onchain-style world builder and registry
   ============================================================ */

export const WorldEngine = {
  worlds: [],
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;
    console.log("%c🌐 WorldEngine initialized", "color:#8affb3");
  },

  createWorld(name, owner = "@anon") {
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
    return world;
  },

  addModuleToWorld(worldId, module) {
    const w = this.worlds.find((w) => w.id === worldId);
    if (!w) {
      console.warn("⚠️ World not found");
      return;
    }
    w.modules.push(module);
    w.xp += 10;
    console.log(`🔧 Module ${module.name} added to ${w.name}`);
  },

  listWorlds() {
    console.log("🌐 Active Worlds:", this.worlds.length);
    return this.worlds;
  },

  getWorld(id) {
    return this.worlds.find((w) => w.id === id);
  },
};

/* —— Global exposure —— */
if (typeof window !== "undefined") {
  window.WorldEngine = WorldEngine;
  console.log("%c🧩 WorldEngine module loaded", "color:#4af6ff");
}