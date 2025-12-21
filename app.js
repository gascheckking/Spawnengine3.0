/* ============================================================
   SPAWNENGINE APP v3.3 — Mesh Universe Core
   ============================================================ */

//——— IMPORTER ———//
import { MeshCore } from "./core/mesh-core.js";
import { MeshBridge } from "./core/mesh-bridge.js";
import { SpawnArena } from "./core/arena/spawn-arena.js";
import { ForgeAI } from "./core/forge-ai.js";
import { ForgeUI } from "./core/forge-ui.js";

//——— GLOBAL STATE ———//
let userProfile = {};
let eventCount = 0;
let xpCount = 0;
let forgeActive = false;
const currentTheme = localStorage.getItem("spawnTheme") || "glassbase";

//——— INIT ———//
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("%c🚀 SpawnEngine MeshCore Booting...", "color:#3cf6ff");

    // 🧠 Initiera MeshCore (state, feed, XP)
    if (MeshCore?.init) await MeshCore.init();

    // 🌉 Starta MeshBridge (kopplar Core → UI → Pulse)
    if (MeshBridge?.init) MeshBridge.init();

    // ⚙️ Starta Forge + AI-panel
    setupForgeSystems();

    // 🎨 UI / Tema
    document.body.dataset.theme = currentTheme;
    setupNavigation();
    setupThemeSwitcher();
    setupToast();
    setupSettings();

    // 🏠 Ladda vyer
    await loadHome();
    await loadProfile();
    await loadMarketplace();

    // ⚙️ Extra systemer
    setupLoot();
    setupSupport();
    setupTracker();
    setupBot();
    bindRevealDemo();
    setupPulseInteractions();

    // 💾 Visa roll från localStorage
    const savedRole = localStorage.getItem("spawnRole");
    if (savedRole) {
      console.log(`🧩 Active Role: ${savedRole}`);
      toast(`Role active: ${savedRole.toUpperCase()}`);
    }

    // 🏁 Starta Arena sist (kopplad till MeshCore)
    SpawnArena.init();

    console.log("%c✅ UI Ready · Mesh Online", "color:#3cf6ff");
  } catch (err) {
    console.error("❌ SpawnEngine init failed:", err);
  }
});

/* ============================================================
   FORGE + AI SYSTEM
   ============================================================ */
function setupForgeSystems() {
  try {
    // 🧬 Forge AI init
    ForgeAI.init();

    // 🪄 ForgeUI laddas efter 5s delay
    setTimeout(() => {
      ForgeUI.init();
      ForgeAI.renderForgePanel("meshFeed");
    }, 5000);

    // 🔮 Skapa AI-overlay för pulse feedback
    createForgeOverlay();

    console.log("%c🧬 Forge + AI systems online", "color:#b9ff7a");
  } catch (err) {
    console.error("Forge init error:", err);
  }
}

/* — Forge Overlay (visar XP + AI action pulses) — */
function createForgeOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "forgeOverlay";
  overlay.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--bg-glass);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 16px;
    color: var(--text);
    font-size: 0.85rem;
    box-shadow: var(--glow);
    backdrop-filter: blur(12px);
    z-index: 9999;
    display: none;
  `;
  document.body.appendChild(overlay);
}

/* — AI-triggered pulse — */
window.spawnForgePulse = (message, color = "#3cf6ff") => {
  const overlay = document.getElementById("forgeOverlay");
  if (!overlay) return;
  overlay.style.display = "block";
  overlay.style.borderColor = color;
  overlay.textContent = `✨ ${message}`;
  overlay.style.boxShadow = `0 0 15px ${color}`;
  setTimeout(() => (overlay.style.display = "none"), 2500);
};

/* ============================================================
   NAVIGATION & UI
   ============================================================ */
function setupNavigation() {
  const buttons = document.querySelectorAll(".nav-btn");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.view;
      document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
      document.getElementById(target)?.classList.add("active");
      window.scrollTo(0, 0);
    });
  });
}

//——— THEME ———//
function setupThemeSwitcher() {
  const select = document.getElementById("themeSelect");
  if (!select) return;
  select.value = currentTheme;
  select.addEventListener("change", (e) => {
    const theme = e.target.value;
    document.body.dataset.theme = theme;
    localStorage.setItem("spawnTheme", theme);
    toast(`Theme set to: ${theme}`);
  });
}

//——— SETTINGS ———//
function setupSettings() {
  const toggle = document.getElementById("pwaToggle");
  if (!toggle) return;
  toggle.addEventListener("change", (e) => {
    toast(e.target.checked ? "Offline mode enabled" : "Online mode active");
  });
}

/* ============================================================
   PROFILE + HOME + MARKET
   ============================================================ */
async function loadProfile() {
  try {
    const mockProfile = {
      name: "Spawn Operator",
      walletAddress: "0xFAcE...C0DE",
      xpBalance: 4200,
      spnBalance: 3.14,
    };
    userProfile = mockProfile;
    document.getElementById("xpBalance").textContent = `XP: ${mockProfile.xpBalance}`;
    document.getElementById("spnBalance").textContent = `SPN: ${mockProfile.spnBalance}`;
  } catch (err) {
    console.error("Profile load error:", err);
  }
}

async function loadHome() {
  try {
    const mockFeed = [
      "🌀 Mesh Pulse detected on Base.",
      "🎨 Creator minted a new pack.",
      "📡 Operator deployed automation node.",
      "💠 Explorer claimed XP reward.",
    ];
    const el = document.getElementById("meshFeed");
    if (!el) return;
    el.innerHTML = "";
    mockFeed.forEach((item) => {
      const div = document.createElement("div");
      div.className = "feed-item";
      div.textContent = item;
      el.appendChild(div);
    });
  } catch (err) {
    console.error("Feed load error:", err);
  }
}

async function loadMarketplace() {
  try {
    const mockListings = [
      { id: 1, name: "Genesis Pack", type: "Pack", seller: "@spawniz", price: "0.02", currency: "ETH" },
      { id: 2, name: "Mesh Node", type: "Automation", seller: "@operator", price: "0.01", currency: "ETH" },
      { id: 3, name: "Zora Relic", type: "Relic", seller: "@collector", price: "0.005", currency: "ETH" },
    ];

    const list = document.getElementById("marketList");
    if (!list) return;
    list.innerHTML = "";
    mockListings.forEach((item) => {
      const card = document.createElement("div");
      card.className = "market-card";
      card.innerHTML = `
        <div class="market-card-top">
          <div>
            <div class="market-card-title">${item.name}</div>
            <div class="market-card-desc">${item.type} · Seller: ${item.seller}</div>
          </div>
          <div class="market-card-icon">💠</div>
        </div>
        <div class="market-card-meta">
          <div class="market-card-price">${item.price} ${item.currency}</div>
          <button class="market-card-btn" data-id="${item.id}">Buy</button>
          <button class="market-card-btn js-reveal-demo">Reveal</button>
        </div>`;
      list.appendChild(card);
    });

    list.addEventListener("click", (e) => {
      if (e.target.classList.contains("market-card-btn") && e.target.dataset.id) {
        const id = parseInt(e.target.dataset.id);
        toast(`💸 Purchased item #${id}`);
      }
    });
  } catch (err) {
    console.error("Marketplace load error:", err);
  }
}

