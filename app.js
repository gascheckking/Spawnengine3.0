// app.js — SpawnEngine 3.0 · Mesh HUD v0.4 (FULL)

// ---------- ONCHAIN CONFIG ----------
const SPAWN_CONFIG = {
  RPC_URL: "https://mainnet.base.org",
  CHAIN_ID: 8453,
  CHAIN_NAME: "Base",
};

let spawnProvider = null;
let spawnSigner = null;
let spawnAddress = null;

function shortenAddress(addr, chars = 4) {
  if (!addr) return "";
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

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

// ---------- UTIL ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}
window.spawnToast = showToast;

// ---------- HAPTIC & AUDIO ENGINE ----------
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const sounds = {};

function loadSound(name, url) {
  fetch(url)
    .then((response) => response.arrayBuffer())
    .then((buffer) => audioContext.decodeAudioData(buffer))
    .then((decodedBuffer) => {
      sounds[name] = decodedBuffer;
    })
    .catch(() => {});
}

// Ljudfiler i /sounds/
loadSound("click", "sounds/click.mp3");
loadSound("reward", "sounds/reward.mp3");
loadSound("open", "sounds/open.mp3");

function playSound(name) {
  const buffer = sounds[name];
  if (!buffer) return;

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
}

function vibrate(pattern = [10]) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

// Hooka in i toast
const originalShowToast = showToast;
showToast = function (message) {
  originalShowToast(message);
  playSound("click");
  vibrate(10);
};
window.spawnToast = showToast;

function formatTime() {
  const d = new Date();
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function addMeshEventFromPayload(payload) {
  const evt = {
    kind: payload.kind || "mesh",
    label: payload.label || "MESH",
    text: payload.text || "Mesh activity",
    meta: payload.meta || "",
    time: payload.time || formatTime(),
  };
  state.meshEvents.unshift(evt);
  if (state.meshEvents.length > 24) state.meshEvents.length = 24;
  renderActivityList($("#meshEvents"), state.meshEvents);
}

// Global pushEvent → feeds list + mesh stream
function pushEvent(list, payload, max = 16) {
  list.unshift(payload);
  if (list.length > max) list.length = max;
  addMeshEventFromPayload(payload);
}
window.pushEvent = pushEvent;

// ---------- HEADER / HUD RENDER ----------

function renderHeaderStats() {
  const gasEl = $("#gasEstimate");
  const activeWalletsEl = $("#activeWallets");
  const activeWalletsStat = $("#activeWalletsStat");

  if (gasEl) {
    const base = 0.18;
    const jitter = (Math.random() * 0.06).toFixed(2);
    gasEl.textContent = `~${(base + Number(jitter)).toFixed(2)} gwei est.`;
  }
  const wallets = spawnAddress ? "1" : "0";
  if (activeWalletsEl) activeWalletsEl.textContent = wallets;
  if (activeWalletsStat) activeWalletsStat.textContent = wallets;
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

  if (streakRemEl) {
    const rem = Math.max(state.weeklyTarget - state.streakDays, 0);
    streakRemEl.textContent = rem;
  }
  if (streakCopyEl) {
    const rem = Math.max(state.weeklyTarget - state.streakDays, 0);
    streakCopyEl.textContent = `Keep the streak for ${rem} more days for a full weekly run.`;
  }
  if (streakBarFill) {
    const pct = (state.streakDays / state.weeklyTarget) * 100;
    streakBarFill.style.width = `${Math.min(pct, 100)}%`;
  }

  const headerXp = $("#meshHeaderXp");
  if (headerXp) headerXp.textContent = `${state.xp} XP`;
}

function renderInventory() {
  const f = $("#invFragments");
  const s = $("#invShards");
  const r = $("#invRelics");

  if (f) f.textContent = state.fragments;
  if (s) s.textContent = state.shards;
  if (r) r.textContent = state.relics;
}

// ---------- LIST HELPERS ----------

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
      playSound("reward");
      vibrate([40, 30, 40]);
    });

    right.appendChild(reward);
    right.appendChild(btn);

    li.appendChild(left);
    li.appendChild(right);
    ul.appendChild(li);
  });
}

