/* ============================================================
   SPAWNVERSE · World Engine v1.0
   Onchain-style world builder and registry
   ============================================================ */

export const WorldEngine = {
  worlds: [],

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
    const w = this.worlds.find(w => w.id === worldId);
    if (!w) return console.warn("⚠️ World not found");
    w.modules.push(module);
    w.xp += 10;
    console.log(`🔧 Added module ${module.name} → ${w.name}`);
  },

  listWorlds() {
    return this.worlds;
  },

  getWorld(id) {
    return this.worlds.find(w => w.id === id);
  },

  deleteWorld(id) {
    const index = this.worlds.findIndex(w => w.id === id);
    if (index !== -1) {
      const removed = this.worlds.splice(index, 1)[0];
      console.log(`🗑 Deleted world: ${removed.name}`);
      return removed;
    }
    console.warn("⚠️ World not found");
  },

  xpBoost(worldId, amount = 5) {
    const w = this.getWorld(worldId);
    if (!w) return;
    w.xp += amount;
    console.log(`⚡ ${w.name} gained +${amount} XP (Total: ${w.xp})`);
  },
};

window.WorldEngine = WorldEngine;