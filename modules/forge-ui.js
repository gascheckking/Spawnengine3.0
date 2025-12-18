/* ============================================================
   SpawnEngine Forge UI v3.1
   Mesh Forge – item crafting & module synthesis system
   ============================================================ */

import { getInventory, simulateSynthesis } from "../api/pack-actions.js";

/* —— Elements —— */
const forgePanel = document.getElementById("forgePanel");
const synthBtn = document.getElementById("forgeSynthBtn");
const forgeLog = document.getElementById("forgeLog");
const invReadout = document.getElementById("forgeInventory");

/* —— Helpers —— */
function updateForgeInventory() {
  const inv = getInventory();
  if (invReadout) {
    invReadout.innerHTML = `
      🔹 Fragments: ${inv.fragments} <br>
      🔸 Shards: ${inv.shards} <br>
      🪄 Relics: ${inv.relics}
    `;
  }
}

function logForge(msg) {
  const el = document.createElement("div");
  el.className = "forge-msg";
  el.textContent = msg;
  forgeLog.appendChild(el);
  forgeLog.scrollTop = forgeLog.scrollHeight;
}

/* —— Core Action —— */
function handleSynthesis() {
  const result = simulateSynthesis();
  logForge(result.message);
  updateForgeInventory();
  showToast(result.success ? "Relic successfully forged!" : "Forge failed!");
}

/* —— Toast UI —— */
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
    box-shadow: 0 0 12px rgba(77,242,255,0.5);
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

/* —— Init —— */
window.addEventListener("DOMContentLoaded", () => {
  if (!forgePanel) return;
  updateForgeInventory();
  synthBtn.addEventListener("click", handleSynthesis);
  logForge("⚙️ Forge ready. Combine Fragments & Shards to mint Relics.");
});