// ---------- MOCK DATA SEEDERS ----------

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
      desc: "Switch through Alpha/New/Gravity modes in Mesh explorer.",
      reward: 30,
      completed: false,
    },
    {
      id: "q-support",
      title: "Open Support / SupCast",
      desc: "Visit the Support tab once.",
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

// -------------------------------------------------------
// TABS + NAVIGATION — SpawnEngine Mesh HUD v0.4 Compact
// -------------------------------------------------------

function setupTabs() {
  const navButtons = [
    ...$$(".mesh-nav-btn"),
    ...$$("[data-tab-target]"),
  ];

  const panels = $$(".tab-panel");

  function activate(target) {
    if (!target) return;

    // NAV STATE
    navButtons.forEach((btn) => {
      const t =
        btn.dataset.tab ||
        btn.getAttribute("data-tab-target");

      const active = t === target;

      btn.classList.toggle("nav-btn-active", active);

      if (btn.classList.contains("mesh-nav-btn")) {
        btn.classList.toggle("is-active", active);
      }
    });

    // PANEL VISIBILITY
    panels.forEach((panel) => {
      const id = `tab-${target}`;
      const hit = panel.id === id;
      panel.classList.toggle("tab-panel-active", hit);
      panel.style.display = hit ? "block" : "none";
    });

    // RENDER ON TAB ENTER
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
        break;

      case "supcast": {
        const q = state.quests.find((q) => q.id === "q-support");
        if (q && !q.completed) {
          q.completed = true;
          state.xp += q.reward;
          pushEvent(state.homeEvents, {
            kind: "quest",
            label: "QUEST",
            text: "Visited Support / SupCast",
            time: formatTime(),
            meta: `+${q.reward} XP`,
          });
          renderMeshSnapshot();
          renderQuests();
          renderActivityList($("#homeActivityList"), state.homeEvents);
        }
        break;
      }
    }

    requestAnimationFrame(applyCompactViewport);
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target =
        btn.dataset.tab ||
        btn.getAttribute("data-tab-target");
      activate(target);
      playSound("click");
    });
  });

  // Default tab
  activate("home");
}

// -------------------------------------------------------
// VIEWPORT / COMPACT LAYOUT ENGINE
// -------------------------------------------------------

function applyCompactViewport() {
  const header = document.querySelector(".mesh-header");
  const nav = document.querySelector(".mesh-nav-scroll");
  const activePanel = document.querySelector(".tab-panel-active");

  if (!header || !nav || !activePanel) return;

  const headerH = header.offsetHeight || 0;
  const navH = nav.offsetHeight || 0;
  const viewport = window.innerHeight;

  const chrome = 26;
  const panelMax = viewport - headerH - navH - chrome;

  activePanel.style.maxHeight = `${panelMax}px`;
  activePanel.style.overflowY = "auto";
}

window.addEventListener("resize", applyCompactViewport);
window.addEventListener("orientationchange", applyCompactViewport);

// -------------------------------------------------------
// HUD: SUPER COMPACT PROFILE PANEL FIX
// -------------------------------------------------------

function enhanceProfilePanel() {
  const pane = document.querySelector(".profile-card");
  if (!pane) return;

  pane.style.height = "auto";
  pane.style.minHeight = "72px";

  const avatar = pane.querySelector(".profile-avatar");
  if (avatar) avatar.style.transform = "translateY(2px)";
}

// -------------------------------------------------------
// LOOT ENGINE — Fragments / Shards / Relics / Packs
// -------------------------------------------------------

function registerPackOpen(name, wallet, priceEth) {
  try {
    const raw = localStorage.getItem("spawn_pack_stats") || "[]";
    const arr = JSON.parse(raw);
    arr.unshift({
      name,
      wallet,
      priceEth,
      time: Date.now(),
    });
    if (arr.length > 50) arr.length = 50;
    localStorage.setItem("spawn_pack_stats", JSON.stringify(arr));
  } catch (e) {}
}

