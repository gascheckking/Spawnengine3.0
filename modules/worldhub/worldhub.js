/* ============================================================
   SPAWNVERSE · WorldHub Controller v1.2
   Integrated with HUD + MeshCore
   ============================================================ */

import { MeshCore } from "../../core/MeshCore.js";
import { WorldEngine } from "../../core/worlds/world-engine.js";
import { WorldMint } from "../../core/worlds/world-mint.js";

/* — Auto inject CSS if missing — */
if (!document.querySelector('link[href="modules/worldhub/worldhub.css"]')) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "modules/worldhub/worldhub.css";
  document.head.appendChild(link);
}

/* — Elements — */
const input = document.getElementById("worldNameInput");
const createBtn = document.getElementById("createWorldBtn");
const listEl = document.getElementById("worldList");

/* — Render all Worlds — */
function renderWorlds() {
  const worlds = WorldEngine.listWorlds?.() || [];
  if (!worlds.length) {
    listEl.innerHTML = `<p style="opacity:0.6;">No worlds created yet. Start your first mesh!</p>`;
    return;
  }

  listEl.innerHTML = worlds
    .map(
      (w) => `
    <div class="world-card">
      <h3>${w.name}</h3>
      <small>Owner: ${w.owner}</small><br/>
      <small>Modules: ${w.modules?.length ?? 0} · XP: ${w.xp ?? 0}</small><br/>
      <button data-id="${w.id}" class="mintBtn">Mint</button>
    </div>
  `
    )
    .join("");

  document.querySelectorAll(".mintBtn").forEach((btn) =>
    btn.addEventListener("click", () => {
      WorldMint.mintWorld(btn.dataset.id);
      MeshCore.addXP?.(25);
      toast(`🪙 World minted! +25 XP`);
    })
  );
}

/* — Create new world — */
createBtn.addEventListener("click", () => {
  const name = input.value.trim();
  if (!name) return toast("Enter a name first!");
  WorldEngine.createWorld(name, MeshCore.state?.user || "@spawnUser");
  input.value = "";
  renderWorlds();
  toast(`🌍 World '${name}' created!`);
});

/* — Toast helper — */
function toast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

/* — Init — */
window.addEventListener("DOMContentLoaded", () => {
  renderWorlds();
  console.log("🌐 WorldHub module initialized (HUD integrated v1.2)");
});