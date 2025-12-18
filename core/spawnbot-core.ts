// ======================================================
// 🤖 SPAWNBOT CORE v3.1 — Visual Reforge Edition
// ------------------------------------------------------
// Auto-trigger, reveal, XP & full MeshPulse-animation.
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

  // —— Auto-open-funktion —— //
  private handleAutoOpen(packData: any) {
    meshCore.pushEvent(`SpawnBot: Auto-opening ${packData.name}...`);

    if (window.SpawnEngine?.reveal) {
      window.SpawnEngine.reveal({
        title: packData.name || "SpawnBot Auto-Reveal",
        pool: packData.pool || [],
        autoOpen: true,
        onReveal: (result: any) => this.handleRevealResult(result),
      });
    } else {
      meshCore.pushEvent("⚠️ SpawnEngine SDK not loaded.");
    }
  }

  // —— Hantera resultatet av en reveal —— //
  private handleRevealResult(result: any) {
    const rarity = (result.rarity || "").toLowerCase();

    const rarityMap: Record<
      string,
      { xp: number; color: string; label: string }
    > = {
      fragment: { xp: 25, color: "#14b8a6", label: "Fragment" },
      shard: { xp: 75, color: "#6366f1", label: "Shard" },
      relic: { xp: 200, color: "#a855f7", label: "Relic" },
      sigil: { xp: 400, color: "#facc15", label: "Sigil" },
      core: { xp: 800, color: "#3cf6ff", label: "Core" },
    };

    const data = rarityMap[rarity] || rarityMap.fragment;

    // XP + feed
    meshCore.gainXP(data.xp, `Opened ${result.name}`);
    meshCore.pushEvent(`🤖 Bot found: ${result.name} (${data.label})`);

    // Visuell MeshPulse
    if (window.spawnMeshPulse) {
      window.spawnMeshPulse(data.color);
    }

    console.log(
      `%c[SpawnBot] Pulserade ${data.label} (+${data.xp} XP)`,
      `color:${data.color}`
    );
  }

  // —— Regler —— //
  public toggleRule(rule: keyof typeof this.rules) {
    this.rules[rule] = !this.rules[rule];
    const state = this.rules[rule] ? "ON" : "OFF";
    meshCore.pushEvent(`SpawnBot toggled ${rule} → ${state}`);
  }

  public getRules() {
    return this.rules;
  }
}

export const spawnBot = new SpawnBotCore();