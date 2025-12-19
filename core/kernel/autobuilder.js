/* ============================================================
   SPAWNENGINE · AutoBuilder v1.0
   Suggestive system that proposes new modules or updates
   ============================================================ */

import { MeshKernel } from "./mesh-kernel.js";

export const AutoBuilder = {
  proposals: [],

  init() {
    console.log("⚒️ AutoBuilder active");
    this.tick();
  },

  tick() {
    setInterval(() => this.analyze(), 15000);
  },

  analyze() {
    const activeCount = Object.keys(MeshKernel.state.modules).length;
    const idea = this.createIdea(activeCount);
    this.proposals.push(idea);
    console.log(`💡 [AutoBuilder] Proposed: ${idea.title}`);
  },

  createIdea(activeModules) {
    const baseIdeas = [
      { title: "Arena Evolution", desc: "Add ranking and XP rewards." },
      { title: "SupCast 2.0", desc: "Link feedback to onchain XP." },
      { title: "Forge Live", desc: "Let users build directly in the Mesh." },
      { title: "LootGrid", desc: "Grid system for relic collections." },
    ];
    const pick = baseIdeas[Math.floor(Math.random() * baseIdeas.length)];
    return {
      ...pick,
      id: Date.now(),
      modulesCount: activeModules,
      created: new Date().toLocaleString(),
    };
  },

  getProposals() {
    return this.proposals.slice(-5);
  },
};

