/* ====================================================
   SpawnEngine Mesh Bridge — Connects MeshCore → Visuals
   ==================================================== */

import { MeshCore } from "./mesh-core.js";

// Mappning av olika eventtyper → färg/funktion
const meshPulseColors = {
  "PACK_OPEN": "#14b8a6",     // teal
  "MARKET_BUY": "#6366f1",    // indigo
  "XP_GAIN": "#ef4444",       // red
  "SOCIAL_CAST": "#a855f7",   // purple
  "CREATOR_REWARD": "#facc15" // yellow
};

// Spara statistik lokalt i sessionen
let totalEvents = 0;
let totalXP = 0;

// Initiera bron
export const MeshBridge = {
  init() {
    // Lyssna på MeshCore-events
    MeshCore.on("event", handleMeshEvent);
    console.log("%c[MeshBridge] Connected → MeshCore", "color:#14b8a6");
  }
};

function handleMeshEvent(event) {
  totalEvents++;

  const { type, data } = event;
  const color = meshPulseColors[type] || "#3b82f6";

  // Pulse-effekt i bakgrundsmeshen
  if (typeof spawnMeshPulse === "function") {
    spawnMeshPulse(color);
  }

  // UI-feedback
  const toastMsg = {
    "PACK_OPEN": `📦 Pack opened → ${data?.item || "Unknown"}`,
    "MARKET_BUY": `💸 Market purchase: ${data?.asset || "item"}`,
    "XP_GAIN": `⭐ XP +${data?.amount || 10}`,
    "SOCIAL_CAST": `💬 New cast sent!`,
    "CREATOR_REWARD": `💎 Creator Reward claimed!`
  }[type] || `⚙️ Event: ${type}`;

  if (window.toast) window.toast(toastMsg);

  // XP-räknare
  if (type === "XP_GAIN") {
    totalXP += data?.amount || 10;
    const xpEl = document.getElementById("xpBalance");
    if (xpEl) xpEl.innerText = `XP: ${totalXP}`;
  }

  // Lägg till i MeshFeed om aktiv
  const feedEl = document.getElementById("meshFeed");
  if (feedEl) {
    const div = document.createElement("div");
    div.className = "feed-item";
    div.innerHTML = `<span class="accent">[${type}]</span> ${toastMsg}`;
    feedEl.prepend(div);
  }
}