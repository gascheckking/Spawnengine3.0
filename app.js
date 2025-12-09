// app.js — SpawnEngine3.0 · Mesh HUD v0.4 (Modulkompatibel)
// Förbättrad version med korrigerad rollmappning, modulhantering,
// fungerande Loot-pack-open och Market-details-koppling.

// ---------- ONCHAIN CONFIG ----------

const SPAWN_CONFIG = {
  RPC_URL: "https://mainnet.base.org", // public Base RPC
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
  role: "hunter", // legacy; aktuell roll hämtas via localStorage
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

// expose for SupCast / other scripts
window.spawnToast = showToast;

function formatTime() {
  const d = new Date();
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function pushEvent(list, payload, max = 16) {
  list.unshift(payload);
  if (list.length > max) list.length = max;
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
    const remaining = Math.max(state.weeklyTarget - state.streakDays, 0);
    streakRemEl.textContent = remaining;
  }
  if (streakCopyEl) {
    const remaining = Math.max(state.weeklyTarget - state.streakDays, 0);
    streakCopyEl.textContent = `Keep the streak for ${remaining} more days for a full weekly run.`;
  }
  if (streakBarFill) {
    const progress = (state.streakDays / state.weeklyTarget) * 100;
    streakBarFill.style.width = `${Math.min(progress, 100)}%`;
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

// ---------- INTERACTION (TABS / LOOT / MESH / STREAK) ----------

function setupTabs() {
  const navButtons = $$("[data-tab-target]");
  const panels = $$(".tab-panel");

  function activate(target) {
    navButtons.forEach((btn) => {
      const t = btn.getAttribute("data-tab-target");
      btn.classList.toggle("nav-btn-active", t === target);
    });

    panels.forEach((panel) => {
      panel.classList.toggle("tab-panel-active", panel.id === `tab-${target}`);
    });

    if (target === "home") {
      renderActivityList($("#homeActivityList"), state.homeEvents);
    } else if (target === "loot") {
      renderInventory();
      renderActivityList($("#lootEvents"), state.lootEvents);
    } else if (target === "quests") {
      renderQuests();
    } else if (target === "mesh") {
      renderActivityList($("#meshEvents"), state.meshEvents);
    } else if (target === "support") {
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
    }
    // MARKNADSFLIKEN HAR OFTA EGNA MODULER/RENDER FUNKTIONER SOM ANROPAS HÄR OM DE ÄR LAZY-LADDADE
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab-target");
      if (!target) return;
      activate(target);
    });
  });

  activate("home");
}

function setupStreak() {
  const btn = $("#btn-checkin");
  if (!btn) return;

  btn.addEventListener("click", () => {
    state.streakDays = Math.min(state.streakDays + 1, state.weeklyTarget);
    const gained = 15;
    state.xp += gained;

    pushEvent(state.homeEvents, {
      kind: "xp",
      label: "XP",
      text: "Daily mesh ritual check-in completed.",
      time: formatTime(),
      meta: `+${gained} XP`,
    });

    renderMeshSnapshot();
    renderActivityList($("#homeActivityList"), state.homeEvents);
    showToast("Check-in logged · streak +1");
  });
}

// ---------- PACK STATS (LOCAL STORAGE) ----------

const PACK_STATS_KEY = "spawnengine_pack_stats";

let packStats = loadPackStats();

