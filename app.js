/* ====================================================
   SPAWNENGINE v3.1 — Reforge App Core (JS Engine)
   ==================================================== */

//——— IMPORTER ———//
import { MeshCore } from "./core/mesh-core.js";
import { MeshBridge } from "./core/mesh-bridge.js";

//——— GLOBAL STATE ———//
let currentTheme = localStorage.getItem("spawnTheme") || "glassbase";
let userProfile = null;
let marketplace = [];
let feed = [];
let eventCount = 0;
let xpCount = 0;

//——— INIT ———//
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // — MeshCore & Bridge Boot —
    if (MeshCore && MeshCore.init) await MeshCore.init();
    if (MeshBridge && MeshBridge.init) MeshBridge.init();

    console.log("%cSpawnEngine MeshCore online:", "color:#14b8a6", MeshCore?.getProfile?.());

    // — UI INIT SEQUENCE —
    document.body.dataset.theme = currentTheme;
    setupNavigation();
    setupThemeSwitcher();
    setupToast();
    setupSettings();
    await loadHome();
    await loadProfile();
    await loadMarketplace();
    setupLoot();
    setupSupport();
    setupTracker();
    setupBot();
    bindRevealDemo();
    setupPulseInteractions();

    // — Display role from localStorage —
    const role = localStorage.getItem("spawnRole");
    if (role) {
      console.log(`🧩 Active Role: ${role}`);
      toast(`Role active: ${role.toUpperCase()}`);
    }
  } catch (err) {
    console.error("⚠️ SpawnEngine boot error:", err);
  }
});

//——— NAVIGATION ———//
function setupNavigation() {
  const buttons = document.querySelectorAll(".nav-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.view;
      document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
      document.getElementById(target).classList.add("active");
      window.scrollTo(0, 0);
    });
  });
}

//——— TOAST ———//
window.toast = (msg) => {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1500);
};

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

//——— PROFILE ———//
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

//——— HOME FEED ———//
async function loadHome() {
  try {
    const mockFeed = [
      "🌀 Mesh Pulse detected on Base.",
      "🎨 Creator minted a new pack.",
      "📡 Operator deployed automation node.",
      "💠 Explorer claimed XP reward.",
    ];
    const el = document.getElementById("meshFeed");
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

//——— MARKETPLACE ———//
async function loadMarketplace() {
  try {
    const mockListings = [
      { id: 1, name: "Genesis Pack", type: "Pack", seller: "@spawniz", price: "0.02", currency: "ETH" },
      { id: 2, name: "Mesh Node", type: "Automation", seller: "@operator", price: "0.01", currency: "ETH" },
      { id: 3, name: "Zora Relic", type: "Relic", seller: "@collector", price: "0.005", currency: "ETH" },
    ];

    const list = document.getElementById("marketList");
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

//——— LOOT ———//
function setupLoot() {
  const openBtn = document.getElementById("openPackBtn");
  const synthBtn = document.getElementById("synthBtn");

  const inventory = { fragments: 3, shards: 1, relics: 0 };
  updateInventory(inventory);

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      toast("🎁 Pack opened! You gained 1 Shard.");
      spawnMeshPulse("#14b8a6");
      inventory.shards++;
      updateInventory(inventory);
    });
  }

  if (synthBtn) {
    synthBtn.addEventListener("click", () => {
      toast("⚗️ Relic synthesized!");
      spawnMeshPulse("#6366f1");
      inventory.relics++;
      updateInventory(inventory);
    });
  }
}

function updateInventory(inv) {
  document.getElementById("fragCount").textContent = inv.fragments;
  document.getElementById("shardCount").textContent = inv.shards;
  document.getElementById("relicCount").textContent = inv.relics;
}

//——— SUPPORT (SupCast) ———//
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

//——— TRACKER ———//
function setupTracker() {
  const feed = document.getElementById("trackerFeed");
  if (!feed) return;
  feed.innerHTML = `
    <div class="feed-item">👣 Tracking wallet: ${userProfile?.walletAddress || "0x...C0DE"}</div>
    <div class="feed-item">💸 Last pack purchase detected (mock).</div>
    <div class="feed-item">📈 XP event registered.</div>
  `;
}

//——— SPAWNBOT ———//
function setupBot() {
  const list = document.getElementById("automationList");
  if (!list) return;
  list.innerHTML = `
    <div class="feed-item">🤖 Auto-claim streak XP — ON</div>
    <div class="feed-item">⚙️ Gas Alert < 0.05 Gwei</div>
    <div class="feed-item">📡 Watch Creator: @spawniz</div>
  `;
}

//——— REVEAL DEMO ———//
function bindRevealDemo() {
  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("js-reveal-demo")) {
      toast("✨ Pack reveal triggered!");
    }
  });
}

//——— MESH PULSE INTERAKTION ———//
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
    }
  });
}