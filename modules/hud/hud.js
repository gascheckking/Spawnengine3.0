/* ============================================================
   SPAWNENGINE HUD v3.2 — Mesh UI Core
   ============================================================ */
import { getInventory, simulatePackOpen, simulateSynthesis } from "../../api/pack-actions.js";
import { createTicket, getTickets, renderSupCastList } from "../supcast/supcast.js";

/* — Global State — */
let balanceXp = 0;
let balanceSpn = 0.000;
let role = localStorage.getItem("spawnRole") || "Explorer";
let inventory = getInventory();

/* — DOM Ready — */
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("hudRole").textContent = role;
  updateInventory();
  bindNavigation();
  bindHUD();
  toast("HUD v3.2 loaded");
});

/* — NAVIGATION — */
function bindNavigation() {
  const buttons = document.querySelectorAll(".hud-nav button");
  buttons.forEach((btn) =>
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const view = btn.dataset.view;
      document.querySelectorAll(".hud-view").forEach((v) => v.classList.remove("active"));
      document.getElementById(view).classList.add("active");
    })
  );
}

/* — CORE EVENTS — */
function bindHUD() {
  const xpEl = document.getElementById("hudXp");
  const spnEl = document.getElementById("hudSpn");

  /* XP BOOST */
  document.getElementById("hudBoost").addEventListener("click", () => {
    balanceXp += 50;
    xpEl.textContent = `XP: ${balanceXp}`;
    toast("+50 XP claimed");
  });

  /* MESH SYNC */
  document.getElementById("hudRefresh").addEventListener("click", () => {
    const modules = Math.floor(Math.random() * 10) + 1;
    document.getElementById("hudModules").textContent = modules;
    toast(`Mesh synced (${modules} modules)`);
  });

  /* LOOT */
  document.getElementById("lootOpen").addEventListener("click", () => {
    const reward = simulatePackOpen();
    inventory = reward.inventory;
    updateInventory();
    toast("🎁 Pack opened!");
  });

  document.getElementById("lootSynth").addEventListener("click", () => {
    const res = simulateSynthesis();
    inventory = res.inventory;
    updateInventory();
    toast(res.message);
  });

  /* FORGE */
  document.getElementById("forgeStart").addEventListener("click", () => {
    const result = simulateSynthesis();
    document.getElementById("forgeResult").textContent = result.message;
    updateInventory();
    toast("Forge attempt executed");
  });

  /* SUPCAST */
  document.getElementById("supcastSend").addEventListener("click", () => {
    const text = document.getElementById("supcastInput").value.trim();
    if (!text) return toast("Enter message");
    createTicket(text, "General", "@spawniz");
    document.getElementById("supcastInput").value = "";
    renderSupCastList("supcastFeed");
    toast("🎫 Ticket submitted");
  });

  renderSupCastList("supcastFeed");

  /* SETTINGS */
  const themeSelect = document.getElementById("hudTheme");
  themeSelect.value = localStorage.getItem("spawnTheme") || "glassbase";
  themeSelect.addEventListener("change", (e) => {
    document.body.dataset.theme = e.target.value;
    localStorage.setItem("spawnTheme", e.target.value);
    toast(`Theme set to ${e.target.value}`);
  });

  /* TRACKER */
  const tf = document.getElementById("trackerFeed");
  tf.innerHTML = `
    <div>👣 Tracking: ${localStorage.getItem("wallet") || "0x...C0DE"}</div>
    <div>💸 XP claim event registered.</div>
    <div>📈 Loot data synced.</div>`;
}

/* — Inventory UI — */
function updateInventory() {
  document.getElementById("hudFrag").textContent = inventory.fragments;
  document.getElementById("hudShard").textContent = inventory.shards;
  document.getElementById("hudRelic").textContent = inventory.relics;
}

/* — Toast — */
function toast(msg) {
  const el = document.getElementById("hudToast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2000);
}