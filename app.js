// app.js — SpawnEngine 3.0 · Mesh HUD v0.4

// ---------- ONCHAIN CONFIG (mock) ----------
const SPAWN_CONFIG = {
  RPC_URL: "https://mainnet.base.org",
  CHAIN_ID: 8453,
  CHAIN_NAME: "Base",
};

let spawnProvider = null;
let spawnSigner = null;
let spawnAddress = null;

// ---------- STATE ----------
const state = {
  xp: 1575,
  spawn: 497,
  streakDays: 1,
  weeklyTarget: 7,
  fragments: 12,
  shards: 3,
  relics: 1,
  homeEvents: [],
  lootEvents: [],
  meshEvents: [],
  quests: [],
  role: "hunter",
};

// ---------- DOM UTIL ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function shortenAddress(addr, chars = 4) {
  if (!addr) return "";
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

function formatTime() {
  const d = new Date();
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// ---------- TOAST + HAPTIC (utan ljudfiler) ----------
let audioCtx = null;

function ensureAudioCtx() {
  if (!audioCtx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (Ctor) audioCtx = new Ctor();
  }
}

function playBeep(freq = 440, duration = 80) {
  ensureAudioCtx();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
  osc.start(now);
  osc.stop(now + duration / 1000);
}

function vibrate(pattern = [15]) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  playBeep(620, 60);
  vibrate(15);
  setTimeout(() => toast.classList.remove("show"), 2200);
}
window.spawnToast = showToast;

// ---------- EVENT PIPE ----------
function addMeshEventFromPayload(_payload) {
  // Den här kan senare pinga webgl-bakgrunden om du vill.
}

function pushEvent(list, payload, max = 16) {
  list.unshift(payload);
  if (list.length > max) list.length = max;
  addMeshEventFromPayload(payload);
}
window.pushEvent = pushEvent;

// dummy för pack-statistik
function registerPackOpen(name, wallet, priceEth) {
  try {
    const key = "spawn_pack_opens";
    const prev = JSON.parse(localStorage.getItem(key) || "[]");
    prev.unshift({
      name,
      wallet,
      priceEth,
      time: Date.now(),
    });
    localStorage.setItem(key, JSON.stringify(prev.slice(0, 50)));
  } catch (_) {}
}

// ---------- RENDER HELPERS ----------
function renderHeaderStats() {
  const gasEl = $("#gasEstimate");
  const activeWalletsEl = $("#activeWallets");
  const activeWalletsStat = $("#activeWalletsStat");

  if (gasEl) {
    const base = 0.18;
    const jitter = (Math.random() * 0.06).toFixed(2);
    gasEl.textContent = `~${(base + Number(jitter)).toFixed(2)} gwei est.`;
  }
  const active = spawnAddress ? "1" : "0";
  if (activeWalletsEl) activeWalletsEl.textContent = active;
  if (activeWalletsStat) activeWalletsStat.textContent = active;
}

function renderMeshSnapshot() {
  const xpEl = $("#xpBalance");
  const spawnEl = $("#spawnBalance");
  const streakDaysEl = $("#streakDays");
  const streakRemEl = $("#streakRemaining");
  const streakCopyEl = $("#streakCopyText");
  const streakBarFill = $("#streakBarFill");

  if (xpEl) xpEl.textContent = `${state.xp} XP`;
  if (spawnEl) spawnEl.textContent = `${state.spawn} SPN`;
  if (streakDaysEl) streakDaysEl.textContent = state.streakDays;

  const rem = Math.max(state.weeklyTarget - state.streakDays, 0);
  if (streakRemEl) streakRemEl.textContent = rem;
  if (streakCopyEl) {
    streakCopyEl.textContent = `Keep the streak for ${rem} more days for a full weekly run.`;
  }
  if (streakBarFill) {
    const pct = (state.streakDays / state.weeklyTarget) * 100;
    streakBarFill.style.width = `${Math.min(pct, 100)}%`;
  }
}