function loadPackStats() {
  try {
    const raw = localStorage.getItem(PACK_STATS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function savePackStats() {
  localStorage.setItem(PACK_STATS_KEY, JSON.stringify(packStats));
}

// Kallas varje gång ett pack öppnas
function registerPackOpen(seriesId, wallet, priceEth) {
  const now = Date.now();
  const hour = Math.floor(now / (1000 * 60 * 60));
  const day = Math.floor(now / (1000 * 60 * 60 * 24));
  const week = Math.floor(now / (1000 * 60 * 60 * 24 * 7));

  if (!packStats[seriesId]) {
    packStats[seriesId] = {
      potEth: 0,
      opensHour: {},
      opensDay: {},
      opensWeek: {},
      topCurrentHour: null,
      topCurrentDay: null,
      topCurrentWeek: null,
    };
  }

  const s = packStats[seriesId];

  // lägg till potten (1%)
  s.potEth += priceEth * 0.01;

  // track hourly
  s.opensHour[hour] = s.opensHour[hour] || {};
  s.opensHour[hour][wallet] = (s.opensHour[hour][wallet] || 0) + 1;

  // track daily
  s.opensDay[day] = s.opensDay[day] || {};
  s.opensDay[day][wallet] = (s.opensDay[day][wallet] || 0) + 1;

  // track weekly
  s.opensWeek[week] = s.opensWeek[week] || {};
  s.opensWeek[week][wallet] = (s.opensWeek[week][wallet] || 0) + 1;

  savePackStats();
}

function setupLoot() {
  const segButtons = $$("[data-loot-view]");
  const views = $$(".loot-view");

  segButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-loot-view");
      if (!view) return;

      segButtons.forEach((b) =>
        b.classList.toggle("segmented-btn-active", b === btn)
      );
      views.forEach((v) => {
        v.classList.toggle("loot-view-active", v.id === `lootView-${view}`);
      });

      if (view === "inventory") renderInventory();
    });
  });

  // PACK-OPEN MOCK (Simulate pack open-knappen i Loot)
  const packBtn = $("#btn-open-pack");
  if (packBtn) {
    packBtn.addEventListener("click", () => {
      // mock data för drags
      const wallet = spawnAddress || "demo-wallet";
      const priceEth = 0.02; // mock kostnad
      const gainedFragments = 2 + Math.floor(Math.random() * 4); // 2–5
      const gainedShards = Math.random() < 0.3 ? 1 : 0;
      const xpGain = 30 + Math.floor(Math.random() * 30); // 30–59 XP

      state.fragments += gainedFragments;
      state.shards += gainedShards;
      state.xp += xpGain;

      registerPackOpen("starter_mesh_pack", wallet, priceEth);

      const summary = `Starter mesh pack → +${gainedFragments} Fragments${
        gainedShards ? `, +${gainedShards} Shard` : ""
      }`;

      pushEvent(state.lootEvents, {
        kind: "pack",
        label: "PACK",
        text: summary,
        time: formatTime(),
        meta: `+${xpGain} XP · ${priceEth} ETH`,
      });

      pushEvent(state.homeEvents, {
        kind: "pack",
        label: "PACK",
        text: "Pack open synced into your mesh orbit.",
        time: formatTime(),
        meta: `+${xpGain} XP`,
      });

      // koppla till quest "q-pack" om den inte är klar
      const q = state.quests.find((q) => q.id === "q-pack");
      if (q && !q.completed) {
        q.completed = true;
        state.xp += q.reward;
        pushEvent(state.homeEvents, {
          kind: "quest",
          label: "QUEST",
          text: "Quest completed: Open a starter mesh pack",
          time: formatTime(),
          meta: `+${q.reward} XP`,
        });
      }

      renderMeshSnapshot();
      renderInventory();
      renderActivityList($("#lootEvents"), state.lootEvents);
      renderActivityList($("#homeActivityList"), state.homeEvents);
      renderQuests();
      showToast("Simulated pack open · loot & XP updated");
    });
  }

  const synthBtn = $("#btn-simulate-synth");
  const labResult = $("#labResult");
  if (synthBtn && labResult) {
    synthBtn.addEventListener("click", () => {
      if (state.fragments < 5 || state.shards < 1) {
        labResult.textContent =
          "Not enough Fragments/Shards to synth a Relic (mock requirement: 5F + 1S).";
        return;
      }

      state.fragments -= 5;
      state.shards -= 1;
      state.relics += 1;
      const xpGain = 80;
      state.xp += xpGain;

      labResult.textContent =
        "Synthesis successful · 5 Fragments + 1 Shard → 1 Relic (mock).";

      pushEvent(state.lootEvents, {
        kind: "relic",
        label: "RELIC",
        text: "Synthesized a Relic in Pull Lab.",
        time: formatTime(),
        meta: `+${xpGain} XP`,
      });

      pushEvent(state.homeEvents, {
        kind: "relic",
        label: "RELIC",
        text: "Relic synced into your mesh orbit.",
        time: formatTime(),
        meta: `+${xpGain} XP`,
      });

      renderMeshSnapshot();
      renderInventory();
      renderActivityList($("#lootEvents"), state.lootEvents);
      renderActivityList($("#homeActivityList"), state.homeEvents);
      showToast("Relic created (mock) · XP boosted");
    });
  }
}

function setupMeshModes() {
  const buttons = $$("[data-mesh-mode]");
  const copyEl = $("#meshModeCopy");

  if (!buttons.length) return; // HTML har inte alltid dessa ännu

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-mesh-mode");
      if (!mode || !copyEl) return;

      buttons.forEach((b) =>
        b.classList.toggle("segmented-btn-active", b === btn)
      );

      if (mode === "alpha") {
        copyEl.innerHTML =
          'Viewing mesh demo in <strong>Alpha hunters</strong> mode — wallets opening high volumes of packs cluster at the edges.';
      } else if (mode === "new") {
        copyEl.innerHTML =
          'Viewing mesh demo in <strong>New creators</strong> mode — fresh tokens and wallets appear as pulsing nodes.';
      } else {
        copyEl.innerHTML =
          'Viewing mesh demo in <strong>Gravity clusters</strong> mode — wallets with the largest XP streams bend the mesh around them.';
      }

      pushEvent(state.meshEvents, {
        kind: "mesh",
        label: "MESH",
        text: `Switched mesh mode to ${mode}.`,
        time: formatTime(),
        meta: "View changed (mock)",
      });

      renderActivityList($("#meshEvents"), state.meshEvents);
    });
  });

  const fullMeshBtn = $("#btn-open-full-mesh");
  if (fullMeshBtn) {
    fullMeshBtn.addEventListener("click", () => {
      showToast("Full Mesh Explorer is not wired yet (demo).");
    });
  }
}

