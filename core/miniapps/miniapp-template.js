/* ============================================================
   SPAWNENGINE · Miniapp Template v1.1
   Universal Miniapp Base Class — integrated with:
   - MiniappRegistry (registration)
   - MeshCore (XP + state sync)
   - SpawnChain (onchain logging)
   ============================================================ */

import { MiniappRegistry } from "./miniapp-registry.js";
import { MeshCore } from "../mesh-core.js";
import { SpawnChain } from "../spawnchain/spawn-chain.js";

export class MiniappTemplate {
  constructor(config = {}) {
    this.id = config.id || `miniapp-${Date.now()}`;
    this.type = config.type || "generic";
    this.name = config.name || "Unnamed Miniapp";
    this.icon = config.icon || "⚙️";
    this.version = config.version || "1.0";
    this.config = config;
    this.xp = 0;
    this.state = {};

    this.register();
  }

  /* —— REGISTRATION —— */
  register() {
    if (MiniappRegistry?.register) {
      MiniappRegistry.register({
        id: this.id,
        type: this.type,
        name: this.name,
        icon: this.icon,
        version: this.version,
        config: this.config,
        xp: this.xp,
      });
    }

    MeshCore.pushEvent?.(`🧩 ${this.name} (${this.type}) registered`);
    SpawnChain.register?.({
      id: this.id,
      name: this.name,
      code: `Miniapp:${this.type}:${this.version}`,
    });

    console.log(`✅ [Miniapp] ${this.name} initialized (v${this.version})`);
  }

  /* —— XP HANDLING —— */
  addXP(amount = 5, reason = "Miniapp interaction") {
    this.xp += amount;
    MeshCore.gainXP?.(amount, reason);
    MiniappRegistry.attachXP?.(this.id, amount);
    console.log(`⚡ +${amount} XP → ${this.name}`);
  }

  /* —— FEED HANDLER —— */
  post(message) {
    MiniappRegistry.publishFeed?.(this.id, message);
    console.log(`📢 [${this.name}] ${message}`);
  }

  /* —— AUTOMATION —— */
  setAutomation(rule) {
    MiniappRegistry.attachAutomation?.(this.id, rule);
  }

  /* —— INTERNAL STATE —— */
  updateState(key, value) {
    this.state[key] = value;
    MeshCore.syncState?.("miniapp_state", { id: this.id, key, value });
  }

  getState(key) {
    return this.state[key];
  }

  /* —— UI INTEGRATION —— */
  attachTo(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return console.warn(`⚠️ Container ${containerId} not found`);
    const card = document.createElement("div");
    card.className = "miniapp-card";
    card.innerHTML = `
      <h3>${this.icon} ${this.name}</h3>
      <p>Type: ${this.type}</p>
      <small>v${this.version}</small>
    `;
    el.appendChild(card);
  }

  /* —— LIFECYCLE —— */
  destroy() {
    console.log(`🗑️ [Miniapp] ${this.name} destroyed`);
    this.post("Miniapp session ended.");
  }
}

/* —— GLOBAL EXPOSURE —— */
if (typeof window !== "undefined") {
  window.MiniappTemplate = MiniappTemplate;
  console.log("%c🧱 MiniappTemplate available (v1.1)", "color:#b9ff7a");
}