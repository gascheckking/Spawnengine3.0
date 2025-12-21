/* ============================================================
   SPAWNENGINE · AI Core v4.0
   Central AI control hub — bridges UI, Forge, Kernel & Worker
   ============================================================ */

import { AIBridge } from "./ai-bridge.js";
import { MeshCore } from "../core/mesh-core.js";

export const AICore = {
  active: false,
  history: [],

  init() {
    if (this.active) return;
    this.active = true;
    AIBridge.init();
    console.log("%c🤖 [AICore] SpawnAI online", "color:#7af2ff");
  },

  async ask(prompt) {
    if (!prompt) return;
    this.history.push({ user: prompt, time: Date.now() });

    // Skicka till web worker (lokalt)
    AIBridge.ask(prompt);

    // Logga till MeshCore för XP-spårning
    MeshCore.pushEvent?.(`🧠 AI Query: ${prompt}`);

    // Triggera UI-feedback
    if (window.MeshVisualizer) window.MeshVisualizer.trigger("xp_gain");
  },

  // Enkel lokal "mock"-respons (visas direkt i dev-konsol)
  respondMock(prompt) {
    const replies = [
      "SpawnAI is optimizing mesh load paths...",
      "Analyzing your relic forge patterns...",
      "XP flow stable · 1200 mesh units active.",
      "Forge AI ready to synthesize next blueprint."
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    console.log(`🤖 [AICore → User] ${reply}`);
    return reply;
  }
};

// ✦ Exponera globalt
if (typeof window !== "undefined") window.AICore = AICore;