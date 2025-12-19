/* ============================================================
   SPAWNVERSE · WorldHub v1.0
   Central management hub for created worlds
   ============================================================ */

import { WorldEngine } from "./world-engine.js";
import { WorldMint } from "./world-mint.js";
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
    console.log("🌐 WorldHub initialized");
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
        ${worlds.length === 0
          ? "<p>No worlds yet. Create one!</p>"
          : worlds
              .map(
                (w) => `
            <div class="worldhub-card">
              <h3>${w.name}</h3>
              <small>Owner: ${w.owner}</small><br/>
              <small>Modules: ${w.modules.length} · XP: ${w.xp}</small><br/>
              <button class="btn-outline" data-id="${w.id}">Mint</button>
            </div>
          `
              )
              .join("")}
      </div>
    `;

    this.bind();
  },

  bind() {
    const createBtn = document.getElementById("createWorldBtn");
    const input = document.getElementById("worldNameInput");
    const list = document.getElementById("worldList");

    if (createBtn && input) {
      createBtn.addEventListener("click", () => {
        const name = input.value.trim();
        if (!name) return alert("Please enter a world name!");
        WorldEngine.createWorld(name, "@spawnUser");
        SpawnChain.register({
          id: Date.now(),
          name,
          code: "WorldCreationEvent",
        });
        input.value = "";
        this.render();
      });
    }

    if (list) {
      list.querySelectorAll("button[data-id]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.target.dataset.id;
          WorldMint.mintWorld(id);
          SpawnChain.register({
            id,
            name: "MintWorld",
            code: "WorldMintEvent",
          });
          this.render();
        });
      });
    }
  },
};

window.WorldHub = WorldHub;