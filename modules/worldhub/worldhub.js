/* ============================================================
   SPAWNVERSE · WorldHub UI v1.1
   Frontend controller for WorldEngine
   ============================================================ */

import { WorldEngine } from "../../core/worlds/world-engine.js";
import { WorldMint } from "../../core/worlds/world-mint.js";

/* — Auto inject CSS if missing (safety) — */
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

/* — Render worlds — */
function renderWorlds() {
  const worlds = WorldEngine.listWorlds();
  if (!worlds.length) {
    listEl.innerHTML = `<p style="opacity:0.7">No worlds created yet.</p>`;
    return;
  }
  listEl.innerHTML = worlds.map(
    (w) => `
    <div class="world-card">
      <h3>${w.name}</h3>
      <small>Owner: ${w.owner}</small><br/>
      <small>Modules: ${w.modules.length} · XP: ${w.xp}</small><br/>
      <button data-id="${w.id}" class="mintBtn">Mint</button>
    </div>
  `
  ).join("");

  document.querySelectorAll(".mintBtn").forEach((btn) =>
    btn.addEventListener("click", () => {
      WorldMint.mintWorld(btn.dataset.id);
      toast(`🪙 World minted onchain`);
    })
  );
}

/* — Create new world — */
createBtn.addEventListener("click", () => {
  const name = input.value.trim();
  if (!name) return toast("Enter a name first!");
  WorldEngine.createWorld(name, "@spawnUser");
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
  console.log("🌐 WorldHub UI initialized (v1.1)");
});