/* ============================================================
   SPAWNENGINE APP v3.5 — Dark Mythic Platform
   ============================================================ */

//——— IMPORTS ———//
import { MeshCore } from "./core/mesh-core.js";
import { MeshBridge } from "./core/mesh-bridge.js";
import { SpawnArena } from "./core/arena/spawn-arena.js";
import { ForgeAI } from "./core/forge-ai.js";
import { ForgeUI } from "./core/forge-ui.js";

//——— GLOBAL STATE ———//
let userProfile = {};
let eventCount = 0;
let xpCount = 0;
const currentTheme = localStorage.getItem("spawnTheme") || "darkmythic";

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("%c🪩 SpawnEngine v3.5 — Booting Mesh...", "color:#4df2ff");

    // 🧠 Mesh Core
    if (MeshCore?.init) await MeshCore.init();

    // 🌉 Mesh Bridge
    if (MeshBridge?.init) MeshBridge.init();

    // ⚙️ Forge
    setupForge();

    // 🧩 UI setup
    document.body.dataset.theme = currentTheme;
    setupNavigation();
    setupTicker();
    setupToast();

    // 🏠 Load main data
    await loadHome();
    await loadProfile();

    // 🎨 Mock marketplace + tracker + support
    loadMarketplace();
    setupTracker();
    setupSupport();
    setupBot();
    bindRevealDemo();
    setupPulseInteractions();

    // 🏁 Arena last
    SpawnArena.init();

    console.log("%c✅ Mesh Online · UI Ready", "color:#b9ff7a");
  } catch (err) {
    console.error("❌ SpawnEngine Init Failed:", err);
  }
});

/* ============================================================
   FORGE + AI
   ============================================================ */
function setupForge() {
  try {
    ForgeAI.init();
    setTimeout(() => {
      ForgeUI.init();
      ForgeAI.renderForgePanel("meshFeed");
    }, 3000);
    console.log("%c🧬 Forge Systems Online", "color:#b9ff7a");
  } catch (err) {
    console.error("Forge Init Error:", err);
  }
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function setupNavigation() {
  const buttons = document.querySelectorAll("#mainNav button");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const view = btn.dataset.view;
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      document.getElementById(view)?.classList.add("active");
      window.scrollTo(0, 0);
    });
  });
}

/* ============================================================
   TICKER
   ============================================================ */
function setupTicker() {
  const ticker = document.getElementById("meshTicker");
  if (!ticker) return;
  const items = [
    "💠 Mesh Online",
    "🧬 Forge Active",
    "⚙️ Kernel Synced",
    "🎨 AI Systems Running",
    "📡 Base + Zora Connected",
    "🏗️ Worlds Registry Indexed"
  ];
  ticker.innerHTML = items.map(i => `<span>${i}</span>`).join("");
}

/* ============================================================
   PROFILE + FEED
   ============================================================ */
async function loadProfile() {
  const mockProfile = {
    name: "Spawn Operator",
    walletAddress: "0xFAcE...C0DE",
    xpBalance: 4200,
    spnBalance: 3.14,
  };
  userProfile = mockProfile;
  document.getElementById("xpBalance")?.textContent = `XP: ${mockProfile.xpBalance}`;
  document.getElementById("spnBalance")?.textContent = `SPN: ${mockProfile.spnBalance}`;
}

async function loadHome() {
  const feed = document.getElementById("meshFeed");
  if (!feed) return;
  const items = [
    "🌀 Mesh Pulse detected on Base.",
    "🎨 Creator minted a new pack.",
    "📡 Operator deployed automation node.",
    "💠 Explorer claimed XP reward.",
  ];
  feed.innerHTML = items.map(i => `<div class='feed-item'>${i}</div>`).join("");
}

/* ============================================================
   MARKETPLACE MOCK
   ============================================================ */