function renderInventory() {
  const f = $("#invFragments");
  const s = $("#invShards");
  const r = $("#invRelics");
  if (f) f.textContent = state.fragments;
  if (s) s.textContent = state.shards;
  if (r) r.textContent = state.relics;
}

function renderActivityList(ulEl, list) {
  if (!ulEl) return;
  ulEl.innerHTML = "";

  if (!list.length) {
    const li = document.createElement("li");
    li.textContent = "No recent signals yet.";
    ulEl.appendChild(li);
    return;
  }

  list.forEach((item) => {
    const li = document.createElement("li");

    const tag = document.createElement("span");
    tag.textContent = item.label;

    const main = document.createElement("div");
    main.textContent = item.text;

    const meta = document.createElement("div");
    meta.textContent = `${item.time} · ${item.meta || ""}`.trim();

    li.appendChild(tag);
    li.appendChild(main);
    li.appendChild(meta);
    ulEl.appendChild(li);
  });
}

function renderQuests() {
  const ul = $("#questList");
  if (!ul) return;
  ul.innerHTML = "";

  state.quests.forEach((quest) => {
    const li = document.createElement("li");
    li.className = "quest-item";

    const left = document.createElement("div");
    left.className = "quest-main";

    const title = document.createElement("div");
    title.className = "quest-title";
    title.textContent = quest.title;

    const sub = document.createElement("div");
    sub.className = "quest-sub";
    sub.textContent = quest.desc;

    left.appendChild(title);
    left.appendChild(sub);

    const right = document.createElement("div");
    right.className = "quest-right";

    const reward = document.createElement("div");
    reward.className = "quest-meta";
    reward.textContent = `+${quest.reward} XP`;

    const btn = document.createElement("button");
    btn.className = `btn-outline quest-btn ${
      quest.completed ? "quest-btn-completed" : ""
    }`;

    btn.textContent = quest.completed ? "Completed" : "Complete (mock)";
    btn.disabled = quest.completed;

    btn.addEventListener("click", () => {
      if (quest.completed) return;

      quest.completed = true;
      state.xp += quest.reward;

      pushEvent(state.homeEvents, {
        kind: "quest",
        label: "QUEST",
        text: quest.title,
        time: formatTime(),
        meta: `+${quest.reward} XP`,
      });

      renderMeshSnapshot();
      renderQuests();
      renderActivityList($("#homeActivityList"), state.homeEvents);
      showToast(`Quest completed · +${quest.reward} XP`);
    });

    right.appendChild(reward);
    right.appendChild(btn);

    li.appendChild(left);
    li.appendChild(right);
    ul.appendChild(li);
  });
}

// ---------- MOCK DATA ----------
function initQuests() {
  state.quests = [
    {
      id: "q-checkin",
      title: "Check in your daily mesh ritual",
      desc: "Open SpawnEngine and tap Check-in once today.",
      reward: 25,
      completed: false,
    },
    {
      id: "q-pack",
      title: "Open a starter mesh pack",
      desc: "Simulate at least one pack open in Loot.",
      reward: 40,
      completed: false,
    },
    {
      id: "q-mesh",
      title: "Explore Mesh view",
      desc: "Switch between modes in Mesh explorer.",
      reward: 30,
      completed: false,
    },
    {
      id: "q-support",
      title: "Open Support / SupCast",
      desc: "Visit the SupCast tab once.",
      reward: 20,
      completed: false,
    },
  ];
}

function seedHomeEvents() {
  const base = [
    {
      kind: "xp",
      label: "XP",
      text: "You checked in and fed your mesh.",
      meta: "+15 XP",
    },
    {
      kind: "pack",
      label: "PACK",
      text: "Opened Starter mesh pack · 4 Fragments, 1 Shard.",
      meta: "+45 XP",
    },
    {
      kind: "social",
      label: "CAST",
      text: "Shared your streak to Farcaster (mock).",
      meta: "Mesh share",
    },
    {
      kind: "mesh",
      label: "MESH",
      text: "Gravity cluster updated around your wallet.",
      meta: "XP streams bending",
    },
  ];

  state.homeEvents = base.map((e) => ({
    ...e,
    time: formatTime(),
  }));
}