// ---------- ACCOUNT SHEET ----------

function setupAccountSheet() {
  const sheet = $("#account-sheet");
  const btnAccount = $("#btn-account");
  const btnClose = $("#btn-close-account");
  if (!sheet || !btnAccount || !btnClose) return;

  function open() {
    sheet.setAttribute("aria-hidden", "false");
    sheet.classList.add("open");
    sheet.classList.remove("hidden"); // VISA SHEET
  }
  function close() {
    sheet.setAttribute("aria-hidden", "true");
    sheet.classList.remove("open");
    sheet.classList.add("hidden"); // GÖM SHEET
  }

  btnAccount.addEventListener("click", open);
  btnClose.addEventListener("click", close);
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet) close();
  });

  const rows = sheet.querySelectorAll(".sheet-row");
  rows.forEach((row) => {
    row.addEventListener("click", () => {
      const action = row.getAttribute("data-action");
      if (action === "referrals") {
        showToast("Referrals panel (mock).");
      } else if (action === "earnings") {
        showToast("Mesh earnings (mock).");
      } else if (action === "collectibles") {
        showToast("Collectibles view (mock).");
      } else if (action === "swap-wallet") {
        showToast("Swap wallet (mock).");
      } else if (action === "logout") {
        showToast("Disconnected (mock).");
        close();
      }
    });
  });
}

// ---------- LIVE PULSE ----------

function setupLivePulse() {
  setInterval(() => {
    const kinds = ["xp", "pack", "mesh", "quest", "social"];
    const pick = kinds[Math.floor(Math.random() * kinds.length)];

    let payload;
    if (pick === "xp") {
      payload = {
        kind: "xp",
        label: "XP",
        text: "Background XP trickle from docked app (mock).",
        meta: "+5 XP",
      };
      state.xp += 5;
    } else if (pick === "pack") {
      payload = {
        kind: "pack",
        label: "PACK",
        text: "Random wallet opened a mesh-aligned pack.",
        meta: "External source",
      };
    } else if (pick === "mesh") {
      payload = {
        kind: "mesh",
        label: "MESH",
        text: "New node linked into your extended graph.",
        meta: "Sentient Mesh mock",
      };
    } else if (pick === "quest") {
      payload = {
        kind: "quest",
        label: "QUEST",
        text: "A side-quest was completed by a docked app user.",
        meta: "Global feed",
      };
    } else {
      payload = {
        kind: "social",
        label: "CAST",
        text: "Farcaster friend joined a SpawnEngine quest.",
        meta: "Social mesh",
      };
    }

    pushEvent(state.homeEvents, {
      ...payload,
      time: formatTime(),
    });

    renderMeshSnapshot();
    renderActivityList($("#homeActivityList"), state.homeEvents);
  }, 14000 + Math.random() * 6000);
}

// ---------- WALLET / ONCHAIN ----------

const btnConnect = document.getElementById("btn-connect");
const addrEls = document.querySelectorAll("[data-wallet-address]");
const walletStatusLabel = document.getElementById("wallet-status-label");
const xpSourceEl = document.getElementById("xp-source-label");

function setupWallet() {
  if (!btnConnect) return;

  updateWalletUI();

  btnConnect.addEventListener("click", () => {
    if (spawnAddress) {
      disconnect();
    } else {
      connect();
    }
  });
}

function updateWalletUI() {
  if (!btnConnect) return;

  const label = spawnAddress ? "Disconnect" : "Connect";
  btnConnect.textContent = label;

  const statusText = spawnAddress ? "Connected" : "Not connected";
  if (walletStatusLabel) {
    walletStatusLabel.textContent = statusText;
  }

  const short = spawnAddress ? shortenAddress(spawnAddress) : "Not connected";
  addrEls.forEach((el) => (el.textContent = short));

  if (xpSourceEl) {
    xpSourceEl.textContent = spawnAddress
      ? "XP synced from your Base wallet activity (mock formula)."
      : "XP currently running on demo values.";
  }

  renderHeaderStats();
}

async function connect() {
  if (!window.ethers || !window.ethereum) {
    showToast("No wallet provider found (MetaMask/Rabby).");
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    if (!accounts || !accounts.length) {
      showToast("No accounts available.");
      return;
    }

    spawnProvider = new ethers.providers.Web3Provider(window.ethereum);
    const net = await spawnProvider.getNetwork();
    if (net.chainId !== SPAWN_CONFIG.CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ethers.utils.hexValue(SPAWN_CONFIG.CHAIN_ID) }],
        });
      } catch (err) {
        showToast("Switch to Base in your wallet.");
        console.error(err);
      }
    }

    spawnSigner = spawnProvider.getSigner();
    spawnAddress = await spawnSigner.getAddress();
    showToast(`Connected ${shortenAddress(spawnAddress)}`);

    updateWalletUI();
    await loadOnchainData(updateWalletUI);

    if (window.ethereum.removeListener) {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    showRoleSheetIfNeeded();
  } catch (e) {
    console.error(e);
    showToast("Wallet connection failed.");
  }
}

