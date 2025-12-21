/* ============================================================
   SPAWNVERSE · WorldMint v1.3
   Mesh-connected NFT Mock Minting System for Worlds
   ------------------------------------------------------------
   Integrates with MeshCore, SpawnChain, and WorldEngine.
   Adds XP, event feedback, and visual pulse for minted worlds.
   ============================================================ */

import { WorldEngine } from "./world-engine.js";
import { MeshCore } from "../mesh-core.js";
import { SpawnChain } from "../spawnchain/spawn-chain.js";

export const WorldMint = {
  minted: [],

  mintWorld(worldId) {
    const world = WorldEngine.getWorld(worldId);
    if (!world) return console.warn("⚠️ World not found");

    // Generate token
    const tokenId = "NFT-" + Math.floor(Math.random() * 100000);
    const hash = btoa(world.name + world.owner + Date.now()).slice(0, 16);

    const record = {
      tokenId,
      worldId,
      owner: world.owner,
      hash,
      metadata: {
        name: world.name,
        modules: world.modules.length,
        xp: world.xp,
      },
      timestamp: new Date().toLocaleString(),
    };

    this.minted.push(record);

    // 🔗 Register mint in SpawnChain
    if (SpawnChain?.register) {
      SpawnChain.register({
        id: record.tokenId,
        name: `WorldMint:${world.name}`,
        code: JSON.stringify(record.metadata),
      });
    }

    // 🧠 MeshCore sync
    MeshCore.gainXP?.(100, "World Minted");
    MeshCore.pushEvent?.(`🪙 Minted '${world.name}' → ${tokenId}`);

    if (window.spawnMeshPulse) window.spawnMeshPulse("#4df2ff");
    this.toast(`🪙 World '${world.name}' minted successfully!`);

    console.log(`🪙 [WorldMint] Minted world '${world.name}' as ${tokenId}`);
    return record;
  },

  listMints() {
    return this.minted;
  },

  toast(msg) {
    const t = document.createElement("div");
    t.textContent = msg;
    t.style = `
      position: fixed;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: #4df2ff;
      color: #000;
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 600;
      font-family: system-ui,sans-serif;
      z-index: 9999;
      box-shadow: 0 0 12px rgba(77,242,255,0.6);
    `;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  },
};

if (typeof window !== "undefined") {
  window.WorldMint = WorldMint;
  console.log("%c🪙 WorldMint module loaded (v1.3)", "color:#4df2ff");
}