/* ============================================================
   SPAWNVERSE · WorldHub UI v1.0
   Frontend controller for WorldEngine
   ============================================================ */

import { WorldEngine } from "../../core/worlds/world-engine.js";
import { WorldMint } from "../../core/worlds/world-mint.js";

const input = document.getElementById("worldNameInput");
const createBtn = document.getElementById("createWorldBtn");
const listEl = document.getElementById("worldList");

function renderWorlds() {
  const worlds = WorldEngine.listWorlds();
  listEl.innerHTML = worlds.map(w => `
    <div class="world-card">
      <h3>${w.name}</h3>
      <small>Owner: ${w.owner}</small><br/>
      <small>Modules: ${w.modules.length} · XP: ${w.xp}</small><br/>
      <button onclick="WorldMint.mintWorld('${w.id}')">Mint</button>
    </div>
  `).join("");
}

createBtn.addEventListener("click", () => {
  const name = input.value.trim();
  if (!name) return toast("Enter a name first!");
  WorldEngine.createWorld(name, "@spawnUser");
  input.value = "";
  renderWorlds();
  toast(`World '${name}' created!`);
});

window.addEventListener("DOMContentLoaded", renderWorlds);