function loadMarketplace() {
  const list = document.getElementById("marketList");
  if (!list) return;
  const data = [
    { name: "Genesis Pack", type: "Pack", seller: "@spawniz", price: "0.02 ETH" },
    { name: "Mesh Node", type: "Automation", seller: "@operator", price: "0.01 ETH" },
    { name: "Zora Relic", type: "Relic", seller: "@collector", price: "0.005 ETH" },
  ];
  list.innerHTML = data.map(
    d => `<div class='market-card'>
            <div class='market-card-top'>
              <div>
                <div class='market-card-title'>${d.name}</div>
                <div class='market-card-desc'>${d.type} · ${d.seller}</div>
              </div>
              <div class='market-card-icon'>💠</div>
            </div>
            <div class='market-card-meta'>
              <div class='market-card-price'>${d.price}</div>
              <button class='market-card-btn js-reveal-demo'>Reveal</button>
            </div>
          </div>`
  ).join("");
}

/* ============================================================
   TRACKER / SUPPORT / BOT
   ============================================================ */
function setupTracker() {
  const el = document.getElementById("trackerFeed");
  if (!el) return;
  el.innerHTML = `
    <div class='feed-item'>👣 Tracking wallet: ${userProfile.walletAddress}</div>
    <div class='feed-item'>📈 XP Event Registered</div>
    <div class='feed-item'>💸 Pack Purchase Detected (mock)</div>`;
}

function setupSupport() {
  const input = document.getElementById("supportInput");
  const submit = document.getElementById("submitSupport");
  const feed = document.getElementById("supportFeed");
  if (!input || !submit) return;
  submit.addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) return toast("Please enter a message");
    const item = document.createElement("div");
    item.className = "feed-item";
    item.textContent = `🎫 Ticket submitted: ${text}`;
    feed.prepend(item);
    input.value = "";
    toast("Ticket sent");
  });
}

function setupBot() {
  const list = document.getElementById("automationList");
  if (!list) return;
  list.innerHTML = `
    <div class="feed-item">🤖 Auto-claim XP — ON</div>
    <div class="feed-item">⚙️ Gas Watch: OK</div>
    <div class="feed-item">📡 Watching Creator: @spawniz</div>`;
}

/* ============================================================
   VISUALS — Pulse & Reveal
   ============================================================ */
function bindRevealDemo() {
  document.body.addEventListener("click", e => {
    if (e.target.classList.contains("js-reveal-demo")) {
      spawnPulse("✨ Pack reveal executed!", "#b9ff7a");
    }
  });
}

function spawnPulse(message, color = "#4df2ff") {
  const el = document.createElement("div");
  el.textContent = message;
  el.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: rgba(10,14,24,0.8);
    border: 1px solid ${color};
    color: ${color};
    padding: 10px 16px;
    border-radius: 10px;
    box-shadow: 0 0 15px ${color};
    font-size: 0.85rem;
    z-index: 9999;
    animation: fadeOut 2.5s forwards;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

/* ============================================================
   STATS + PULSE XP
   ============================================================ */
function setupPulseInteractions() {
  document.body.addEventListener("click", (e) => {
    if (e.target.id === "openPackBtn" || e.target.id === "synthBtn") {
      eventCount++;
      xpCount += 5;
      spawnPulse(`+5 XP (Total ${xpCount})`, "#4df2ff");
    }
  });
}

/* ============================================================
   TOAST
   ============================================================ */
function setupToast() {
  if (!document.getElementById("toast")) {
    const el = document.createElement("div");
    el.id = "toast";
    el.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(10,14,24,0.85);
      color: var(--accent);
      padding: 10px 18px;
      border-radius: 8px;
      border: 1px solid rgba(77,242,255,0.3);
      font-size: 0.9rem;
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 9999;
    `;
    document.body.appendChild(el);
  }
}

window.toast = (msg) => {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = 1;
  setTimeout(() => (el.style.opacity = 0), 1500);
};

/* ============================================================
   ANIMATIONS
   ============================================================ */
const style = document.createElement("style");
style.textContent = `
@keyframes fadeOut {
  0% { opacity: 1; transform: scale(1); }
  90% { opacity: 1; }
  100% { opacity: 0; transform: scale(1.05); }
}`;
document.head.appendChild(style);