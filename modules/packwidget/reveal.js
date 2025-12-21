/* ============================================================
   SPAWNENGINE · PACK WIDGET v3.2
   Handles Pack Reveal, Inventory, and Relic Synthesis
   ============================================================ */

import { simulatePackOpen, getInventory, simulateSynthesis } from "../../api/pack-actions.js";

/* —— Inject CSS automatically —— */
if (!document.querySelector('link[href="modules/packwidget/reveal.css"]')) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "modules/packwidget/reveal.css";
  document.head.appendChild(link);
}

/* —— Elements —— */
const packCard = document.getElementById("packCard");
const openPackBtn = document.getElementById("openPackBtn");
const synthesizeBtn = document.getElementById("synthesizeBtn");
const invFragments = document.getElementById("invFragments");
const invShards = document.getElementById("invShards");
const invRelics = document.getElementById("invRelics");
const lootEvents = document.getElementById("lootEvents");

/* —— Render Inventory —— */
function renderInventory() {
  const inv = getInventory();
  invFragments.textContent = inv.fragments;
  invShards.textContent = inv.shards;
  invRelics.textContent = inv.relics;
}

/* —— Pack Opening —— */
openPackBtn?.addEventListener("click", () => {
  packCard.classList.add("opening");
  packCard.innerHTML = "<p>Opening...</p>";

  setTimeout(() => {
    const result = simulatePackOpen();
    packCard.classList.remove("opening");
    packCard.innerHTML = `<p>${result.events.join("<br>")}</p>`;
    renderInventory();
    logLoot(result.events);
    showToast("🎁 Pack opened successfully!");
  }, 1500);
});

/* —— Synthesis Action —— */
synthesizeBtn?.addEventListener("click", () => {
  const result = simulateSynthesis();
  renderInventory();
  logLoot([result.message]);
  showToast(result.message);
});

/* —— Loot Log —— */
function logLoot(events) {
  const newEntries = events.map((e) => `<li>${e}</li>`).join("");
  lootEvents.innerHTML = newEntries + lootEvents.innerHTML;
}

/* —— Toast System —— */
function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style = `
    position: fixed;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: #4df2ff;
    color: #000;
    padding: 8px 14px;
    border-radius: 8px;
    font-weight: 600;
    font-family: system-ui, sans-serif;
    z-index: 9999;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

/* —— Init —— */
window.addEventListener("DOMContentLoaded", renderInventory);