function setupLoot() {
  const segButtons = $$("[data-loot-view]");
  const views = $$(".loot-view");

  // Switch loot subtabs
  segButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-loot-view");

      segButtons.forEach((b) =>
        b.classList.toggle("segmented-btn-active", b === btn)
      );

      views.forEach((v) =>
        v.classList.toggle(
          "loot-view-active",
          v.id === `lootView-${view}`
        )
      );

      if (view === "inventory") renderInventory();
      applyCompactViewport();
    });
  });

  // PACK OPEN (mock)
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

      const summary = `+${gainedFragments}F  ${
        gainedShards ? `+${gainedShards}S ` : ""
      }${relicDrop ? `+${relicDrop}R ` : ""}`;

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
      playSound("open");
      vibrate([50, 30, 50]);

      applyCompactViewport();
    });
  }

  // SYNTH / LAB
  const synthBtn = $("#btn-simulate-synth");
  const labResult = $("#labResult");

  if (synthBtn && labResult) {
    synthBtn.addEventListener("click", () => {
      const needF = 5;
      const needS = 1;

      if (state.fragments < needF || state.shards < needS) {
        labResult.textContent =
          `Need ${needF} Fragments + ${needS} Shard to create a Relic.`;
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
      playSound("reward");
      vibrate([60, 40, 60]);
      applyCompactViewport();
    });
  }
}