function seedMeshEvents() {
  const items = [
    {
      kind: "mesh",
      label: "MESH",
      text: "Wallet 0x…abc joined starter mesh.",
      meta: "XP stream linked",
    },
    {
      kind: "pack",
      label: "PACK",
      text: "Creator X cluster opened 12 packs.",
      meta: "Alpha hunters spike",
    },
    {
      kind: "burn",
      label: "BURN",
      text: "Wallet 0x…def burned 50% of Creator Z.",
      meta: "Gravity shift",
    },
  ];

  state.meshEvents = items.map((e) => ({ ...e, time: formatTime() }));
}

function seedLootEvents() {
  state.lootEvents = [];
}

// ---------- VIEWPORT / COMPACT ----------
function applyCompactViewport() {
  const header = document.querySelector(".mesh-header");
  const nav = document.querySelector(".mesh-nav-scroll");
  const activePanel = document.querySelector(".tab-panel-active");

  if (!header || !nav || !activePanel) return;

  const headerH = header.offsetHeight || 0;
  const navH = nav.offsetHeight || 0;
  const viewport = window.innerHeight;
  const chrome = 28;

  const panelMax = viewport - headerH - navH - chrome;
  activePanel.style.maxHeight = `${panelMax}px`;
  activePanel.style.overflowY = "auto";
}

window.addEventListener("resize", applyCompactViewport);
window.addEventListener("orientationchange", applyCompactViewport);

// ---------- TABS ----------
function setupTabs() {
  const navButtons = $$(".mesh-nav-btn");
  const panels = $$(".tab-panel");

  function activate(target) {
    if (!target) return;

    navButtons.forEach((btn) => {
      const t = btn.dataset.tab;
      const active = t === target;
      btn.classList.toggle("is-active", active);
    });

    panels.forEach((panel) => {
      const hit = panel.id === `tab-${target}`;
      panel.classList.toggle("tab-panel-active", hit);
    });

    switch (target) {
      case "home":
        renderActivityList($("#homeActivityList"), state.homeEvents);
        break;
      case "loot":
        renderInventory();
        renderActivityList($("#lootEvents"), state.lootEvents);
        break;
      case "quests":
        renderQuests();
        break;
      case "mesh":
        renderActivityList($("#meshEvents"), state.meshEvents);
        // mesh quest auto-complete
        {
          const q = state.quests.find((q) => q.id === "q-mesh");
          if (q && !q.completed) {
            q.completed = true;
            state.xp += q.reward;
            pushEvent(state.homeEvents, {
              kind: "quest",
              label: "QUEST",
              text: "Explored Mesh view",
              time: formatTime(),
              meta: `+${q.reward} XP`,
            });
            renderMeshSnapshot();
            renderQuests();
            renderActivityList($("#homeActivityList"), state.homeEvents);
          }
        }
        break;
      case "supcast": {
        const q = state.quests.find((q) => q.id === "q-support");
        if (q && !q.completed) {
          q.completed = true;
          state.xp += q.reward;
          pushEvent(state.homeEvents, {
            kind: "quest",
            label: "QUEST",
            text: "Visited SupCast / Support",
            time: formatTime(),
            meta: `+${q.reward} XP`,
          });
          renderMeshSnapshot();
          renderQuests();
          renderActivityList($("#homeActivityList"), state.homeEvents);
        }
        break;
      }
      default:
        break;
    }

    requestAnimationFrame(applyCompactViewport);
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      activate(btn.dataset.tab);
      playBeep(520, 40);
    });
  });

  activate("home");
}

