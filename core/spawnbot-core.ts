// ======================================================
// 🤖 SPAWNBOT CORE v3.1 — Autonomous Integration Module
// ------------------------------------------------------
// Hanterar automatiska triggers (auto-open, auto-xp, auto-sync)
// och kommunicerar direkt med MeshCore + SDK (reveal widget).
// ------------------------------------------------------
// © SpawnEngine / MeshOS 2025
// ======================================================

import { meshCore } from "./MeshCore";

export class SpawnBotCore {
  private rules = {
    autoOpenPacks: true,
    autoStakeCoins: false,
    autoBridgeAssets: false,
  };

  constructor() {
    // Lyssna på “packReceived”-händelser från MeshCore
    meshCore.on("packReceived", (packData: any) => {
      if (this.rules.autoOpenPacks) {
        this.handleAutoOpen(packData);
      }
    });
  }

  // —— Hanterar auto-öppning —— //
  private handleAutoOpen(packData: any) {
    meshCore.pushEvent(`SpawnBot: Auto-opening ${packData.name}...`);

    if (window.SpawnEngine?.reveal) {
      window.SpawnEngine.reveal({
        title: packData.name || "SpawnBot Auto-Reveal",
        pool: packData.pool || [],
        autoOpen: true,
        onReveal: (result: any) => {
          const rarity = (result.rarity || "").toLowerCase();
          let xpGained = 10;

          switch (rarity) {
            case "fragment": xpGained = 25; break;
            case "shard": xpGained = 75; break;
            case "relic": xpGained = 200; break;
            case "sigil": xpGained = 400; break;
            case "core": xpGained = 800; break;
          }

          meshCore.gainXP(xpGained, `Opened ${result.name}`);
          meshCore.pushEvent(`🤖 Bot found: ${result.name} (${result.rarity})`);
          console.log("🎁 [SpawnBot] Reveal result:", result);
        },
      });
    } else {
      meshCore.pushEvent("⚠️ SpawnEngine SDK not loaded.");
    }
  }

  // —— Toggle automatiska regler —— //
  public toggleRule(rule: keyof typeof this.rules) {
    this.rules[rule] = !this.rules[rule];
    const state = this.rules[rule] ? "ON" : "OFF";
    meshCore.pushEvent(`SpawnBot toggled ${rule} → ${state}`);
  }

  // —— Hämtar alla aktiva regler —— //
  public getRules() {
    return this.rules;
  }
}

export const spawnBot = new SpawnBotCore();