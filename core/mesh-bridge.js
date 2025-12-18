/* ====================================================
   SPAWNENGINE MESH BRIDGE v3.1 — Reforge Build
   ----------------------------------------------------
   Kopplar MeshCore → UI + Mesh Visuals
   Lyssnar på realtids-event, uppdaterar XP, feed och
   triggar mesh-pulsar på bakgrunden.
   ----------------------------------------------------
   © SpawnEngine / MeshOS 2025
   ==================================================== */

import { MeshCore } from "./mesh-core.js";

export const MeshBridge = (() => {
  const pulseColors = {
    SYSTEM: "#3cf6ff",
    XP_GAIN: "#14b8a6",
    MARKET_BUY: "#6366f1",
    SOCIAL_CAST: "#a855f7",
    CREATOR_REWARD: "#facc15",
    GENERIC: "#38bdf8"
  };

  let totalEvents = 0;
  let totalXP = 0;
  let initialized = false;

  //——— INIT ——//
  function init() {
    if (initialized) return;
    initialized = true;

    console.log("%c[MeshBridge] Online — listening for MeshCore events", "color:#14b8a6");

    // När MeshCore är redo
    MeshCore.on("mesh_ready", (state) => {
      updateProfileUI(state.profile);
      console.log("%c[MeshBridge] MeshCore Ready", "color:#22c55e");
    });

    // När MeshCore skickar events
    MeshCore.on("event", handleMeshEvent);
    MeshCore.on("mesh_event", handleMeshFeed);

    // Lyssna på profiluppdateringar
    MeshCore.on("profile_update", (p) => updateProfileUI(p));

    // Lyssna på walletstatus
    MeshCore.on("wallet_status", (status) => {
      toast(status ? "🔗 Wallet connected" : "🔴 Wallet disconnected");
    });
  }

  //——— HANDLE CORE EVENTS ——//
  function handleMeshEvent(event) {
    totalEvents++;
    const { type, data, xp } = event;
    const color = pulseColors[type] || pulseColors.GENERIC;

    // Pulse animation
    if (typeof window.spawnMeshPulse === "function") {
      spawnMeshPulse(color);
    }

    // XP update
    if (type === "XP_GAIN") {
      totalXP += xp || 10;
      const xpEl = document.getElementById("xpBalance");
      if (xpEl) xpEl.innerText = `XP: ${totalXP}`;
    }

    // Toast feedback
    const msg = buildEventMessage(type, data, xp);
    toast(msg);

    // Update feed
    const feedEl = document.getElementById("meshFeed");
    if (feedEl) {
      const div = document.createElement("div");
      div.className = "feed-item";
      div.innerHTML = `<span class="accent">[${type}]</span> ${msg}`;
      feedEl.prepend(div);
    }
  }

  //——— HANDLE FEED FROM MESHCORE ——//
  function handleMeshFeed(entry) {
    const feedEl = document.getElementById("meshFeed");
    if (!feedEl) return;
    const div = document.createElement("div");
    div.className = "feed-item";
    div.innerHTML = `<span class="accent">#${entry.id}</span> ${entry.label}`;
    feedEl.prepend(div);
  }

  //——— UPDATE PROFILE UI ——//
  function updateProfileUI(profile) {
    if (!profile) return;
    const xpEl = document.getElementById("xpBalance");
    const spnEl = document.getElementById("spnBalance");
    if (xpEl) xpEl.innerText = `XP: ${profile.xpBalance}`;
    if (spnEl) spnEl.innerText = `SPN: ${profile.spnBalance}`;
  }

  //——— BUILD EVENT MESSAGE ——//
  function buildEventMessage(type, data, xp) {
    switch (type) {
      case "XP_GAIN":
        return `⭐ XP +${xp || 10}`;
      case "MARKET_BUY":
        return `💸 Purchased ${data?.asset || "item"}`;
      case "SOCIAL_CAST":
        return `💬 Cast sent to Farcaster`;
      case "CREATOR_REWARD":
        return `💎 Creator reward +${data?.amount || 5}`;
      case "SYSTEM":
        return `🧠 System event triggered`;
      default:
        return `⚙️ ${type}`;
    }
  }

  return { init };
})();