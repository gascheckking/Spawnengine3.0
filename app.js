/* ====================================================
   SpawnEngine v3.1 — Reforge App Core (JS Engine)
   ==================================================== */

// ---------- GLOBAL STATE ----------
let currentTheme = localStorage.getItem("spawnTheme") || "glassbase";
let userProfile = null;
let marketplace = [];
let feed = [];

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
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
});

// ---------- NAVIGATION ----------
function setupNavigation() {
  const buttons = document.querySelectorAll(".nav-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.view;
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      document.getElementById(target).classList.add("active");
      window.scrollTo(0, 0);
    });
  });
}

// ---------- TOAST ----------
window.toast = (msg) => {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1200);
};

// ---------- THEME ----------
function setupThemeSwitcher() {
  const select = document.getElementById("themeSelect");
  if (!select) return;
  select.value = currentTheme;
  select.addEventListener("change", e => {
    const theme = e.target.value;
    document.body.dataset.theme = theme;
    localStorage.setItem("spawnTheme", theme);
    toast(`Theme: ${theme}`);
  });
}

// ---------- SETTINGS ----------
function setupSettings() {
  const toggle = document.getElementById("pwaToggle");
  if (!toggle) return;
  toggle.addEventListener("change", (e) => {
    if (e.target.checked) toast("Offline mode enabled");
    else toast("Online mode active");
  });
}

// ---------- PROFILE ----------
async function loadProfile() {
  try {
    const { getProfile } = await import("./api/user-profile.js");
    userProfile = getProfile();
    document.getElementById("xpBalance").textContent = `XP: ${userProfile.xpBalance}`;
    document.getElementById("spnBalance").textContent = `SPN: ${userProfile.spnBalance}`;
  } catch (err) {
    console.error("Profile load error:", err);
  }
}

// ---------- HOME FEED ----------
async function loadHome() {
  try {
    const { getHomeFeed } = await import("./api/mesh-feed.js");
    feed = getHomeFeed();
    const el = document.getElementById("meshFeed");
    el.innerHTML = "";
    feed.forEach(item => {
      const div = document.createElement("div");
      div.className = "feed-item";
      div.textContent = item;
      el.appendChild(div);
    });
  } catch (err) {
    console.error("Feed load error:", err);
  }
}

// ---------- MARKETPLACE ----------
async function loadMarketplace() {
  try {
    const { getMarketplaceListings } = await import("./api/marketplace-listings.js");
    marketplace = getMarketplaceListings();
    const list = document.getElementById("marketList");
    list.innerHTML = "";
    marketplace.forEach(item => {
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
          <button class="market-card-btn js-reveal-demo">Reveal demo</button>
        </div>`;
      list.appendChild(card);
    });

    list.addEventListener("click", async (e) => {
      if (e.target.classList.contains("market-card-btn") && e.target.dataset.id) {
        const id = parseInt(e.target.dataset.id);
        const { simulatePurchase } = await import("./api/marketplace-listings.js");
        const res = simulatePurchase(id);
        toast(res.message);
        if (res.success) loadMarketplace();
      }
    });
  } catch (err) {
    console.error("Marketplace load error:", err);
  }
}

// ---------- LOOT ----------
function setupLoot() {
  const openBtn = document.getElementById("openPackBtn");
  const synthBtn = document.getElementById("synthBtn");

  openBtn.addEventListener("click", async () => {
    const { simulatePackOpen } = await import("./api/pack-actions.js");
    const result = simulatePackOpen();
    toast(result.events.join(", "));
    updateInventory(result.inventory);
  });

  synthBtn.addEventListener("click", async () => {
    const { simulateSynthesis } = await import("./api/pack-actions.js");
    const result = simulateSynthesis();
    toast(result.message);
    updateInventory(result.inventory);
  });

  const { getInventory } = await import("./api/pack-actions.js");
  updateInventory(getInventory());
}

function updateInventory(inv) {
  document.getElementById("fragCount").textContent = inv.fragments;
  document.getElementById("shardCount").textContent = inv.shards;
  document.getElementById("relicCount").textContent = inv.relics;
}

// ---------- SUPPORT (SupCast) ----------
function setupSupport() {
  const input = document.getElementById("supportInput");
  const submit = document.getElementById("submitSupport");
  const feed = document.getElementById("supportFeed");

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

// ---------- TRACKER ----------
function setupTracker() {
  const feed = document.getElementById("trackerFeed");
  feed.innerHTML = `
    <div class="feed-item">👣 Tracked wallet: ${userProfile?.walletAddress || "0x..."}</div>
    <div class="feed-item">💸 Last pack purchase detected (mock).</div>
    <div class="feed-item">📈 XP event registered.</div>
  `;
}

// ---------- SPAWNBOT ----------
function setupBot() {
  const list = document.getElementById("automationList");
  list.innerHTML = `
    <div class="feed-item">🤖 Auto-claim streak XP — ON</div>
    <div class="feed-item">⚙️ Alert: Gas < 0.05 Gwei</div>
    <div class="feed-item">📡 Watch Creator: @spawniz</div>
  `;
}

// ---------- REVEAL DEMO ----------
function bindRevealDemo() {
  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("js-reveal-demo")) {
      if (window.SpawnEngine && SpawnEngine.reveal) {
        SpawnEngine.reveal({
          title: "Pack Reveal Demo",
          autoOpen: true,
          onReveal: (win) => toast(`You pulled: ${win.name} (${win.rarity})`)
        });
      } else {
        toast("SDK not loaded");
      }
    }
  });
}

// ---------- MESH BACKGROUND ----------
const canvas = document.getElementById("meshCanvas");
const ctx = canvas.getContext("2d");
let w, h, particles = [];

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

for (let i = 0; i < 42; i++) {
  particles.push({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    r: Math.random() * 2 + 0.5
  });
}

function drawMesh() {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "rgba(60, 246, 255, 0.4)";
  for (let p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.strokeStyle = "rgba(60, 246, 255, 0.15)";
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawMesh);
}
drawMesh();