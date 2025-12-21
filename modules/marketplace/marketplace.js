/* ============================================================
   SPAWNENGINE · XP Marketplace Module v3.1
   Handles XP-based trades, UI rendering, and event sync
   ============================================================ */

import { MeshCore } from "../../core/MeshCore.js";
import { MeshBridge } from "../../core/mesh-bridge.js";

/* —— Inject CSS automatically —— */
if (!document.querySelector('link[href="modules/marketplace/marketplace.css"]')) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "modules/marketplace/marketplace.css";
  document.head.appendChild(link);
}

/* —— Marketplace Logic —— */
const list = document.getElementById("marketItems");
if (!list) {
  console.warn("⚠️ Marketplace container not found (marketItems)");
}

const items = [
  { id: 1, name: "XP Boost Pack", cost: 50, reward: "+10 XP" },
  { id: 2, name: "Relic Synth Fuel", cost: 120, reward: "+1 Relic" },
  { id: 3, name: "Mesh Theme", cost: 30, reward: "New Skin" },
  { id: 4, name: "Quantum Key", cost: 300, reward: "Unlocks Arena Access" },
  { id: 5, name: "AI Pulse Charge", cost: 80, reward: "1x AI Boost Pulse" },
];

/* —— Render Items —— */
function renderMarket() {
  list.innerHTML = "";
  items.forEach((i) => {
    const div = document.createElement("div");
    div.className = "market-card";
    div.innerHTML = `
      <h3>${i.name}</h3>
      <p>Cost: <strong>${i.cost} XP</strong></p>
      <p>Reward: ${i.reward}</p>
      <button>Buy</button>
    `;

    div.querySelector("button").onclick = () => handlePurchase(i);
    list.appendChild(div);
  });
}

/* —— Handle Buy Logic —— */
function handlePurchase(item) {
  const userXp = MeshCore.state?.xp ?? 0;

  if (userXp >= item.cost) {
    MeshCore.state.xp -= item.cost;
    MeshBridge.event("MARKET", `Purchased ${item.name}`);
    showToast(`✅ Trade complete: ${item.reward}`);
  } else {
    showToast("❌ Not enough XP for this item");
  }
}

/* —— Toast UI —— */
function showToast(msg) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.style = `
    position: fixed;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    background: #4df2ff;
    color: #000;
    border-radius: 8px;
    padding: 8px 14px;
    font-weight: 600;
    font-family: system-ui, sans-serif;
    z-index: 9999;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

/* —— Init —— */
window.addEventListener("DOMContentLoaded", () => {
  renderMarket();
  console.log("🛒 XP Marketplace ready (v3.1)");
});