async function disconnect() {
  spawnProvider = null;
  spawnSigner = null;
  spawnAddress = null;
  showToast("Disconnected (local only).");
  updateWalletUI();
}

async function handleAccountsChanged(accounts) {
  if (!accounts || !accounts.length) {
    await disconnect();
  } else {
    spawnAddress = accounts[0];
    updateWalletUI();
    await loadOnchainData(updateWalletUI);
  }
}

async function loadOnchainData(updateWalletUIFn) {
  if (!spawnAddress) return;
  try {
    if (typeof ethers === "undefined") {
      console.error("Ethers.js library not loaded.");
      return;
    }

    const rpc = new ethers.providers.JsonRpcProvider(SPAWN_CONFIG.RPC_URL);

    const [txCount, balance, gasPrice] = await Promise.all([
      rpc.getTransactionCount(spawnAddress),
      rpc.getBalance(spawnAddress),
      rpc.getGasPrice(),
    ]);

    const baseXp = 200;
    state.xp = baseXp + txCount * 10;

    const gasEl = $("#gasEstimate");
    if (gasEl) {
      const gwei = parseFloat(ethers.utils.formatUnits(gasPrice, "gwei"));
      gasEl.textContent = `~${gwei.toFixed(2)} gwei`;
    }

    const balanceEl = $("#walletBalanceEth");
    if (balanceEl) {
      const eth = parseFloat(ethers.utils.formatEther(balance));
      balanceEl.textContent = `${eth.toFixed(4)} ETH`;
    }

    pushEvent(state.homeEvents, {
      kind: "xp",
      label: "XP",
      text: "Mesh synced to your Base wallet activity.",
      time: formatTime(),
      meta: `txCount=${txCount}`,
    });

    renderMeshSnapshot();
    renderActivityList($("#homeActivityList"), state.homeEvents);
    if (updateWalletUIFn) updateWalletUIFn();
  } catch (e) {
    console.error(e);
    showToast("Could not load onchain data.");
  }
}

// ---------- ROLE SELECT (MULTI-VERSION) ----------

function loadStoredRoles() {
  try {
    const multi = localStorage.getItem("spawnengine_roles");
    if (multi) {
      const parsed = JSON.parse(multi);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
    const single = localStorage.getItem("spawnengine_role");
    if (single) return [single];
  } catch (e) {
    console.warn("Failed to parse stored roles", e);
  }
  return [];
}

// Mock-funktion för att spara rollen on-chain/API
async function saveRoleOnchain(roles) {
  showToast(`Saving roles ${roles.join(", ")}... (Mock TX)`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(`[API MOCK] Roles saved: ${roles.join(", ")}`);
  return true;
}

function showRoleSheetIfNeeded() {
  const backdrop = document.getElementById("role-backdrop");
  if (!backdrop) return;
  const roles = loadStoredRoles();

  if (!roles.length) {
    backdrop.classList.remove("hidden");
    backdrop.classList.add("open");
  } else {
    backdrop.classList.add("hidden");
    backdrop.classList.remove("open");
  }
}

function setupRoleSelect() {
  const backdrop = document.getElementById("role-backdrop");
  const sheet = document.getElementById("role-sheet");
  const closeBtn = document.getElementById("role-close");
  const saveBtn = document.getElementById("save-role");
  const cards = document.querySelectorAll(".role-card");

  if (!backdrop || !sheet || !closeBtn || !saveBtn || !cards.length) return;

  let selectedRoles = new Set(loadStoredRoles());

  cards.forEach((card) => {
    const role = card.getAttribute("data-role");
    if (role && selectedRoles.has(role)) {
      card.classList.add("active"); // synka med CSS .role-card.active
    }
  });

  if (!selectedRoles.size) {
    backdrop.classList.remove("hidden");
    backdrop.classList.add("open");
    saveBtn.disabled = true;
  } else {
    backdrop.classList.add("hidden");
    backdrop.classList.remove("open");
    saveBtn.disabled = false;
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const role = card.getAttribute("data-role");
      if (!role) return;

      if (selectedRoles.has(role)) {
        selectedRoles.delete(role);
        card.classList.remove("active");
      } else {
        selectedRoles.add(role);
        card.classList.add("active");
      }

      saveBtn.disabled = selectedRoles.size === 0;
    });
  });

  saveBtn.addEventListener("click", async () => {
    if (!selectedRoles.size) return;

    const arr = Array.from(selectedRoles);
    const saved = await saveRoleOnchain(arr);

    if (saved) {
      localStorage.setItem("spawnengine_roles", JSON.stringify(arr));
      localStorage.removeItem("spawnengine_role");

      backdrop.classList.remove("open");
      backdrop.classList.add("hidden");

      showToast("Roles updated and synced on-chain!");
      updateRoleDisplay();
    }
  });

  closeBtn.addEventListener("click", () => {
    backdrop.classList.remove("open");
    backdrop.classList.add("hidden");
  });

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) {
      backdrop.classList.remove("open");
      backdrop.classList.add("hidden");
    }
  });
}

