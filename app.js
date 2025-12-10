// app.js — SpawnEngine · Mesh HUD v0.4 (mock logic)

// ---------------------------
// TOAST
// ---------------------------
const toastEl = document.getElementById("toast");

window.spawnToast = function (msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2100);
};

// ---------------------------
// HELPERS
// ---------------------------
function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------
// STATE (mock/demo)
// ---------------------------
const state = {
  wallet: {
    connected: false,
    address: null,
    balanceEth: 0.0,
  },
  streak: {
    days: 1,
    lastCheck: null,
  },
  xp: 1575,
  spawn: 497,
  inventory: {
    fragments: 12,
    shards: 3,
    relics: 1,
  },
  activeRole: "creator",
  marketItems: [],
};

// ---------------------------
// LOCALSTORAGE KEYS
// ---------------------------
const LS_KEYS = {
  STREAK: "se_mesh_streak_v1",
  ROLE: "se_mesh_role_v1",
};

// ---------------------------
// INIT STREAK (LOCALSTORAGE)
// ---------------------------
function loadStreak() {
  try {
    const raw = localStorage.getItem(LS_KEYS.STREAK);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed) return;
    state.streak.days = parsed.days || 1;
    state.streak.lastCheck = parsed.lastCheck || null;
  } catch {
    // ignore
  }
}

function saveStreak() {
  try {
    localStorage.setItem(
      LS_KEYS.STREAK,
      JSON.stringify({
        days: state.streak.days,
        lastCheck: state.streak.lastCheck,
      })
    );
  } catch {
    // ignore
  }
}

function loadRole() {
  try {
    const raw = localStorage.getItem(LS_KEYS.ROLE);
    if (!raw) return;
    state.activeRole = raw;
  } catch {
    // ignore
  }
}

function saveRole() {
  try {
    localStorage.setItem(LS_KEYS.ROLE, state.activeRole);
  } catch {
    // ignore
  }
}

// ---------------------------
// UI BINDINGS
// ---------------------------
const btnConnect = $("#btn-connect");
const walletStatusLabel = $("#wallet-status-label");
const walletAddressEls = $all("[data-wallet-address]");
const walletBalanceEthEl = $("#walletBalanceEth");
const xpBalanceEl = $("#xpBalance");
const spawnBalanceEl = $("#spawnBalance");
const activeWalletsEl = $("#activeWallets");
const activeWalletsStatEl = $("#activeWalletsStat");

// streak
const streakDaysEl = $("#streakDays");
const streakRemainingEl = $("#streakRemaining");
const streakBarFillEl = $("#streakBarFill");
const streakCopyTextEl = $("#streakCopyText");
const btnCheckin = $("#btn-checkin");

// nav
const meshNav = $("#meshNav");
const tabButtons = $all(".mesh-nav-btn");
const tabPanels = $all(".tab-panel");

// loot
const lootViewEls = $all(".loot-view");
const lootViewButtons = $all("[data-loot-view]");
const lootEventsList = $("#lootEvents");
const btnOpenPack = $("#btn-open-pack");
const btnSynth = $("#btn-simulate-synth");
const labResultEl = $("#labResult");
const invFragmentsEl = $("#invFragments");
const invShardsEl = $("#invShards");
const invRelicsEl = $("#invRelics");

// home activity
const homeActivityList = $("#homeActivityList");

// market
const marketFilters = $all(".market-filter-chip");
const marketGrid = $("#marketGrid");
const marketEmptyEl = $("#marketEmpty");
const marketDetailsBackdrop = $("#marketDetailsBackdrop");
const marketDetailsTitleEl = $("#marketDetailsTitle");
const marketDetailsBodyEl = $("#marketDetailsBody");
const marketDetailsBackBtn = $("#marketDetailsBack");

// quests
const questListEl = $("#questList");

// mesh
const meshModeButtons = $all("[data-mesh-mode]");
const meshEventsList = $("#meshEvents");

// settings sheet
const settingsBtn = $("#settings-btn");
const settingsBackdrop = $("#settings-backdrop");
const settingsClose = $("#settings-close");
const meshRolePill = $("#meshRolePill");
const roleCards = $all(".role-card");
const saveRoleBtn = $("#save-role");

