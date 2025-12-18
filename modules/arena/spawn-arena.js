// ======================================================
// 🏆 SPAWNARENA CORE v3.1 — Mesh Contest Engine
// ------------------------------------------------------
// Hanterar live-bounties, arenas, quests & leaderboards.
// Integreras direkt med MeshCore & SpawnBot.
// ------------------------------------------------------
// © SpawnEngine / MeshOS 2025
// ======================================================

import { meshCore } from "../MeshCore.js";

export const SpawnArena = {
  state: {
    activeContest: null,
    leaderboard: [],
    bounties: [],
    arenaActive: false,
  },

  //——— INIT ——//
  init() {
    console.log("%c[SpawnArena] Arena module initialized.", "color:#facc15");
    this.loadBounties();
  },

  //——— LADDAR BOUNTIES ——//
  loadBounties() {
    this.state.bounties = [
      {
        id: "arena_100_pulls",
        title: "🏅 First 100 Pack Pulls",
        reward: 500,
        type: "pack_open",
        progress: 0,
        goal: 100,
      },
      {
        id: "arena_1_relic",
        title: "🔮 Forge Your First Relic",
        reward: 200,
        type: "relic_mint",
        progress: 0,
        goal: 1,
      },
      {
        id: "arena_farcaster",
        title: "💬 Cast to Farcaster 10 times",
        reward: 100,
        type: "social_cast",
        progress: 0,
        goal: 10,
      },
    ];

    meshCore.pushEvent("🏁 Arena Bounties Loaded");
  },

  //——— REGISTER PLAYER ACTION ——//
  registerAction(type) {
    for (const bounty of this.state.bounties) {
      if (bounty.type === type && bounty.progress < bounty.goal) {
        bounty.progress++;
        if (bounty.progress >= bounty.goal) {
          this.completeBounty(bounty);
        }
      }
    }
  },

  //——— BOUNTY COMPLETE ——//
  completeBounty(bounty) {
    meshCore.pushEvent(`🏆 ${bounty.title} completed!`);
    meshCore.gainXP(bounty.reward, bounty.title);
    meshCore.pushEvent(`💰 +${bounty.reward} XP reward claimed.`);

    // Pulse effect
    if (window.spawnMeshPulse) window.spawnMeshPulse("#facc15");

    bounty.progress = bounty.goal;
  },

  //——— SIMULERA EVENT ——//
  simulate(type) {
    this.registerAction(type);
  },
};