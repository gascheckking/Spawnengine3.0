/* ============================================================
   SPAWNENGINE · Forge AI v1.0
   Mesh-integrated builder intelligence layer
   ============================================================ */

import { MeshKernel } from "../kernel/mesh-kernel.js";
import { AutoBuilder } from "../kernel/autobuilder.js";

export const ForgeAI = {
  state: {
    ideasAnalyzed: 0,
    buildsSuggested: 0,
    generatedModules: [],
    lastRun: null,
  },

  init() {
    console.log("🧬 ForgeAI initialized and listening for MeshKernel insights");
    this.startListening();
  },

  startListening() {
    // Kör automatiska analyser var 20:e sekund
    setInterval(() => {
      const ideas = AutoBuilder.getProposals();
      if (ideas.length > 0) this.analyze(ideas);
    }, 20000);
  },

  analyze(ideas) {
    this.state.ideasAnalyzed += ideas.length;
    const chosen = ideas[Math.floor(Math.random() * ideas.length)];
    const module = this.generateModuleSuggestion(chosen);
    this.state.generatedModules.push(module);
    this.state.buildsSuggested++;
    this.state.lastRun = new Date().toLocaleString();

    console.log(`🧱 [ForgeAI] New module blueprint: ${module.name}`);
  },

  generateModuleSuggestion(baseIdea) {
    const slug = baseIdea.title.toLowerCase().replace(/\s+/g, "-");
    const id = Date.now();
    const template = `
/* ============================================================
   ${baseIdea.title} Module (auto-suggested by ForgeAI)
   Generated: ${new Date().toLocaleString()}
   ============================================================ */

export const ${slug.replace(/-/g, "_")}_module = {
  name: "${baseIdea.title}",
  description: "${baseIdea.desc}",
  version: "1.0",
  active: true,
  init() {
    console.log("🚀 ${baseIdea.title} module initialized");
  }
};
`;
    return { id, name: baseIdea.title, code: template, created: new Date().toLocaleString() };
  },

  getBuildLog() {
    return this.state.generatedModules.slice(-5);
  },

  renderForgePanel(containerId = "meshFeed") {
    const el = document.getElementById(containerId);
    if (!el) return;
    const builds = this.getBuildLog();

    el.innerHTML += `
      <div class="feed-item">🧬 Forge AI Builds:</div>
      ${builds.map(b => `<div class="feed-sub">• ${b.name} [${b.created}]</div>`).join("")}
    `;
  },
};

// ✦ Gör ForgeAI tillgänglig globalt för UI och MeshBridge
window.ForgeAI = ForgeAI;