// ---------- LOOT ----------
function setupLoot() {
  const segButtons = $$("[data-loot-view]");
  const views = $$(".loot-view");

  segButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-loot-view");

      segButtons.forEach((b) =>
        b.classList.toggle("segmented-btn-active", b === btn)
      );

      views.forEach((v) =>
        v.classList.toggle("loot-view-active", v.id === `lootView-${view}`)
      );

      if (view === "inventory") renderInventory();
      applyCompactViewport();
    });
  });

  const packBtn = $("#btn-open-pack");
  if (packBtn) {
    packBtn.addEventListener("click", () => {
      const wallet = spawnAddress || "demo-wallet";
      const priceEth = 0.02;

      const gainedFragments = 2 + Math.floor(Math.random() * 4);
      const gainedShards = Math.random() < 0.35 ? 1 : 0;
      const relicDrop = Math.random() < 0.06 ? 1 : 0;
      const xpGain = 30 + Math.floor(Math.random() * 50);

      state.fragments += gainedFragments;
      state.shards += gainedShards;
      state.relics += relicDrop;
      state.xp += xpGain;

      registerPackOpen("starter_mesh_pack", wallet, priceEth);

      const summary = `+${gainedFragments}F ${
        gainedShards ? `+${gainedShards}S ` : ""
      }${relicDrop ? `+${relicDrop}R` : ""}`;

      pushEvent(state.lootEvents, {
        kind: "pack",
        label: "PACK",
        text: `Starter pack opened → ${summary}`,
        time: formatTime(),
        meta: `+${xpGain} XP · ${priceEth} ETH`,
      });

      pushEvent(state.homeEvents, {
        kind: "pack",
        label: "PACK",
        text: "Pack synced into your mesh orbit.",
        time: formatTime(),
        meta: `+${xpGain} XP`,
      });

      const q = state.quests.find((q) => q.id === "q-pack");
      if (q && !q.completed) {
        q.completed = true;
        state.xp += q.reward;

        pushEvent(state.homeEvents, {
          kind: "quest",
          label: "QUEST",
          text: "Quest: Open a starter pack",
          time: formatTime(),
          meta: `+${q.reward} XP`,
        });
      }

      renderMeshSnapshot();
      renderInventory();
      renderActivityList($("#lootEvents"), state.lootEvents);
      renderActivityList($("#homeActivityList"), state.homeEvents);
      renderQuests();
      showToast("Pack opened · loot added");
      applyCompactViewport();
    });
  }

  const synthBtn = $("#btn-simulate-synth");
  const labResult = $("#labResult");

  if (synthBtn && labResult) {
    synthBtn.addEventListener("click", () => {
      const needF = 5;
      const needS = 1;

      if (state.fragments < needF || state.shards < needS) {
        labResult.textContent = `Need ${needF} Fragments + ${needS} Shard to create a Relic.`;
        return;
      }

      state.fragments -= needF;
      state.shards -= needS;
      state.relics += 1;

      const xpGain = 75 + Math.floor(Math.random() * 40);
      state.xp += xpGain;

      labResult.textContent = "Relic successfully created.";

      pushEvent(state.lootEvents, {
        kind: "relic",
        label: "RELIC",
        text: "Pulled together fragments + shard → Relic",
        time: formatTime(),
        meta: `+${xpGain} XP`,
      });

      pushEvent(state.homeEvents, {
        kind: "relic",
        label: "RELIC",
        text: "Relic synced into mesh orbit.",
        time: formatTime(),
        meta: `+${xpGain} XP`,
      });

      renderMeshSnapshot();
      renderInventory();
      renderActivityList($("#lootEvents"), state.lootEvents);
      renderActivityList($("#homeActivityList"), state.homeEvents);

      showToast("Relic forged · XP boosted");
      applyCompactViewport();
    });
  }
}