/**
 * Mappar de faktiska rollnycklarna (hunter, dev, etc.)
 * och uppdaterar HUD-chipet.
 */
function updateRoleDisplay() {
  const roleIconSpan = document.getElementById("meshRoleIcon");
  const roleLabelSpan = document.getElementById("meshRoleLabel");
  if (!roleIconSpan || !roleLabelSpan) return;

  const roles = loadStoredRoles();

  const labelMap = {
    hunter: "Alpha Hunter / Trader",
    creator: "Creator / Artist",
    dev: "Dev / Builder",
    collector: "Collector / Fan",
  };

  const iconMap = {
    hunter: "⚡",
    creator: "🎨",
    dev: "🧪",
    collector: "🎴",
  };

  if (!roles.length) {
    roleIconSpan.textContent = "❓";
    roleLabelSpan.textContent = "Unknown Role";
    return;
  }

  const primary = roles[0];
  const extraCount = roles.length - 1;
  const label = labelMap[primary] || primary;
  const icon = iconMap[primary] || "❓";
  const labelText = extraCount > 0 ? `${label} +${extraCount}` : label;

  roleIconSpan.textContent = icon;
  roleLabelSpan.textContent = labelText;
}

// ---------- SUPCAST (INLINE FORM) ----------

const SUPCAST_STORAGE_KEY = "spawnengine_supcast_threads_v1";
let supcastThreads = [];

function loadSupcastThreads() {
  try {
    const raw = localStorage.getItem(SUPCAST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSupcastThreads() {
  localStorage.setItem(SUPCAST_STORAGE_KEY, JSON.stringify(supcastThreads));
}

function renderSupcastFeed() {
  const feed = document.getElementById("supcastFeed");
  if (!feed) return;

  feed.innerHTML = "";

  if (!supcastThreads.length) {
    const li = document.createElement("li");
    li.className = "supcast-feed-item";
    li.innerHTML = `
      <div class="supcast-feed-title">No questions yet.</div>
      <div class="supcast-feed-meta">
        <span>Be the first to ask something about your mesh.</span>
        <span></span>
      </div>
    `;
    feed.appendChild(li);
    return;
  }

  supcastThreads
    .slice()
    .reverse()
    .forEach((q) => {
      const li = document.createElement("li");
      li.className = "supcast-feed-item";
      li.innerHTML = `
        <div class="supcast-feed-title">${q.title}</div>
        <div class="supcast-feed-meta">
          <span>${q.context} · ${q.tags || "no tags"}</span>
          <span>${q.time}</span>
        </div>
        <p class="section-sub" style="margin-top:4px;">${q.description}</p>
      `;
      feed.appendChild(li);
    });
}

function setupSupcast() {
  const ctxSel = document.getElementById("supcastContext");
  const titleInput = document.getElementById("supcastTitle");
  const tagsInput = document.getElementById("supcastTags");
  const descInput = document.getElementById("supcastDescription");
  const submitBtn = document.getElementById("supcastSubmit");

  if (!ctxSel || !titleInput || !tagsInput || !descInput || !submitBtn) return;

  supcastThreads = loadSupcastThreads();
  renderSupcastFeed();

  submitBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const description = descInput.value.trim();

    if (!title || !description) {
      showToast("Fill in title + description first.");
      return;
    }

    const context = ctxSel.value;
    const tags = tagsInput.value.trim();
    const now = new Date();
    const time = now.toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    });

    supcastThreads.push({
      id: "sup_" + Date.now(),
      context,
      title,
      tags,
      description,
      time,
    });

    saveSupcastThreads();
    renderSupcastFeed();

    titleInput.value = "";
    tagsInput.value = "";
    descInput.value = "";

    showToast("SupCast question posted (mock).");
  });
}

// ---------- SETTINGS POPUP (Mesh Settings) ----------

function setupInlineSettingsPopup() {
  const settingsBtn = document.getElementById("settings-btn");
  const settingsBackdrop = document.getElementById("settings-backdrop");
  const settingsClose = document.getElementById("settings-close");

  if (!settingsBtn || !settingsBackdrop || !settingsClose) return;

  settingsBtn.addEventListener("click", () => {
    settingsBackdrop.classList.remove("hidden");
  });

  settingsClose.addEventListener("click", () => {
    settingsBackdrop.classList.add("hidden");
  });

  settingsBackdrop.addEventListener("click", (e) => {
    if (e.target === settingsBackdrop) {
      settingsBackdrop.classList.add("hidden");
    }
  });

  const builderCards = settingsBackdrop.querySelectorAll(
    "[data-builder-action]"
  );

  builderCards.forEach((card) => {
    card.addEventListener("click", () => {
      const action = card.getAttribute("data-builder-action");
      if (action === "xp") {
        showToast("XP SDK · would show dev key + docs (mock).");
      } else if (action === "filters") {
        showToast("Premium filters · Alpha hunters & analytics (soon).");
      } else if (action === "launchpad") {
        showToast("Launchpad builder · creator panel (design only).");
      } else if (action === "notifications") {
        showToast("Notifications center (mock).");
      }
    });
  });
}

