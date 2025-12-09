// app.js — SpawnEngine 3.0 · Mesh HUD v0.4 (FULLY UPDATED FOR NEW HTML)

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

function formatTime() {
  const d = new Date();
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// Global pushEvent redirecting to mesh + home feed
function pushEvent(list, payload, max = 16) {
  list.unshift(payload);
  if (list.length > max) list.length = max;
  addMeshEventFromPayload(payload);
}
window.pushEvent = pushEvent;

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
  if (activeWalletsEl) activeWalletsEl.textContent = spawnAddress ? "1" : "0";
  if (activeWalletsStat) activeWalletsStat.textContent = spawnAddress ? "1" : "0";
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
    ...$$("[data-tab-target]")
  ];

  const panels = $$(".tab-panel");

  function activate(target) {
    if (!target) return;

    // 1) NAV STATE
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

    // 2) PANEL VISIBILITY
    panels.forEach((panel) => {
      const id = `tab-${target}`;
      const hit = panel.id === id;
      panel.classList.toggle("tab-panel-active", hit);
      panel.style.display = hit ? "block" : "none";
    });

    // 3) RENDER ON TAB ENTER
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

      case "supcast":
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

    // 4) RE-CALC HEIGHT (critical for compact layout)
    requestAnimationFrame(applyCompactViewport);
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target =
        btn.dataset.tab ||
        btn.getAttribute("data-tab-target");
      activate(target);
    });
  });

  // Default tab
  activate("home");
}

// -------------------------------------------------------
// VIEWPORT / COMPACT LAYOUT ENGINE
// -------------------------------------------------------

function applyCompactViewport() {
  const root = document.documentElement;
  const header = document.querySelector(".mesh-header");
  const nav = document.querySelector(".mesh-nav-scroll");
  const activePanel = document.querySelector(".tab-panel-active");

  if (!header || !nav || !activePanel) return;

  const headerH = header.offsetHeight || 0;
  const navH = nav.offsetHeight || 0;
  const viewport = window.innerHeight;

  // Magic number: margins/padding of app root
  const chrome = 26;

  const panelMax = viewport - headerH - navH - chrome;
  activePanel.style.maxHeight = `${panelMax}px`;
  activePanel.style.overflowY = "auto";
}

// Auto reapply on resize / keyboard open / rotation
window.addEventListener("resize", applyCompactViewport);
window.addEventListener("orientationchange", applyCompactViewport);
document.addEventListener("DOMContentLoaded", applyCompactViewport);

// -------------------------------------------------------
// QUICK NAV / BOTTOM BAR AUTOFIX
// -------------------------------------------------------

function dedupeBottomNav() {
  const navs = document.querySelectorAll(".bottom-nav");
  if (navs.length > 1) {
    navs.forEach((n, i) => {
      if (i > 0) n.remove();
    });
  }
}

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

// Run after initial UI mount
document.addEventListener("DOMContentLoaded", enhanceProfilePanel);

// -------------------------------------------------------
// LOOT ENGINE 2.0 — Fragments / Shards / Relics / Packs
// -------------------------------------------------------

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

  // ----------------------------------------------
  // PACK OPEN  (mock but upgraded for next-gen UX)
  // ----------------------------------------------

  const packBtn = $("#btn-open-pack");
  if (packBtn) {
    packBtn.addEventListener("click", () => {
      const wallet = spawnAddress || "demo-wallet";
      const priceEth = 0.02;

      // Random loot formula — now tuned for visual variation
      const gainedFragments = 2 + Math.floor(Math.random() * 4);
      const gainedShards = Math.random() < 0.35 ? 1 : 0;
      const relicDrop = Math.random() < 0.06 ? 1 : 0; 
      const xpGain = 30 + Math.floor(Math.random() * 50);

      state.fragments += gainedFragments;
      state.shards += gainedShards;
      state.relics += relicDrop;
      state.xp += xpGain;

      // Save pack stats to local storage
      registerPackOpen("starter_mesh_pack", wallet, priceEth);

      const summary = `+${gainedFragments}F  ${
        gainedShards ? `+${gainedShards}S ` : ""
      }${relicDrop ? `+${relicDrop}R ` : ""}`;

      // LOOT EVENT
      pushEvent(state.lootEvents, {
        kind: "pack",
        label: "PACK",
        text: `Starter pack opened → ${summary}`,
        time: formatTime(),
        meta: `+${xpGain} XP · ${priceEth} ETH`,
      });

      // HOME FEED MIRROR
      pushEvent(state.homeEvents, {
        kind: "pack",
        label: "PACK",
        text: "Pack synced into your mesh orbit.",
        time: formatTime(),
        meta: `+${xpGain} XP`,
      });

      // QUEST COMPLETE?
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
  });

  // ----------------------------------------------
  // SYNTH / LAB — Create Relic (Fragments → Shards → Relics)
  // ----------------------------------------------

  const synthBtn = $("#btn-simulate-synth");
  const labResult = $("#labResult");

  if (synthBtn && labResult) {
    synthBtn.addEventListener("click", () => {
      // Requirements for crafting (mock)
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
      applyCompactViewport();
    });
  }
}

// -------------------------------------------------------
// INVENTORY — Compact UI Rendering
// -------------------------------------------------------

function renderInventory() {
  const f = $("#invFragments");
  const s = $("#invShards");
  const r = $("#invRelics");

  if (f) f.textContent = state.fragments;
  if (s) s.textContent = state.shards;
  if (r) r.textContent = state.relics;

  // Optional: Auto-update compact bars later
}

// -------------------------------------------------------
// MARKET ENGINE 2.0 — Listings · Filters · Popup Details
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

// -------------------------------------------------------
// RENDER MARKET LIST
// -------------------------------------------------------

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

  // Wire popup openers
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