// ---------- MARKET ----------
const MARKET_DATA = [
  {
    id: "l1",
    title: "Starter Mesh Pack",
    desc: "Base-friendly starter pack for new mesh explorers.",
    priceEth: "0.02 ETH",
    meta: "452 opened today",
    category: "packs",
  },
  {
    id: "l2",
    title: "Creator Token · SPN",
    desc: "SpawnEngine token powering XP boosts & mesh rituals.",
    priceEth: "0.004 ETH",
    meta: "Trending · +31%",
    category: "tokens",
  },
  {
    id: "l3",
    title: "Vaulted Relic",
    desc: "High-tier pull forged from fragments + shards.",
    priceEth: "0.15 ETH",
    meta: "Legendary",
    category: "collectibles",
  },
  {
    id: "l4",
    title: "Alpha Hunter Insights",
    desc: "Top trader feed · real-time mesh spikes.",
    priceEth: "0.01 ETH",
    meta: "Creator Service",
    category: "services",
  },
  {
    id: "l5",
    title: "Mesh Upgrade · XP Boost",
    desc: "Boost your ritual streak with temporary 1.4x XP.",
    priceEth: "0.005 ETH",
    meta: "Boosts",
    category: "boosts",
  },
];

let marketFilter = "all";

function renderMarket() {
  const list = $("#marketGrid");
  const empty = $("#marketEmpty");
  if (!list) return;

  const items =
    marketFilter === "all"
      ? MARKET_DATA
      : MARKET_DATA.filter((i) => i.category === marketFilter);

  if (!items.length) {
    if (empty) empty.style.display = "block";
    list.innerHTML = "";
    return;
  }

  if (empty) empty.style.display = "none";

  list.innerHTML = items
    .map(
      (i) => `
      <div class="market-card" data-listing="${i.id}">
        <h4>${i.title}</h4>
        <p class="market-card-desc">${i.desc}</p>
        <div class="market-card-footer">
          <span class="market-card-price">${i.priceEth}</span>
          <span class="market-card-participants">${i.meta}</span>
        </div>
        <button class="btn-outline market-card-btn">View</button>
      </div>
    `
    )
    .join("");

  list.querySelectorAll(".market-card-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".market-card");
      const id = card?.getAttribute("data-listing");
      const listing = MARKET_DATA.find((x) => x.id === id);
      if (listing) openMarketPopup(listing);
    });
  });

  applyCompactViewport();
}

function setupMarketFilters() {
  const filterRow = $("#marketFilters");
  if (!filterRow) return;

  filterRow.addEventListener("click", (e) => {
    const btn = e.target.closest(".market-filter-chip");
    if (!btn) return;

    const cat = btn.dataset.filter || "all";
    marketFilter = cat;

    filterRow
      .querySelectorAll(".market-filter-chip")
      .forEach((c) => c.classList.remove("is-active"));

    btn.classList.add("is-active");

    renderMarket();
  });
}

function openMarketPopup(listing) {
  const backdrop = $("#marketDetailsBackdrop");
  const title = $("#marketDetailsTitle");
  const body = $("#marketDetailsBody");
  if (!backdrop || !title || !body) return;

  title.textContent = listing.title;

  body.innerHTML = `
    <div class="market-card">
      <h4>${listing.title}</h4>
      <p class="market-card-desc">${listing.desc}</p>
      <div class="market-card-footer">
        <span class="market-card-price">${listing.priceEth}</span>
        <span class="market-card-participants">${listing.meta}</span>
      </div>
      <button id="marketPopupBuy" class="btn-primary full-width">Buy (mock)</button>
    </div>
  `;

  const buyBtn = $("#marketPopupBuy");
  if (buyBtn) {
    buyBtn.addEventListener("click", () => {
      showToast(`Purchased ${listing.title} (mock)`);
    });
  }

  backdrop.classList.remove("hidden");
}

