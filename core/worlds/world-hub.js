/* ============================================================
   SPAWNVERSE · WorldHub v1.3
   Central Mesh UI Controller for Created Worlds
   ------------------------------------------------------------
   Integrates with WorldEngine, WorldMint, and MeshCore.
   Provides XP, HUD event logging, and live UI feedback.
   ============================================================ */

import { WorldEngine } from "./world-engine.js";
import { WorldMint } from "./world-mint.js";
import { MeshCore } from "../mesh-core.js";
import { SpawnChain } from "../spawnchain/spawn-chain.js";

export const WorldHub = {
  container: null,

  init(containerId = "worldHubView") {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn("⚠️ WorldHub container missing");
      return;
    }

    this.render();
    console.log("%c🌐 WorldHub initialized", "color:#8affb3");
  },

  render() {
    const worlds = WorldEngine.listWorlds();
    this.container.innerHTML = `
      <h2>🌐 SpawnVerse WorldHub</h2>
      <div class="worldhub-actions">
        <input id="worldNameInput" placeholder="Enter world name..." />
        <button id="createWorldBtn" class="btn-primary">Create World</button>
      </div>
      <div id="worldList" class="worldhub-list">
        ${
          worlds.length === 0
            ? "<p>No worlds yet. Create one!</p>"
            : worlds
                .map(
                  (w) => `
          <div class="worldhub-card">
            <h3>${w.name}</h3>
            <small>Owner: ${w.owner}</small><br/>
            <small>Modules: ${w.modules.length} · XP: ${w.xp}</small><br/>
            <button class="btn-outline" data-id="${w.id}">Mint</button>
          </div>`
                )
                .join("")
        }
      </div>
    `;

    this.bind();
  },

  bind() {
    const input = document.getElementById("worldNameInput");
    const createBtn = document.getElementById("createWorldBtn");
    const list = document.getElementById("worldList");

    // —— Create World —— //
    createBtn?.addEventListener("click", () => {
      const name = input.value.trim();
      if (!name) return this.toast("⚠️ Enter a name first");
      WorldEngine.createWorld(name, MeshCore.state?.user || "@spawnUser");
      MeshCore.pushEvent?.(`🌍 Created new world '${name}'`);
      input.value = "";
      this.render();
    });

    // —— Mint World —— //
    list?.querySelectorAll("button[data-id]")?.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        WorldMint.mintWorld(id);
        MeshCore.pushEvent?.(`🪙 Minted world ${id}`);
        this.render();
      });
    });
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
  window.WorldHub = WorldHub;
  console.log("%c🌐 WorldHub module loaded (v1.3)", "color:#4df2ff");
}
