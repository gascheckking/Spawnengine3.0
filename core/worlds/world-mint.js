/* ============================================================
   SPAWNVERSE · World Mint v1.0
   Mock NFT minting for user-created worlds (chain-linked)
   ============================================================ */

import { WorldEngine } from "./world-engine.js";
import { SpawnChain } from "../spawnchain/spawn-chain.js";

export const WorldMint = {
  minted: [],

  mintWorld(worldId) {
    const world = WorldEngine.getWorld(worldId);
    if (!world) return console.warn("⚠️ World not found");

    // Skapa NFT-record
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

    // 🔗 Registrera mint i SpawnChain
    if (SpawnChain?.register) {
      SpawnChain.register({
        id: record.tokenId,
        name: world.name,
        code: JSON.stringify(record.metadata),
      });
    }

    console.log(`🪙 [WorldMint] Minted world '${world.name}' as ${tokenId}`);
    return record;
  },

  listMints() {
    return this.minted;
  },
};

window.WorldMint = WorldMint;