// ---------------------------
// MOCK DATA
// ---------------------------
const MOCK_HOME_EVENTS = [
  {
    tag: "XP",
    text: "You completed a daily ritual (mock).",
    sub: "XP +25 · Mesh streak updated",
  },
  {
    tag: "PACK",
    text: "Opened a Starter mesh pack (mock).",
    sub: "3x Fragments, 1x Rare shard",
  },
  {
    tag: "ZORA",
    text: "Minted a SpawnEngine test-card (mock).",
    sub: "WarpAI · Base chain",
  },
];

const MOCK_QUESTS = [
  {
    id: "q_daily_ritual",
    title: "Daily ritual · Check-in",
    sub: "Öppna appen och checka streaken minst 1 gång idag.",
    xp: 25,
    type: "daily",
  },
  {
    id: "q_loot_pack",
    title: "Open a mesh pack",
    sub: "Simulera en pack-open i Loot & Pull Lab.",
    xp: 40,
    type: "loot",
  },
  {
    id: "q_supcast",
    title: "SupCast feedback",
    sub: "Öppna SupCast-tabben och lämna första frågan (mock).",
    xp: 60,
    type: "supcast",
  },
  {
    id: "q_market",
    title: "Browse market mesh",
    sub: "Filtrera runt i Mesh market och kolla minst 1 listing.",
    xp: 30,
    type: "market",
  },
];

const MOCK_MARKET = [
  {
    id: "m_pack_starter",
    type: "packs",
    title: "Starter Mesh Pack",
    price: "0.003 ETH",
    tag: "Packs",
    desc: "Basic 5-card pack med chans till Fragments, Shards & Relics (mock).",
    body: `
      <p>Den riktiga versionen är länkat mot VibeMarket / eget pack-kontrakt.</p>
      <ul>
        <li>5x slumpmässiga kort</li>
        <li>Chance på 1x Shard (rare)</li>
        <li>Chance på 1x Relic (mythic)</li>
      </ul>
    `,
  },
  {
    id: "m_token_spawn",
    type: "tokens",
    title: "SPN · SpawnEngine chip",
    price: "Offchain mock",
    tag: "Token",
    desc: "Demo-token som används för att visa XP/mesh-sync i UI.",
    body: `
      <p>Visas bara som mock i detta UI — ingen riktig token än.</p>
      <p>Plan: riktiga onchain SPN eller annan mesh-chip på Base.</p>
    `,
  },
  {
    id: "m_service_mesh_setup",
    type: "services",
    title: "Mesh setup session",
    price: "DM only",
    tag: "Service",
    desc: "Koncept: betald session för att sätta upp din egen SpawnEngine mesh.",
    body: `
      <p>Inte live nu — bara idée. UI visar att services kan ligga i samma grid.</p>
    `,
  },
  {
    id: "m_collectible_badge",
    type: "collectibles",
    title: "Founding Mesh Badge",
    price: "Future mint",
    tag: "Collectible",
    desc: "Tidig supporter-badge för första vågen av användare.",
    body: `
      <p>Badge kan kopplas mot pack-boost, XP-multipliers, osv.</p>
    `,
  },
];

const MOCK_MESH_EVENTS = [
  {
    tag: "MESH",
    text: "Gravity mode pingade 4 wallets (mock).",
    sub: "SpawnEngine core mesh simulerad.",
  },
  {
    tag: "ALPHA",
    text: "Alpha-mode tittade på senaste Vibe packs (mock).",
    sub: "Data kommer senare via riktiga APIs.",
  },
  {
    tag: "NEW",
    text: "New-wallet-scan kördes (mock).",
    sub: "Kollar efter nya Base-adresser i din mesh.",
  },
];

// ---------------------------
// RENDER FUNCTIONS
// ---------------------------
function renderWallet() {
  if (!walletStatusLabel) return;
  if (!state.wallet.connected) {
    walletStatusLabel.textContent = "Not connected";
    walletAddressEls.forEach((el) => (el.textContent = "Not connected"));
    if (walletBalanceEthEl) walletBalanceEthEl.textContent = "0.0000 ETH";
    if (activeWalletsEl) activeWalletsEl.textContent = "0";
    if (activeWalletsStatEl) activeWalletsStatEl.textContent = "0";
    return;
  }

  walletStatusLabel.textContent = "Connected (mock)";
  walletAddressEls.forEach((el) => (el.textContent = state.wallet.address));
  if (walletBalanceEthEl) {
    walletBalanceEthEl.textContent = `${state.wallet.balanceEth.toFixed(
      4
    )} ETH`;
  }
  if (activeWalletsEl) activeWalletsEl.textContent = "1";
  if (activeWalletsStatEl) activeWalletsStatEl.textContent = "1";
}