function setupMarketPopup() {
  const backdrop = $("#marketDetailsBackdrop");
  const backBtn = $("#marketDetailsBack");

  if (!backdrop || !backBtn) return;

  const close = () => {
    backdrop.classList.add("hidden");
  };

  backBtn.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
}

function initMarketModule() {
  renderMarket();
  setupMarketFilters();
  setupMarketPopup();
}

// ---------- HOLO HUD ----------
let gasPulseValue = 0.2;
let xpPulse = 0;

function initHoloHud() {
  const container = document.getElementById("holo-hud");
  if (!container) return;

  container.innerHTML = `
    <div class="holo-gas">
      <canvas id="gasRing" width="64" height="64"></canvas>
      <div class="holo-gas-label">
        <span id="gasRingValue">0.00 gwei</span>
      </div>
    </div>

    <div class="holo-xp">
      <div class="holo-xp-bar">
        <div id="holoXpFill" class="holo-xp-fill"></div>
      </div>
      <span id="holoXpLabel">0 XP</span>
    </div>

    <button id="holoInvBtn" class="holo-inv-btn">Inventory</button>
  `;

  setInterval(updateHoloHud, 800);
}

function drawGasRing(value) {
  const canvas = document.getElementById("gasRing");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const center = canvas.width / 2;
  const radius = center - 6;
  const start = -Math.PI / 2;
  const end = start + value * Math.PI * 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(40,50,90,0.5)";
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(center, center, radius, start, end);
  ctx.strokeStyle = "rgba(52,255,240,0.9)";
  ctx.lineWidth = 6;
  ctx.shadowBlur = 14;
  ctx.shadowColor = "rgba(52,255,240,0.9)";
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function updateHoloHud() {
  const gasValEl = document.getElementById("gasRingValue");
  const xpEl = document.getElementById("holoXpLabel");
  const xpFill = document.getElementById("holoXpFill");

  const base = 0.19;
  const jitter = Math.random() * 0.04;
  gasPulseValue = base + jitter;

  if (gasValEl) gasValEl.textContent = `${gasPulseValue.toFixed(2)} gwei`;
  drawGasRing(Math.min(gasPulseValue / 1.0, 1));

  xpPulse += 0.02;
  const xpRatio = (state.xp % 100) / 100;
  const wave = Math.sin(xpPulse) * 0.05;
  const final = Math.min(Math.max(xpRatio + wave, 0), 1);

  if (xpFill) xpFill.style.width = `${final * 100}%`;
  if (xpEl) xpEl.textContent = `${state.xp} XP`;
}

// ---------- INVENTORY SLIDEOUT ----------
function initInventorySlideout() {
  const root = document.getElementById("inventory-slideout");
  if (!root) return;

  const invBtn = document.getElementById("holoInvBtn");
  if (!invBtn) return;

  root.innerHTML = `
    <div class="inv-content">
      <h3>Inventory</h3>
      <div class="inv-row">Fragments <span id="invMiniF">${state.fragments}</span></div>
      <div class="inv-row">Shards <span id="invMiniS">${state.shards}</span></div>
      <div class="inv-row">Relics <span id="invMiniR">${state.relics}</span></div>
      <button id="invClose" class="inv-close">Close</button>
    </div>
  `;

  invBtn.addEventListener("click", () => {
    root.classList.add("open");
    updateInventorySlideout();
  });

  const closeBtn = root.querySelector("#invClose");
  closeBtn.addEventListener("click", () => {
    root.classList.remove("open");
  });
}

function updateInventorySlideout() {
  const f = document.getElementById("invMiniF");
  const s = document.getElementById("invMiniS");
  const r = document.getElementById("invMiniR");
  if (f) f.textContent = state.fragments;
  if (s) s.textContent = state.shards;
  if (r) r.textContent = state.relics;
}

// ---------- SETTINGS SHEET + ROLE ----------
function setupSettingsSheet() {
  const backdrop = $("#settings-backdrop");
  const openBtn = $("#settings-btn");
  const closeBtn = $("#settings-close");
  if (!backdrop || !openBtn || !closeBtn) return;

  const open = () => {
    backdrop.classList.remove("hidden");
  };
  const close = () => {
    backdrop.classList.add("hidden");
  };

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });

  const cards = $$(".role-card");
  const saveBtn = $("#save-role");
  let selectedRole = null;

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      cards.forEach((c) => c.classList.remove("role-selected"));
      card.classList.add("role-selected");
      selectedRole = card.dataset.role;
      saveBtn.disabled = false;
    });
  });

  saveBtn.addEventListener("click", () => {
    if (!selectedRole) return;
    state.role = selectedRole;
    const pill = $("#meshRolePill");
    if (pill) {
      if (selectedRole === "dev") pill.textContent = "🧪 Dev / Builder";
      else if (selectedRole === "creator") pill.textContent = "🎨 Creator / Artist";
      else if (selectedRole === "collector") pill.textContent = "🎴 Collector / Fan";
      else pill.textContent = "⚡ Alpha hunter / Trader";
    }
    showToast(`Role set to ${pill.textContent}`);
    close();
  });
}

