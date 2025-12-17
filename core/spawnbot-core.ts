// SpawnBotCore.ts — Autonomous rules and triggers

import { meshCore } from "./mesh-core";

export class SpawnBotCore {
  private rules = {
    autoOpenPacks: true,
    autoStakeCoins: false,
    autoBridgeAssets: false,
  };

  toggleRule(rule: keyof typeof this.rules) {
    this.rules[rule] = !this.rules[rule];
    meshCore.pushEvent(`SpawnBot toggled ${rule} → ${this.rules[rule] ? "ON" : "OFF"}`);
  }

  getRules() {
    return this.rules;
  }
}

export const spawnBot = new SpawnBotCore();