// -------------------------------------------------------
// MARKET ENGINE — Listings · Filters · Popup Details
// -------------------------------------------------------

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
      playSound("click");
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
    vibrate(10);
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
      <button id="marketPopupBuy" class="btn-primary full-btn">Buy (mock)</button>
    </div>
  `;

  const buyBtn = $("#marketPopupBuy");
  if (buyBtn) {
    buyBtn.addEventListener("click", () => {
      showToast(`Purchased ${listing.title} (mock)`);
      playSound("reward");
      vibrate([40, 20, 40]);
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

// -------------------------------------------------------
// MESH EXPLORER PRO — Dynamic Graph, Clusters, Pulsing Nodes
// -------------------------------------------------------

let meshCanvas, meshCtx;
let meshNodes = [];
let meshLinks = [];
let meshZoom = 1;
let meshMode = "gravity";
let meshAnimFrame = null;

const MESH_PRESETS = {
  alpha: {
    nodeColor: "rgba(255,110,80,0.85)",
    glow: "rgba(255,60,40,0.7)",
    size: 7,
    pulseSpeed: 0.05,
  },
  new: {
    nodeColor: "rgba(80,170,255,0.85)",
    glow: "rgba(40,120,255,0.7)",
    size: 6,
    pulseSpeed: 0.045,
  },
  gravity: {
    nodeColor: "rgba(240,240,255,0.9)",
    glow: "rgba(150,180,255,0.55)",
    size: 8,
    pulseSpeed: 0.03,
  },
};

function initMeshGraph() {
  meshCanvas =
    document.getElementById("meshCanvas") ||
    document.getElementById("mesh-canvas");
  if (!meshCanvas) return;
  meshCtx = meshCanvas.getContext("2d");

  resizeMeshCanvas();

  meshNodes = Array.from({ length: 60 }).map(() => ({
    x: Math.random() * (meshCanvas.width / window.devicePixelRatio),
    y: Math.random() * (meshCanvas.height / window.devicePixelRatio),
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    pulse: Math.random() * Math.PI * 2,
  }));

  meshLinks = [];
  for (let i = 0; i < meshNodes.length; i++) {
    for (let j = i + 1; j < meshNodes.length; j++) {
      const dx = meshNodes[i].x - meshNodes[j].x;
      const dy = meshNodes[i].y - meshNodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 160) {
        meshLinks.push({ a: i, b: j, dist });
      }
    }
  }

  animateMeshGraph();
}

function resizeMeshCanvas() {
  if (!meshCanvas) return;
  const ratio = window.devicePixelRatio || 1;
  meshCanvas.width = meshCanvas.clientWidth * ratio;
  meshCanvas.height = meshCanvas.clientHeight * ratio;
  if (meshCtx) {
    meshCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
}

function addMeshNode(evt) {
  if (!meshNodes.length || !meshCanvas) return;

  const w = meshCanvas.width / (window.devicePixelRatio || 1);
  const h = meshCanvas.height / (window.devicePixelRatio || 1);

  meshNodes.push({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    pulse: Math.random() * Math.PI * 2,
    highlight:
      evt.kind === "pack"
        ? "gold"
        : evt.kind === "xp"
        ? "purple"
        : null,
  });

  if (meshNodes.length > 80) meshNodes.shift();
}

// Override pushEvent to även mata in i mesh-nätet
const originalPushEventMesh = pushEvent;
pushEvent = function (list, payload, max = 16) {
  originalPushEventMesh(list, payload, max);
  try {
    addMeshNode(payload);
  } catch (e) {}
};
window.pushEvent = pushEvent;

function drawMesh() {
  if (!meshCtx || !meshCanvas) return;
  const preset = MESH_PRESETS[meshMode] || MESH_PRESETS.gravity;

  meshCtx.clearRect(0, 0, meshCanvas.width, meshCanvas.height);

  meshCtx.lineWidth = 1 * meshZoom;
  meshCtx.strokeStyle = "rgba(120,140,200,0.25)";
  meshCtx.beginPath();
  meshLinks.forEach((link) => {
    const A = meshNodes[link.a];
    const B = meshNodes[link.b];
    meshCtx.moveTo(A.x * meshZoom, A.y * meshZoom);
    meshCtx.lineTo(B.x * meshZoom, B.y * meshZoom);
  });
  meshCtx.stroke();

  meshNodes.forEach((n) => {
    n.pulse += preset.pulseSpeed;
    const pulsedSize = preset.size + Math.sin(n.pulse) * 1.5;

    if (n.highlight) {
      meshCtx.fillStyle =
        n.highlight === "gold"
          ? "rgba(255,200,60,0.9)"
          : "rgba(200,60,255,0.9)";
    } else {
      meshCtx.fillStyle = preset.nodeColor;
    }

    meshCtx.shadowBlur = 12;
    meshCtx.shadowColor = preset.glow;

    meshCtx.beginPath();
    meshCtx.arc(n.x * meshZoom, n.y * meshZoom, pulsedSize, 0, Math.PI * 2);
    meshCtx.fill();

    meshCtx.shadowBlur = 0;
  });
}

function animateMeshGraph() {
  if (!meshCanvas) return;
  const ratio = window.devicePixelRatio || 1;

  meshNodes.forEach((n) => {
    n.x += n.vx;
    n.y += n.vy;

    if (n.x < 0 || n.x > meshCanvas.width / ratio) n.vx *= -1;
    if (n.y < 0 || n.y > meshCanvas.height / ratio) n.vy *= -1;
  });

  drawMesh();
  meshAnimFrame = requestAnimationFrame(animateMeshGraph);
}

function setMeshMode(mode) {
  meshMode = mode;
  showToast(`Mesh mode → ${mode}`);
}

function initMeshExplorer() {
  initMeshGraph();

  window.addEventListener("resize", () => {
    resizeMeshCanvas();
  });

  const btnAlpha = document.querySelector("[data-mesh-mode='alpha']");
  const btnNew = document.querySelector("[data-mesh-mode='new']");
  const btnGravity = document.querySelector("[data-mesh-mode='gravity']");

  if (btnAlpha)
    btnAlpha.addEventListener("click", () => setMeshMode("alpha"));
  if (btnNew)
    btnNew.addEventListener("click", () => setMeshMode("new"));
  if (btnGravity)
    btnGravity.addEventListener("click", () => setMeshMode("gravity"));
}

// -------------------------------------------------------
// HOLO HUD & MICRO-PANELS
// -------------------------------------------------------

let gasPulseValue = 0.2;
let xpPulse = 0;

function initHoloHud() {
  const container = document.getElementById("holo-hud");
  if (!container) return;

  container.innerHTML = `
    <div class="holo-gas">
      <canvas id="gasRing" width="90" height="90"></canvas>
      <div class="holo-gas-label">
        <span id="gasRingValue">0.00 gwei</span>
      </div>
    </div>

    <div class="holo-divider"></div>

    <div class="holo-xp">
      <div class="holo-xp-bar">
        <div id="holoXpFill" class="holo-xp-fill"></div>
      </div>
      <span id="holoXpLabel">0 XP</span>
    </div>

    <button id="holoInvBtn" class="holo-inv-btn">Inventory</button>
  `;
}

function drawGasRing(value) {
  const canvas = document.getElementById("gasRing");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const center = 45;
  const radius = 34;
  const start = -Math.PI / 2;
  const end = start + value * Math.PI * 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(40,50,90,0.5)";
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(center, center, radius, start, end);
  ctx.strokeStyle = "rgba(52,255,240,0.9)";
  ctx.lineWidth = 8;
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

setInterval(updateHoloHud, 800);

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
    vibrate(10);
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

// -------------------------------------------------------
// WALLET MOCK / CONNECT
// -------------------------------------------------------

async function connectWallet() {
  if (!window.ethereum) {
    showToast("No wallet found (mock only)");
    return;
  }
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();

    spawnProvider = provider;
    spawnSigner = signer;
    spawnAddress = addr;

    const addrEls = document.querySelectorAll("[data-wallet-address]");
    addrEls.forEach((el) => {
      el.textContent = shortenAddress(addr, 4);
    });

    const label = $("#wallet-status-label");
    if (label) label.textContent = "Connected";

    renderHeaderStats();
    fetchEthBalance();
    showToast("Wallet connected (mock)");
  } catch (e) {
    showToast("Wallet connection failed");
  }
}

async function fetchEthBalance() {
  if (!spawnProvider || !spawnAddress) return;
  const balEl = $("#walletBalanceEth");
  try {
    const wei = await spawnProvider.getBalance(spawnAddress);
    const eth = Number(ethers.utils.formatEther(wei));
    if (balEl) balEl.textContent = `${eth.toFixed(4)} ETH`;
  } catch (e) {}
}

function initWallet() {
  const btn = $("#btn-connect");
  if (!btn) return;
  btn.addEventListener("click", () => {
    connectWallet();
    playSound("click");
  });
}

// -------------------------------------------------------
// SETTINGS SHEET / ACCOUNT SHEET / ROLE / STREAK / SUPCAST
// -------------------------------------------------------

function initSettingsSheet() {
  const btn = $("#settings-btn");
  const backdrop = $("#settings-backdrop");
  const close = $("#settings-close");
  if (!btn || !backdrop || !close) return;

  const hide = () => backdrop.classList.add("hidden");
  const show = () => backdrop.classList.remove("hidden");

  btn.addEventListener("click", () => {
    show();
    vibrate(10);
  });
  close.addEventListener("click", hide);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) hide();
  });

  $$(".settings-card-builder").forEach((card) => {
    card.addEventListener("click", () => {
      const action = card.dataset.builderAction;
      showToast(`Builder panel: ${action} (mock)`);
    });
  });
}

function initAccountSheet() {
  const btn = $("#btn-account");
  const backdrop = $("#account-sheet");
  const closeBtn = $("#btn-close-account");
  if (!btn || !backdrop || !closeBtn) return;

  const open = () => {
    backdrop.classList.remove("hidden");
    backdrop.setAttribute("aria-hidden", "false");
  };
  const close = () => {
    backdrop.classList.add("hidden");
    backdrop.setAttribute("aria-hidden", "true");
  };

  btn.addEventListener("click", () => {
    open();
    vibrate(10);
  });
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
}

function initRoleSheet() {
  const chip = $("#mesh-role-chip");
  const backdrop = $("#role-backdrop");
  const close = $("#role-close");
  const save = $("#save-role");
  if (!chip || !backdrop || !close || !save) return;

  let selectedRole = null;

  const open = () => backdrop.classList.remove("hidden");
  const hide = () => backdrop.classList.add("hidden");

  chip.addEventListener("click", () => {
    open();
    vibrate(10);
  });
  close.addEventListener("click", hide);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) hide();
  });

  $$(".role-card").forEach((card) => {
    card.addEventListener("click", () => {
      $$(".role-card").forEach((c) => c.classList.remove("is-active"));
      card.classList.add("is-active");
      selectedRole = card.dataset.role;
      save.disabled = !selectedRole;
    });
  });

  save.addEventListener("click", () => {
    if (!selectedRole) return;
    state.role = selectedRole;

    const labelEl = $("#meshRoleLabel");
    const iconEl = $("#meshRoleIcon");
    const mapping = {
      dev: { label: "Dev / Builder", icon: "🧪" },
      creator: { label: "Creator / Artist", icon: "🎨" },
      hunter: { label: "Alpha hunter / Trader", icon: "⚡" },
      collector: { label: "Collector / Fan", icon: "🎴" },
    };
    const cfg = mapping[selectedRole] || mapping.hunter;
    if (labelEl) labelEl.textContent = cfg.label;
    if (iconEl) iconEl.textContent = cfg.icon;

    showToast(`Role set to ${cfg.label}`);
    vibrate([20, 20, 20]);
    hide();
  });
}

function initStreak() {
  const btn = $("#btn-checkin");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (state.streakDays < state.weeklyTarget) {
      state.streakDays += 1;
    }
    const xpGain = 15;
    state.xp += xpGain;

    pushEvent(state.homeEvents, {
      kind: "xp",
      label: "XP",
      text: "Daily check-in ritual",
      time: formatTime(),
      meta: `+${xpGain} XP`,
    });

    renderMeshSnapshot();
    renderActivityList($("#homeActivityList"), state.homeEvents);
    showToast("Check-in complete · XP added");
    playSound("reward");
    vibrate([30, 20, 30]);
  });
}

function initSupcast() {
  const formBtn = $("#supcastSubmit");
  const feed = $("#supcastFeed");
  if (!formBtn || !feed) return;

  formBtn.addEventListener("click", () => {
    const ctxSel = $("#supcastContext");
    const titleEl = $("#supcastTitle");
    const tagsEl = $("#supcastTags");
    const descEl = $("#supcastDescription");

    const ctx = ctxSel ? ctxSel.value : "";
    const title = titleEl?.value || "Untitled question";
    const tags = tagsEl?.value || "";
    const desc = descEl?.value || "";

    const item = document.createElement("li");
    item.className = "supcast-item";
    item.innerHTML = `
      <div class="supcast-item-title">${title}</div>
      <div class="supcast-item-meta">${ctx} · ${tags}</div>
      <div class="supcast-item-body">${desc || "No description"}</div>
    `;
    feed.prepend(item);

    showToast("SupCast posted (mock)");
    vibrate(15);

    if (titleEl) titleEl.value = "";
    if (tagsEl) tagsEl.value = "";
    if (descEl) descEl.value = "";
  });
}

// -------------------------------------------------------
// BOOT
// -------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  initQuests();
  seedHomeEvents();
  seedMeshEvents();
  seedLootEvents();

  renderHeaderStats();
  renderMeshSnapshot();
  renderActivityList($("#homeActivityList"), state.homeEvents);
  renderActivityList($("#meshEvents"), state.meshEvents);
  renderInventory();

  setupTabs();
  setupLoot();
  initMarketModule();
  initMeshExplorer();
  initHoloHud();
  initInventorySlideout();
  initWallet();
  initSettingsSheet();
  initAccountSheet();
  initRoleSheet();
  initStreak();
  initSupcast();

  enhanceProfilePanel();
  applyCompactViewport();
});