/* ============================================================
   MODULES — Loot, Support, Tracker, Bot
   ============================================================ */
function setupLoot() {
  const openBtn = document.getElementById("openPackBtn");
  const synthBtn = document.getElementById("synthBtn");

  const inventory = { fragments: 3, shards: 1, relics: 0 };
  updateInventory(inventory);

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      toast("🎁 Pack opened! You gained 1 Shard.");
      spawnForgePulse("Pack opened", "#14b8a6");
      inventory.shards++;
      updateInventory(inventory);
    });
  }

  if (synthBtn) {
    synthBtn.addEventListener("click", () => {
      toast("⚗️ Relic synthesized!");
      spawnForgePulse("Relic forged", "#ffefba");
      inventory.relics++;
      updateInventory(inventory);
    });
  }
}

function updateInventory(inv) {
  document.getElementById("fragCount")?.textContent = inv.fragments;
  document.getElementById("shardCount")?.textContent = inv.shards;
  document.getElementById("relicCount")?.textContent = inv.relics;
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
    toast("Ticket submitted");
  });
}

function setupTracker() {
  const feed = document.getElementById("trackerFeed");
  if (!feed) return;
  feed.innerHTML = `
    <div class="feed-item">👣 Tracking wallet: ${userProfile?.walletAddress || "0x...C0DE"}</div>
    <div class="feed-item">💸 Last pack purchase detected (mock).</div>
    <div class="feed-item">📈 XP event registered.</div>
  `;
}

function setupBot() {
  const list = document.getElementById("automationList");
  if (!list) return;
  list.innerHTML = `
    <div class="feed-item">🤖 Auto-claim streak XP — ON</div>
    <div class="feed-item">⚙️ Gas Alert &lt; 0.05 Gwei</div>
    <div class="feed-item">📡 Watch Creator: @spawniz</div>
  `;
}

/* ============================================================
   VISUALS — Pulse & Reveal
   ============================================================ */
function bindRevealDemo() {
  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("js-reveal-demo")) {
      toast("✨ Pack reveal triggered!");
      spawnForgePulse("Reveal demo executed", "#b9ff7a");
    }
  });
}

function setupPulseInteractions() {
  const updateStats = () => {
    const eEl = document.getElementById("eventCount");
    const xEl = document.getElementById("xpCount");
    if (eEl) eEl.innerText = eventCount;
    if (xEl) xEl.innerText = xpCount;
  };

  document.body.addEventListener("click", (e) => {
    if (e.target.id === "openPackBtn" || e.target.id === "synthBtn") {
      eventCount++;
      xpCount += 5;
      updateStats();
      spawnForgePulse("XP +5", "#4df2ff");
    }
  });
}

/* ============================================================
   TOAST — Reusable notifications
   ============================================================ */
function setupToast() {
  if (!document.getElementById("toast")) {
    const el = document.createElement("div");
    el.id = "toast";
    document.body.appendChild(el);
  }
}
window.toast = (msg) => {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1500);
};