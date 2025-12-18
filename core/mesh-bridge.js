/* ====================================================
   SpawnEngine Mesh Bridge — Core → Visuals/UI
   ==================================================== */

import { MeshCore } from "./mesh-core.js";

const pulseColors = {
  "PACK_OPEN": "#14b8a6",
  "MARKET_BUY": "#6366f1",
  "XP_GAIN": "#ef4444",
  "SOCIAL_CAST": "#a855f7",
  "CREATOR_REWARD": "#facc15"
};

let totalEvents = 0;
let totalXP = 0;

export const MeshBridge = {
  init() {
    MeshCore.on("event", handleMeshEvent);
    console.log("%c[MeshBridge] Connected to MeshCore ✅", "color:#14b8a6");
  }
};

function handleMeshEvent(event) {
  totalEvents++;
  const { type, data } = event;
  const color = pulseColors[type] || "#3b82f6";

  // Trigger pulse animation (from mesh-bg.js)
  if (typeof window.spawnMeshPulse === "function") {
    spawnMeshPulse(color);
  }

  // Toast feedback
  const message = {
    "PACK_OPEN": `📦 Pack opened → ${data?.item || "Mystery"}`,
    "MARKET_BUY": `💸 Purchased: ${data?.asset || "Asset"}`,
    "XP_GAIN": `⭐ XP +${data?.amount || 10}`,
    "SOCIAL_CAST": `💬 Cast sent to Farcaster`,
    "CREATOR_REWARD": `💎 Creator reward +${data?.amount || 5}`
  }[type] || `⚙️ Event: ${type}`;

  if (window.toast) window.toast(message);

  // Update XP
  if (type === "XP_GAIN") {
    totalXP += data?.amount || 10;
    const xpEl = document.getElementById("xpBalance");
    if (xpEl) xpEl.innerText = `XP: ${totalXP}`;
  }

  // Update feed UI
  const feedEl = document.getElementById("meshFeed");
  if (feedEl) {
    const div = document.createElement("div");
    div.className = "feed-item";
    div.innerHTML = `<span class="accent">[${type}]</span> ${message}`;
    feedEl.prepend(div);
  }
}