function renderXP() {
  if (xpBalanceEl) {
    xpBalanceEl.textContent = `${state.xp} XP`;
  }
}

function renderSpawn() {
  if (spawnBalanceEl) {
    spawnBalanceEl.textContent = `${state.spawn} SPN`;
  }
}

function renderStreak() {
  if (!streakDaysEl || !streakRemainingEl || !streakBarFillEl) return;
  const days = state.streak.days || 1;
  streakDaysEl.textContent = String(days);

  const goal = 7;
  const remaining = Math.max(0, goal - days);
  streakRemainingEl.textContent = String(remaining);

  const pct = Math.min(100, (days / goal) * 100);
  streakBarFillEl.style.width = `${pct}%`;

  if (streakCopyTextEl) {
    streakCopyTextEl.innerHTML = `Keep the streak for <span id="streakRemaining">${remaining}</span> more days for a full weekly run.`;
  }
}

function renderInventory() {
  if (invFragmentsEl)
    invFragmentsEl.textContent = String(state.inventory.fragments);
  if (invShardsEl) invShardsEl.textContent = String(state.inventory.shards);
  if (invRelicsEl) invRelicsEl.textContent = String(state.inventory.relics);
}

function renderHomeActivity(initial) {
  if (!homeActivityList) return;
  homeActivityList.innerHTML = "";

  const events = initial ? MOCK_HOME_EVENTS : MOCK_HOME_EVENTS.slice(0, 2);
  events.forEach((ev) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${ev.tag}</span>
      <div>${ev.text}</div>
      <div>${ev.sub}</div>
    `;
    homeActivityList.appendChild(li);
  });
}

function renderLootEvents(events) {
  if (!lootEventsList) return;
  lootEventsList.innerHTML = "";
  events.forEach((ev) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${ev.tag}</span>
      <div>${ev.text}</div>
      <div>${ev.sub}</div>
    `;
    lootEventsList.appendChild(li);
  });
}

function renderMarket(filter = "all") {
  if (!marketGrid) return;
  const items =
    filter === "all"
      ? state.marketItems
      : state.marketItems.filter((i) => i.type === filter);

  marketGrid.innerHTML = "";

  if (items.length === 0) {
    if (marketEmptyEl) marketEmptyEl.style.display = "block";
    return;
  }
  if (marketEmptyEl) marketEmptyEl.style.display = "none";

  items.forEach((item) => {
    const card = document.createElement("button");
    card.className = "market-card";
    card.setAttribute("data-market-id", item.id);
    card.innerHTML = `
      <div class="market-card-header-row">
        <div class="market-card-icon">💠</div>
        <span class="market-tag">${item.tag}</span>
      </div>
      <h4>${item.title}</h4>
      <p class="market-card-desc">${item.desc}</p>
      <div class="market-card-footer">
        <span class="market-card-price">${item.price}</span>
        <span class="market-card-participants">Demo listing</span>
      </div>
    `;
    marketGrid.appendChild(card);
  });
}