// ---------- MARKET DETAILS (for future market cards) ----------

function setupMarketDetails() {
  const backdrop = document.getElementById("marketDetailsBackdrop");
  const backBtn = document.getElementById("marketDetailsBack");
  const titleEl = document.getElementById("marketDetailsTitle");
  const bodyEl = document.getElementById("marketDetailsBody");

  if (!backdrop || !backBtn || !titleEl || !bodyEl) return;

  // se till att den är dold vid start
  backdrop.classList.add("hidden");

  const close = () => {
    backdrop.classList.add("hidden");
    bodyEl.innerHTML = "";
  };

  backBtn.addEventListener("click", close);

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) {
      close();
    }
  });

  // Global helper som marketplace/listings.js kan kalla
  window.openMarketDetails = function (listing) {
    if (!listing) {
      titleEl.textContent = "Listing";
      bodyEl.innerHTML = `<p class="section-sub">No data for this listing (mock).</p>`;
    } else if (typeof listing === "string") {
      titleEl.textContent = listing;
      bodyEl.innerHTML = `<p class="section-sub">Listing details coming soon (mock).</p>`;
    } else {
      const name = listing.title || listing.name || "Listing";
      const desc =
        listing.description ||
        listing.desc ||
        "SpawnEngine market listing (mock details).";
      const price =
        listing.priceEth || listing.price || listing.priceUsd || null;
      const meta = listing.meta || listing.participants || "";

      titleEl.textContent = name;
      bodyEl.innerHTML = `
        <div class="market-card">
          <h4>${name}</h4>
          <p class="market-card-desc">${desc}</p>
          <div class="market-card-footer">
            ${
              price
                ? `<span class="market-card-price">${price}</span>`
                : ""
            }
            ${
              meta
                ? `<span class="market-card-participants">${meta}</span>`
                : ""
            }
          </div>
        </div>
      `;
    }

    backdrop.classList.remove("hidden");
  };

  // KOPPLA ALLA .market-card-btn I INDEX TILL DETAILS-SHEETEN
  const marketButtons = $$(".market-card-btn");
  marketButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".market-card");
      if (!card) {
        window.openMarketDetails("Listing");
        return;
      }

      const titleElCard = card.querySelector("h4");
      const descElCard = card.querySelector(".market-card-desc");
      const priceElCard = card.querySelector(".market-card-price");
      const metaElCard = card.querySelector(".market-card-participants");

      const listing = {
        title: titleElCard ? titleElCard.textContent : "Listing",
        description: descElCard ? descElCard.textContent : "",
        price: priceElCard ? priceElCard.textContent : "",
        meta: metaElCard ? metaElCard.textContent : "",
      };

      window.openMarketDetails(listing);
    });
  });
}

// ---------- MODULE INTEGRATION (FÖRBÄTTRAD) ----------

