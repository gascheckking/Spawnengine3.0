/* ============================================================
   SPAWNENGINE · Forge UI v1.0
   Interface layer for ForgeAI builds and Mesh interaction
   ============================================================ */

import { ForgeAI } from "./forge-ai.js";

export const ForgeUI = {
  init() {
    console.log("🪄 ForgeUI active");
    this.renderPanel();
  },

  renderPanel() {
    const container = document.getElementById("forgePanel");
    if (!container) return;

    const builds = ForgeAI.getBuildLog();

    container.innerHTML = `
      <h3>Forge AI Build Log</h3>
      <div class="forge-list">
        ${
          builds.length === 0
            ? "<p>No builds yet...</p>"
            : builds
                .map(
                  (b) => `
          <div class="forge-card">
            <h4>${b.name}</h4>
            <pre>${b.code.slice(0, 120)}...</pre>
            <button class="btn-outline" onclick="ForgeUI.preview('${b.id}')">Preview</button>
          </div>`
                )
                .join("")
        }
      </div>`;
  },

  preview(id) {
    const build = ForgeAI.state.generatedModules.find((m) => m.id == id);
    if (!build) return alert("Build not found");
    alert(`Previewing ${build.name}\n\n${build.code}`);
  },
};

// ✦ Exponera globalt för MeshBridge, SupCast etc.
window.ForgeUI = ForgeUI;