function renderMeshEvents() {
  if (!meshEventsList) return;
  meshEventsList.innerHTML = "";
  MOCK_MESH_EVENTS.forEach((ev) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${ev.tag}</span>
      <div>${ev.text}</div>
      <div>${ev.sub}</div>
    `;
    meshEventsList.appendChild(li);
  });
}

function renderQuests() {
  if (!questListEl) return;
  questListEl.innerHTML = "";

  MOCK_QUESTS.forEach((q) => {
    const li = document.createElement("li");
    li.className = "quest-item";
    li.setAttribute("data-quest-id", q.id);

    li.innerHTML = `
      <div class="quest-main">
        <div class="quest-title">${q.title}</div>
        <div class="quest-sub">${q.sub}</div>
      </div>
      <div class="quest-right">
        <div class="quest-meta">+${q.xp} XP</div>
        <button class="btn-outline quest-btn" type="button">Mark as done (mock)</button>
      </div>
    `;

    questListEl.appendChild(li);
  });
}

// ---------------------------
// NAV / TABS
// ---------------------------
function setActiveTab(tabId) {
  tabButtons.forEach((btn) => {
    const isActive = btn.getAttribute("data-tab") === tabId;
    btn.classList.toggle("is-active", isActive);
  });

  tabPanels.forEach((panel) => {
    const isActive = panel.id === `tab-${tabId}`;
    panel.classList.toggle("tab-panel-active", isActive);
  });
}

function initTabs() {
  if (!meshNav) return;
  meshNav.addEventListener("click", (e) => {
    const btn = e.target.closest(".mesh-nav-btn");
    if (!btn) return;
    const tabId = btn.getAttribute("data-tab");
    if (!tabId) return;

    setActiveTab(tabId);

    if (tabId === "market") {
      renderMarket("all");
    } else if (tabId === "mesh") {
      renderMeshEvents();
    } else if (tabId === "quests") {
      renderQuests();
    }
  });
}

// ---------------------------
// WALLET CONNECT (MOCK)
// ---------------------------
function randomMockAddress() {
  const chars = "abcdef0123456789";
  let addr = "0x";
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

function handleConnectClick() {
  if (!state.wallet.connected) {
    state.wallet.connected = true;
    state.wallet.address = randomMockAddress();
    state.wallet.balanceEth = 0.1234 + Math.random() * 0.3;
    renderWallet();
    window.spawnToast("Connected (mock) – riktig wallet sen.");
  } else {
    state.wallet.connected = false;
    state.wallet.address = null;
    state.wallet.balanceEth = 0;
    renderWallet();
    window.spawnToast("Disconnected wallet (mock).");
  }
}

// ---------------------------
// STREAK LOGIC
// ---------------------------
function isSameDay(a, b) {
  return a === b;
}

function isYesterday(lastStr) {
  if (!lastStr) return false;
  const last = new Date(lastStr);
  const now = new Date();
  const diff =
    (Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ) -
      Date.UTC(
        last.getFullYear(),
        last.getMonth(),
        last.getDate()
      )) /
    (1000 * 60 * 60 * 24);
  return diff === 1;
}

function handleCheckin() {
  const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const last = state.streak.lastCheck;

  if (last && isSameDay(last, todayStr)) {
    window.spawnToast("Du har redan checkat in idag (mock).");
    return;
  }

  if (last && isYesterday(last)) {
    state.streak.days += 1;
  } else {
    state.streak.days = 1;
  }

  state.streak.lastCheck = todayStr;
  state.xp += 25;
  renderStreak();
  renderXP();
  saveStreak();

  window.spawnToast("Daily ritual check-in klar · XP +25 (mock).");
  appendHomeEvent({
    tag: "XP",
    text: "Daily ritual check-in (mock).",
    sub: "XP +25 · streak updated",
  });
}

function appendHomeEvent(ev) {
  if (!homeActivityList) return;
  const li = document.createElement("li");
  li.innerHTML = `
    <span>${ev.tag}</span>
    <div>${ev.text}</div>
    <div>${ev.sub}</div>
  `;
  homeActivityList.prepend(li);
}

// ---------------------------
// LOOT LOGIC
// ---------------------------
const lootEventsState = [];

function initLoot() {
  renderLootEvents(lootEventsState);
  renderInventory();
}

function setActiveLootView(viewId) {
  lootViewButtons.forEach((btn) => {
    const active = btn.getAttribute("data-loot-view") === viewId;
    btn.classList.toggle("segmented-btn-active", active);
  });
  lootViewEls.forEach((view) => {
    const active = view.id === `lootView-${viewId}`;
    view.classList.toggle("loot-view-active", active);
  });
}

function handleLootSegmentClick(e) {
  const btn = e.target.closest("[data-loot-view]");
  if (!btn) return;
  const viewId = btn.getAttribute("data-loot-view");
  setActiveLootView(viewId);
}

function handleOpenPack() {
  const pulls = [
    "3x Common Fragments",
    "1x Rare Shard",
    "1x Relic (mythic)",
    "2x Fragments + 2x Shards",
  ];
  const result = randomChoice(pulls);

  state.inventory.fragments += 1;
  if (result.includes("Shard")) state.inventory.shards += 1;
  if (result.includes("Relic")) state.inventory.relics += 1;

  const event = {
    tag: "PACK",
    text: "Opened Starter mesh pack (mock).",
    sub: result,
  };
  lootEventsState.unshift(event);
  renderLootEvents(lootEventsState);
  renderInventory();

  appendHomeEvent({
    tag: "PACK",
    text: "Loot pull i SpawnEngine (mock).",
    sub: result,
  });

  window.spawnToast("Pack open simulerad · inventory uppdaterad (mock).");
}

function handleSynth() {
  if (state.inventory.fragments < 3 || state.inventory.shards < 1) {
    labResultEl.textContent =
      "Du behöver minst 3 Fragments + 1 Shard för att crafta en Relic (mock).";
    return;
  }
  state.inventory.fragments -= 3;
  state.inventory.shards -= 1;
  state.inventory.relics += 1;
  renderInventory();

  const roll = Math.random();
  let flavor;
  if (roll > 0.85) {
    flavor = "Mythic-tier Relic (demo, ingen riktig rarity än).";
  } else if (roll > 0.55) {
    flavor = "Rare Relic med bättre mesh-boost (mock).";
  } else {
    flavor = "Common Relic – men fortfarande nice i din mesh.";
  }

  labResultEl.textContent = `Craft lyckades · ${flavor}`;
  window.spawnToast("Relic craftad i Pull Lab (mock).");
}

// ---------------------------
// MARKET LOGIC
// ---------------------------
function initMarket() {
  state.marketItems = MOCK_MARKET;
  renderMarket("all");
}

function handleMarketFilterClick(e) {
  const btn = e.target.closest(".market-filter-chip");
  if (!btn) return;
  const filter = btn.getAttribute("data-filter");

  marketFilters.forEach((b) =>
    b.classList.toggle("is-active", b === btn)
  );
  renderMarket(filter);
}

function handleMarketCardClick(e) {
  const card = e.target.closest(".market-card");
  if (!card) return;
  const id = card.getAttribute("data-market-id");
  const item = state.marketItems.find((i) => i.id === id);
  if (!item) return;

  if (!marketDetailsBackdrop || !marketDetailsTitleEl || !marketDetailsBodyEl)
    return;

  marketDetailsTitleEl.textContent = item.title;
  marketDetailsBodyEl.innerHTML = `
    <p><strong>Type:</strong> ${item.tag}</p>
    <p><strong>Price:</strong> ${item.price}</p>
    <div class="market-details-body">${item.body}</div>
    <p class="market-details-foot">
      I riktig app: klick här skulle gå till VibeMarket / Zora / kontrakt.
    </p>
  `;
  marketDetailsBackdrop.classList.add("visible");

  window.spawnToast("Öppnar market listing (mock).");
}

function closeMarketDetails() {
  if (!marketDetailsBackdrop) return;
  marketDetailsBackdrop.classList.remove("visible");
}

// ---------------------------
// QUESTS LOGIC
// ---------------------------
function handleQuestClick(e) {
  const btn = e.target.closest(".quest-btn");
  if (!btn) return;

  const li = btn.closest(".quest-item");
  if (!li) return;

  const id = li.getAttribute("data-quest-id");
  const quest = MOCK_QUESTS.find((q) => q.id === id);
  if (!quest) return;

  // Mark as done (one-shot, mock)
  btn.textContent = "Completed (mock)";
  btn.classList.add("quest-btn-completed");
  btn.disabled = true;

  state.xp += quest.xp;
  renderXP();

  appendHomeEvent({
    tag: "QUEST",
    text: `Quest completed: ${quest.title}`,
    sub: `+${quest.xp} XP (mock).`,
  });

  window.spawnToast(`Quest klar · +${quest.xp} XP (mock).`);
}

// ---------------------------
// MESH MODE LOGIC
// ---------------------------
function handleMeshModeClick(e) {
  const btn = e.target.closest("[data-mesh-mode]");
  if (!btn) return;

  const mode = btn.getAttribute("data-mesh-mode");
  meshModeButtons.forEach((b) =>
    b.classList.toggle("segmented-btn-active", b === btn)
  );

  if (mode === "gravity") {
    window.spawnToast("Mesh mode: Gravity (mock).");
  } else if (mode === "alpha") {
    window.spawnToast("Mesh mode: Alpha scan (mock).");
  } else if (mode === "new") {
    window.spawnToast("Mesh mode: New wallets (mock).");
  }
}

// ---------------------------
// SETTINGS & ROLE
// ---------------------------
function openSettings() {
  if (!settingsBackdrop) return;
  settingsBackdrop.classList.add("visible");
}

function closeSettings() {
  if (!settingsBackdrop) return;
  settingsBackdrop.classList.remove("visible");
}

function updateRoleUI() {
  roleCards.forEach((card) => {
    const role = card.getAttribute("data-role");
    card.classList.toggle("active", role === state.activeRole);
  });

  if (meshRolePill) {
    if (state.activeRole === "dev") {
      meshRolePill.textContent = "Dev / Builder";
    } else if (state.activeRole === "hunter") {
      meshRolePill.textContent = "Alpha hunter / Trader";
    } else if (state.activeRole === "collector") {
      meshRolePill.textContent = "Collector / Fan";
    } else {
      meshRolePill.textContent = "Creator / Artist";
    }
  }
}

function handleRoleCardClick(e) {
  const card = e.target.closest(".role-card");
  if (!card) return;
  const role = card.getAttribute("data-role");
  state.activeRole = role;
  updateRoleUI();
  if (saveRoleBtn) saveRoleBtn.disabled = false;
}

function handleSaveRole() {
  saveRole();
  if (saveRoleBtn) saveRoleBtn.disabled = true;
  window.spawnToast("Role saved locally (mock).");
}

// ---------------------------
// SUPCAST INIT
// ---------------------------
function initSupcastIfAvailable() {
  if (typeof window.initSupcast === "function") {
    window.initSupcast();
  }
}

// ---------------------------
// INIT APP
// ---------------------------
function initApp() {
  // state
  loadStreak();
  loadRole();
  state.marketItems = MOCK_MARKET;

  // render initial
  renderWallet();
  renderXP();
  renderSpawn();
  renderStreak();
  renderInventory();
  renderHomeActivity(true);
  initLoot();
  initMarket();
  renderQuests();
  renderMeshEvents();
  updateRoleUI();

  // events
  if (btnConnect) {
    btnConnect.addEventListener("click", handleConnectClick);
  }

  if (btnCheckin) {
    btnCheckin.addEventListener("click", handleCheckin);
  }

  if (meshNav) {
    initTabs();
  }

  if (lootViewButtons.length) {
    lootViewButtons.forEach((btn) =>
      btn.addEventListener("click", handleLootSegmentClick)
    );
  }

  if (btnOpenPack) {
    btnOpenPack.addEventListener("click", handleOpenPack);
  }

  if (btnSynth && labResultEl) {
    btnSynth.addEventListener("click", handleSynth);
  }

  if (marketFilters.length) {
    marketFilters.forEach((btn) =>
      btn.addEventListener("click", handleMarketFilterClick)
    );
  }

  if (marketGrid) {
    marketGrid.addEventListener("click", handleMarketCardClick);
  }

  if (marketDetailsBackBtn) {
    marketDetailsBackBtn.addEventListener("click", closeMarketDetails);
  }

  if (marketDetailsBackdrop) {
    marketDetailsBackdrop.addEventListener("click", (e) => {
      if (e.target === marketDetailsBackdrop) closeMarketDetails();
    });
  }

  if (questListEl) {
    questListEl.addEventListener("click", handleQuestClick);
  }

  if (meshModeButtons.length) {
    meshModeButtons.forEach((btn) =>
      btn.addEventListener("click", handleMeshModeClick)
    );
  }

  if (settingsBtn) {
    settingsBtn.addEventListener("click", openSettings);
  }

  if (settingsClose) {
    settingsClose.addEventListener("click", closeSettings);
  }

  if (settingsBackdrop) {
    settingsBackdrop.addEventListener("click", (e) => {
      if (e.target === settingsBackdrop) closeSettings();
    });
  }

  if (roleCards.length) {
    roleCards.forEach((card) =>
      card.addEventListener("click", handleRoleCardClick)
    );
  }

  if (saveRoleBtn) {
    saveRoleBtn.addEventListener("click", handleSaveRole);
  }

  // SupCast
  initSupcastIfAvailable();
}

document.addEventListener("DOMContentLoaded", initApp);