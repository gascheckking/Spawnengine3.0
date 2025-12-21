/* ============================================================
   SPAWNENGINE · SystemEvents v1.0
   Centralized event dispatcher between Mesh systems
   ============================================================ */

import { MeshCore } from "../core/mesh-core.js";
import { MeshVisualizer } from "../core/visuals/mesh-visualizer.js";
import { SpawnChain } from "../core/spawnchain/spawn-chain.js";

export const SystemEvents = {
  log(event, data = {}) {
    console.log(`🛰 [SystemEvents] ${event}`, data);
    MeshCore.pushEvent?.(event);
    MeshVisualizer.trigger?.(event);
    SpawnChain.register?.({ id: Date.now(), name: event, code: JSON.stringify(data) });
  },

  xp(event, amount = 10) {
    MeshCore.gainXP?.(amount, event);
    this.log(event, { xp: amount });
  },

  notify(message) {
    if (!message) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  },
};

if (typeof window !== "undefined") window.SystemEvents = SystemEvents;