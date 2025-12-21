/* ============================================================
   SPAWNENGINE · FORGE UI v3.2
   Mesh Forge — Item Crafting & Module Synthesis System
   ============================================================ */

import { getInventory, simulateSynthesis } from "../api/pack-actions.js";

/* —— Auto inject CSS (optional) —— */
if (!document.querySelector('link[href="modules/forge/forge-ui.css"]')) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "modules/forge/forge-ui.css";
  document.head.appendChild(link);
}

/* —— Elements —— */
const forgePanel = document.getElementById("forgePanel");
const synthBtn = document.getElementById("forgeSynthBtn");
const forgeLog = document.getElementById("forgeLog");
const invReadout = document.getElementById("forgeInventory");

/* —— Helpers —— */
function updateForgeInventory() {
  const inv = getInventory();
  if (!invReadout) return;
  invReadout.innerHTML = `
    🔹 Fragments: ${inv.fragments} <br>
    🔸 Shards: ${inv.shards} <br>
    🪄 Relics: ${inv.relics}
  `;
}

function logForge(msg) {
  if (!forgeLog) return;
  const el = document.createElement("div");
  el.className = "forge-msg";
  el.textContent = msg;
  forgeLog.appendChild(el);
  forgeLog.scrollTop = forgeLog.scrollHeight;
}

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

/* —— Core Forge Action —— */
function handleSynthesis() {
  const result = simulateSynthesis();
  logForge(result.message);
  updateForgeInventory();
  showToast(result.success ? "🪄 Relic successfully forged!" : "⚠️ Forge attempt failed.");
}

/* —— Init —— */
window.addEventListener("DOMContentLoaded", () => {
  if (!forgePanel) return console.warn("Forge panel missing — skipping init");
  updateForgeInventory();
  synthBtn?.addEventListener("click", handleSynthesis);
  logForge("⚙️ Forge ready. Combine Fragments & Shards to mint Relics.");
  console.log("✅ Forge UI loaded (v3.2)");
});