// -------------------------------------------------------
// MARKET FILTERS
// -------------------------------------------------------

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

// -------------------------------------------------------
// POPUP DETAILS
// -------------------------------------------------------

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

// -------------------------------------------------------
// INITIALIZE MARKET
// -------------------------------------------------------

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
let meshMode = "gravity"; // default
let meshAnimFrame = null;

// Node presets per mode
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

// -------------------------------------------------------
// NODE + LINK GENERATION
// -------------------------------------------------------

function initMeshGraph() {
  meshCanvas = document.getElementById("meshCanvas");
  if (!meshCanvas) return;
  meshCtx = meshCanvas.getContext("2d");

  resizeMeshCanvas();

  // Generate 60 nodes
  meshNodes = Array.from({ length: 60 }).map(() => ({
    x: Math.random() * meshCanvas.width,
    y: Math.random() * meshCanvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    pulse: Math.random() * Math.PI * 2,
  }));

  // Generate links
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
  meshCanvas.width = meshCanvas.clientWidth * window.devicePixelRatio;
  meshCanvas.height = meshCanvas.clientHeight * window.devicePixelRatio;
  if (meshCtx) {
    meshCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
}

// -------------------------------------------------------
// ADD NODES FROM UNIFIED MESH STREAM
// -------------------------------------------------------

function addMeshNode(evt) {
  if (!meshNodes.length) return;

  const w = meshCanvas.width / window.devicePixelRatio;
  const h = meshCanvas.height / window.devicePixelRatio;

  meshNodes.push({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    pulse: Math.random() * Math.PI * 2,
    highlight: evt.kind === "pack" ? "gold" : evt.kind === "xp" ? "purple" : null,
  });

  // Keep graph size reasonable
  if (meshNodes.length > 80) meshNodes.shift();
}

// -------------------------------------------------------
// DRAWING
// -------------------------------------------------------

function drawMesh() {
  const preset = MESH_PRESETS[meshMode] || MESH_PRESETS.gravity;

  meshCtx.clearRect(0, 0, meshCanvas.width, meshCanvas.height);

  // Draw links first
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

  // Draw nodes
  meshNodes.forEach((n) => {
    n.pulse += preset.pulseSpeed;
    const pulsedSize = preset.size + Math.sin(n.pulse) * 1.5;

    if (n.highlight) {
      meshCtx.fillStyle =
        n.highlight === "gold" ? "rgba(255,200,60,0.9)" : "rgba(200,60,255,0.9)";
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

// -------------------------------------------------------
// ANIMATION LOOP
// -------------------------------------------------------

function animateMeshGraph() {
  const preset = MESH_PRESETS[meshMode] || MESH_PRESETS.gravity;

  meshNodes.forEach((n) => {
    n.x += n.vx;
    n.y += n.vy;

    // bounce
    if (n.x < 0 || n.x > meshCanvas.width / window.devicePixelRatio) n.vx *= -1;
    if (n.y < 0 || n.y > meshCanvas.height / window.devicePixelRatio) n.vy *= -1;
  });

  drawMesh();
  meshAnimFrame = requestAnimationFrame(animateMeshGraph);
}

// -------------------------------------------------------
// MODE SWITCHING
// -------------------------------------------------------

function setMeshMode(mode) {
  meshMode = mode;
  showToast(`Mesh mode → ${mode}`);
}

// -------------------------------------------------------
// INIT + HOOKS
// -------------------------------------------------------

function initMeshExplorer() {
  initMeshGraph();

  window.addEventListener("resize", () => {
    resizeMeshCanvas();
  });

  // Buttons in UI
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
// DEL 7 — HOLO HUD & MICRO-PANELS
// Neon gas ring • XP pulse • Inventory slide-out
// -------------------------------------------------------

// ---------- HOLO HUD STATE ----------
let holoHudTick = 0;
let gasPulseValue = 0.2; 
let xpPulse = 0;

// ---------- CREATE HOLO HUD DOM ----------
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

// ---------- GAS RING DRAWING ----------
function drawGasRing(value) {
  const canvas = document.getElementById("gasRing");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const center = 45;
  const radius = 34;
  const start = -Math.PI / 2;
  const end = start + value * Math.PI * 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background ring
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(40,50,90,0.5)";
  ctx.lineWidth = 8;
  ctx.stroke();

  // neon ring
  ctx.beginPath();
  ctx.arc(center, center, radius, start, end);
  ctx.strokeStyle = "rgba(52,255,240,0.9)";
  ctx.lineWidth = 8;
  ctx.shadowBlur = 14;
  ctx.shadowColor = "rgba(52,255,240,0.9)";
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// ---------- UPDATE HOLO HUD ----------
function updateHoloHud() {
  const gasValEl = document.getElementById("gasRingValue");
  const xpEl = document.getElementById("holoXpLabel");
  const xpFill = document.getElementById("holoXpFill");

  // Fake gas jitter (syncs with header)
  const base = 0.19;
  const jitter = Math.random() * 0.04;
  gasPulseValue = base + jitter;

  if (gasValEl) gasValEl.textContent = `${gasPulseValue.toFixed(2)} gwei`;

  drawGasRing(Math.min(gasPulseValue / 1.0, 1));

  // XP Pulse Fill
  xpPulse += 0.02;
  const xpRatio = (state.xp % 100) / 100;
  const wave = Math.sin(xpPulse) * 0.05;
  const final = Math.min(Math.max(xpRatio + wave, 0), 1);

  if (xpFill) xpFill.style.width = `${final * 100}%`;
  if (xpEl) xpEl.textContent = `${state.xp} XP`;
}

// animate
setInterval(updateHoloHud, 800);

// -------------------------------------------------------
// MICRO-PANEL: INVENTORY SLIDEOUT
// -------------------------------------------------------

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