function initModules() {
  // Externa moduler (slot.js, reveal.js, roles.js) initierar sig själva via IIFE/DOMContentLoaded.
    const meshNav = document.getElementById('meshNav');
  if (meshNav) {
    meshNav.addEventListener('click', (e) => {
      const btn = e.target.closest('.mesh-nav-btn');
      if (!btn) return;
      meshNav.querySelectorAll('.mesh-nav-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const tab = btn.dataset.tab;
      // koppla gärna in din befintliga tab-logik här
      // showTab(tab);
    });
  }
  // Här kan du i framtiden koppla in fler moduler om det behövs.
}

// ---------- INIT ----------

function initSpawnEngine() {
  renderHeaderStats();
  initQuests();
  seedHomeEvents();
  seedMeshEvents();
  seedLootEvents();

  renderMeshSnapshot();
  renderActivityList($("#homeActivityList"), state.homeEvents);
  renderActivityList($("#meshEvents"), state.meshEvents);
  renderInventory();
  renderQuests();

  setupTabs();
  setupStreak();
  setupLoot();
  setupMeshModes();
  setupAccountSheet();
  setupLivePulse();
  setupWallet();
  setupInlineSettingsPopup();
  setupMarketDetails();

  // KÖR MARKETPLACE MODULEN OM DEN FINNS
  if (window.initMarketplace) {
    window.initMarketplace();
  }

  setupRoleSelect();
  setupSupcast();
  updateRoleDisplay();

  initModules();
  showRoleSheetIfNeeded();
}

// ---------- READY STATE ----------

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
      // Mesh feed filters
  const meshFeedFilters = document.getElementById("meshFeedFilters");
  if (meshFeedFilters) {
    meshFeedFilters.addEventListener("click", (e) => {
      const btn = e.target.closest(".mesh-filter-chip");
      if (!btn) return;
      const filter = btn.dataset.filter || "all";

      meshFeedFilters.querySelectorAll(".mesh-filter-chip")
        .forEach(el => el.classList.remove("is-active"));
      btn.classList.add("is-active");

      setMeshFilter(filter);
    });
  }
    // ---------- UNIFIED ACTIVITY MESH ----------
// Hooka in unified mesh + canvas i befintliga pushEvent
if (typeof window.pushEvent === "function") {
  const originalPushEvent = window.pushEvent;
  window.pushEvent = function(list, payload, max = 16) {
    originalPushEvent(list, payload, max);

    // Skapa unified event från payload
    addMeshEvent({
      type: payload.kind || payload.type || "xp_event",
      label: payload.title || payload.label || payload.message || "Mesh event",
      details: {
        wallet: payload.wallet || payload.address || "mesh",
        value: payload.value,
        rarity: payload.rarity,
      },
      source: payload.source || "mock",
      timestamp: payload.timestamp || Date.now(),
    });
  };
}// Lightweight mock-stream så det inte är tomt i v0.4
const MOCK_WALLETS = [
  "0xspawniz",
  "0xmesh1234abcd",
  "0xfeedcafe1337",
  "0xbase00babe",
];

const MOCK_EVENTS = [
  { type: "pack_open", label: "Opened mesh-aligned pack", group: "packs" },
  { type: "xp_event", label: "Daily ritual XP claimed", group: "xp" },
  { type: "zora_buy", label: "Zora coin minted", group: "trades" },
  { type: "farcaster_cast", label: "New cast about SpawnEngine", group: "social" },
  { type: "burn", label: "Fragments burned for ladder", group: "packs" },
];

function spawnMockMeshEvent() {
  const ev = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
  const wallet = MOCK_WALLETS[Math.floor(Math.random() * MOCK_WALLETS.length)];
  const value = ev.type === "zora_buy" ? (Math.random() * 0.02 + 0.005) : null;
  const rarity = ev.type === "pack_open"
    ? ["Fragment", "Shard", "Core", "Artifact"][Math.floor(Math.random() * 4)]
    : null;

  addMeshEvent({
    type: ev.type,
    label: ev.label,
    details: { wallet, value, rarity },
    source: "mock",
    timestamp: Date.now(),
  });
}

// kicka igång lite puls
setInterval(spawnMockMeshEvent, 9000);
const MESH_EVENT_TYPES = {
  pack_open: { icon: "🎰", group: "packs", label: "Pack opened" },
  burn:      { icon: "🔥", group: "packs", label: "Cards burned" },
  swap:      { icon: "🔁", group: "trades", label: "Swap executed" },
  zora_buy:  { icon: "🟦", group: "trades", label: "Zora buy" },
  zora_sell: { icon: "🟥", group: "trades", label: "Zora sell" },
  xp_event:  { icon: "⚡", group: "xp",    label: "XP event" },
  streak:    { icon: "🔥", group: "xp",    label: "Streak updated" },
  farcaster_cast: { icon: "📡", group: "social", label: "Farcaster cast" },
  social:    { icon: "💬", group: "social", label: "Social signal" },
};

let meshEvents = [];
let meshFilter = "all";

function addMeshEvent(evt) {
  const baseType = evt.type || "xp_event";
  const def = MESH_EVENT_TYPES[baseType] || MESH_EVENT_TYPES["xp_event"];

  const normalized = {
    type: baseType,
    group: def.group,
    icon: def.icon,
    label: evt.label || def.label,
    wallet: evt.details?.wallet || evt.wallet || "mesh",
    value: evt.details?.value ?? evt.value ?? null,
    rarity: evt.details?.rarity || evt.rarity || null,
    source: evt.source || "mock",
    timestamp: evt.timestamp ? new Date(evt.timestamp) : new Date(),
  };

  meshEvents.unshift(normalized);
  if (meshEvents.length > 60) meshEvents.pop();

  renderMeshFeed();
  // mata även in i canvas-meshen om funktionen finns
  if (typeof addMeshNode === "function") {
    addMeshNode({
      kind: normalized.group === "packs" ? "pack"
           : normalized.group === "trades" ? "mesh"
           : normalized.group === "xp" ? "xp"
           : "social",
      label: normalized.label,
    });
  }
}

function renderMeshFeed() {
  const listEl   = document.getElementById("meshFeedList");
  const emptyEl  = document.getElementById("meshFeedEmpty");
  const countEl  = document.getElementById("meshFeedCount");
  if (!listEl) return;

  const now = Date.now();

  const visible = meshEvents.filter(e =>
    meshFilter === "all" ? true : e.group === meshFilter
  );

  if (countEl) {
    countEl.textContent = `${meshEvents.length} events`;
  }

  if (visible.length === 0) {
    listEl.innerHTML = "";
    if (emptyEl) emptyEl.style.display = "block";
    return;
  }

  if (emptyEl) emptyEl.style.display = "none";

  const html = visible.map(e => {
    const ageMs = now - e.timestamp.getTime();
    const ageMin = Math.max(0, Math.round(ageMs / 60000));
    const ageLabel = ageMin === 0 ? "just now" : `${ageMin} min ago`;

    const valueLabel =
      e.value != null
        ? `· ${typeof e.value === "number" ? e.value.toFixed(2) : e.value}`
        : "";

    const rarityLabel = e.rarity ? `<span class="mesh-feed-tag">${e.rarity}</span>` : "";
    const sourceLabel = e.source ? `<span class="mesh-feed-tag">${e.source}</span>` : "";

    return `
      <li class="mesh-feed-item">
        <div class="mesh-feed-icon">${e.icon}</div>
        <div class="mesh-feed-body">
          <div class="mesh-feed-title">
            ${e.label}
            ${rarityLabel}
            ${sourceLabel}
          </div>
          <div class="mesh-feed-meta-line">
            ${shortWallet(e.wallet)} ${valueLabel}
          </div>
          <div class="mesh-feed-timestamp">${ageLabel}</div>
        </div>
      </li>
    `;
  }).join("");

  listEl.innerHTML = html;
}

function shortWallet(addr) {
  if (!addr || typeof addr !== "string") return "";
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function setMeshFilter(nextFilter) {
  meshFilter = nextFilter;
  renderMeshFeed();
}
    // Ta bort eventuella dubletter av bottom-nav
// Initialize
const slotMachine = new SpawnSlotMachine(document.querySelector('.slot-machine'));
slotMachine.updateUI();
    const navs = document.querySelectorAll(".bottom-nav");
    if (navs.length > 1) {
      navs.forEach((nav, index) => {
        if (index > 0) nav.remove();
      });
    }

    initSpawnEngine();
  });
} else {
  const navs = document.querySelectorAll(".bottom-nav");
  if (navs.length > 1) {
    navs.forEach((nav, index) => {
      if (index > 0) nav.remove();
    });
  }

  initSpawnEngine();
}
/* ---------- PRIMARY MESH NAV ---------- */