// ---------- CHECK-IN ----------
function setupCheckin() {
  const btn = $("#btn-checkin");
  if (!btn) return;

  btn.addEventListener("click", () => {
    state.streakDays = Math.min(state.weeklyTarget, state.streakDays + 1);
    const xpGain = 15 + Math.floor(Math.random() * 10);
    state.xp += xpGain;

    const q = state.quests.find((q) => q.id === "q-checkin");
    if (q && !q.completed) {
      q.completed = true;
      state.xp += q.reward;

      pushEvent(state.homeEvents, {
        kind: "quest",
        label: "QUEST",
        text: "Daily mesh check-in",
        time: formatTime(),
        meta: `+${q.reward} XP`,
      });
    }

    pushEvent(state.homeEvents, {
      kind: "xp",
      label: "XP",
      text: "Daily ritual mesh check-in.",
      time: formatTime(),
      meta: `+${xpGain} XP`,
    });

    renderMeshSnapshot();
    renderQuests();
    renderActivityList($("#homeActivityList"), state.homeEvents);
    showToast("Checked in · streak updated");
  });
}

// ---------- CONNECT MOCK ----------
function setupConnectMock() {
  const btn = $("#btn-connect");
  if (!btn) return;
  const statusLabel = $("#wallet-status-label");
  const addrEls = $$("[data-wallet-address]");

  btn.addEventListener("click", async () => {
    // Bara mock just nu
    if (!spawnAddress) {
      spawnAddress = "0x1234abcd5678ef90deadbeefcafe123456789012";
      if (statusLabel) statusLabel.textContent = "Connected (mock)";
      addrEls.forEach(
        (el) => (el.textContent = shortenAddress(spawnAddress, 4))
      );
      $("#walletBalanceEth").textContent = "0.4200 ETH";
      renderHeaderStats();
      showToast("Connected wallet (mock)");
    } else {
      spawnAddress = null;
      if (statusLabel) statusLabel.textContent = "Not connected";
      addrEls.forEach((el) => (el.textContent = "Not connected"));
      $("#walletBalanceEth").textContent = "0.0000 ETH";
      renderHeaderStats();
      showToast("Disconnected (mock)");
    }
  });
}

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  initQuests();
  seedHomeEvents();
  seedMeshEvents();
  seedLootEvents();

  renderMeshSnapshot();
  renderInventory();
  renderHeaderStats();
  renderActivityList($("#homeActivityList"), state.homeEvents);

  initHoloHud();
  initInventorySlideout();
  setupTabs();
  setupLoot();
  initMarketModule();
  setupSettingsSheet();
  setupCheckin();
  setupConnectMock();

  applyCompactViewport();
});