/* ============================================================
   SPAWNVERSE · World Mint v1.0
   Mock NFT minting for user-created worlds
   ============================================================ */

import { WorldEngine } from "./world-engine.js";

export const WorldMint = {
  minted: [],

  mintWorld(worldId) {
    const world = WorldEngine.getWorld(worldId);
    if (!world) return console.warn("World not found");

    const tokenId = "NFT-" + Math.floor(Math.random() * 100000);
    const record = {
      tokenId,
      worldId,
      owner: world.owner,
      metadata: { name: world.name, modules: world.modules.length },
      timestamp: new Date().toLocaleString(),
    };
    this.minted.push(record);
    console.log(`🪙 Minted world ${world.name} as ${tokenId}`);
    return record;
  },

  listMints() {
    return this.minted;
  },
};
window.WorldMint = WorldMint;