.mesh-nav-scroll {
  margin-top: 10px;
  margin-bottom: 12px;
  padding: 2px 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.mesh-nav {
  display: inline-flex;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 999px;
  background: radial-gradient(circle at top left, rgba(0,255,210,0.12), transparent),
              radial-gradient(circle at bottom right, rgba(88,101,242,0.18), transparent);
  box-shadow: 0 0 0 1px rgba(115, 130, 255, 0.35);
}

.mesh-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: #c7d2ff;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.16s ease, color 0.16s ease, box-shadow 0.16s ease, transform 0.08s;
}

.mesh-nav-btn:hover {
  background: rgba(24, 35, 80, 0.9);
  box-shadow: 0 0 0 1px rgba(129, 140, 248, 0.6);
}

.mesh-nav-btn.is-active {
  background: radial-gradient(circle at top, #22c1c3, #0ea5e9);
  color: #020617;
  box-shadow: 0 0 18px rgba(45, 212, 191, 0.7);
  transform: translateY(-1px);
}

.mesh-nav-icon {
  font-size: 13px;
}

.mesh-nav-label {
  text-transform: none;
}

/* small screens tweaked spacing */
@media (max-width: 430px) {
  .mesh-nav-btn {
    padding-inline: 8px;
  }
  .mesh-nav-label {
    font-size: 10px;
  }
}
    this.balance += win;

    // --- Mesh + HUD hook ---
    try {
      if (typeof addMeshEvent === "function") {
        addMeshEvent({
          type: win > 0 ? "xp_event" : "social",
          label: win > 0
            ? `Slot win · ${win} SPN`
            : "Slot spin · no win",
          details: {
            wallet: "slot-mock",
            value: win,
            rarity: scatters >= FREESPINS_TRIGGER ? "Freespins" : null,
          },
          source: "slot",
          timestamp: Date.now(),
        });
      }
    } catch (e) {
      // tyst fail – modulen ska funka fristående också
    }    // Haptics / sound om global engine finns
    if (typeof playSound === "function") {
      playSound(win > 0 ? "reward" : "click");
    }
    if (typeof vibrate === "function") {
      vibrate(win > 0 ? [40, 40, 40] : 10);
    }const meshNavButtons = document.querySelectorAll('.mesh-nav-btn');
const meshSections = document.querySelectorAll('[data-tab-section]');

meshNavButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    meshNavButtons.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    meshSections.forEach(sec => {
      sec.classList.toggle('hidden', sec.dataset.tabSection !== target);
    });
  });
});