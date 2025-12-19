/* ============================================================
   SPAWNENGINE · Unified Bootstrap v1.0
   Brings Forge, Chain, Arena, Bot & UI online together.
   ============================================================ */

import { ForgeAI } from "./forge/forge-ai.js";
import { ForgeUI } from "./forge/forge-ui.js";
import { ForgeTerminal } from "./forge/forge-terminal.js";
import { SpawnChain } from "./spawnchain/spawn-chain.js";
import { SpawnArena } from "./arena/spawn-arena.js";
import { MeshCore } from "./MeshCore.js";
import { MeshBridge } from "./mesh-bridge.js";

export const SpawnEngine = {
  async init() {
    console.log("🧠 Booting SpawnEngine Unified System…");

    // --- CORE SETUP ---
    await MeshCore.init?.();
    MeshBridge.init?.();
    SpawnArena.init?.();

    // --- FORGE SYSTEM ---
    ForgeAI.init();
    setTimeout(() => ForgeUI.init(), 2500);
    setTimeout(() => ForgeTerminal.init("forgeTerminal"), 4000);

    // --- SPAWNCHAIN ---
    setTimeout(() => {
      SpawnChain.init();
      SpawnChain.renderLedger("meshFeed");
    }, 6000);

    console.log("%c✅ SpawnEngine Fully Online", "color:#3cf6ff;font-weight:bold;");
  },
};

window.SpawnEngine = SpawnEngine;