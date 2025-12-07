// app.js — SpawnEngine3.0 · Mesh HUD v0.3 + wallet/onchain hook + SupCast + Settings Popup

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
  role: "hunter", // default
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
      panel.classList.toggle(
        "tab-panel-active",
        panel.id === `tab-${target}`
      );
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

  const openBtn = $("#btn-open-pack");
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      const fragmentsGained = 2 + Math.floor(Math.random() * 4);
      const shardDrop = Math.random() < 0.35;
      const xpGain = 30 + Math.floor(Math.random() * 35);

      state.fragments += fragmentsGained;
      if (shardDrop) state.shards += 1;
      state.xp += xpGain;

      const textParts = [`${fragmentsGained} Fragments`];
      if (shardDrop) textParts.push("1 Shard");

      pushEvent(state.lootEvents, {
        kind: "pack",
        label: "PACK",
        text: `Opened Starter mesh pack · ${textParts.join(", ")}.`,
        time: formatTime(),
        meta: `+${xpGain} XP`,
      });

      pushEvent(state.homeEvents, {
        kind: "pack",
        label: "PACK",
        text: "Loot activity strengthened your mesh.",
        time: formatTime(),
        meta: `+${xpGain} XP`,
      });

      renderMeshSnapshot();
      renderInventory();
      renderActivityList($("#lootEvents"), state.lootEvents);
      renderActivityList($("#homeActivityList"), state.homeEvents);
      showToast("Pack opened (mock) · rewards added");
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
  }
  function close() {
    sheet.setAttribute("aria-hidden", "true");
    sheet.classList.remove("open");
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

  // init UI direkt när appen laddar
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

    // lyssna på account-byten
    window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    window.ethereum.on("accountsChanged", handleAccountsChanged);

    // första gången efter riktig connect: roll-väljare
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

// ---------- ROLE SELECT ----------

function showRoleSheetIfNeeded() {
  const backdrop = document.getElementById("role-backdrop");
  if (!backdrop) return;

  const existing = localStorage.getItem("spawnengine_role");
  if (!existing) {
    backdrop.classList.remove("hidden");
  }
}

function setupRoleSelect() {
  const backdrop = document.getElementById("role-backdrop");
  const closeBtn = document.getElementById("role-close");
  const saveBtn = document.getElementById("save-role");
  const cards = document.querySelectorAll(".role-card");
  if (!backdrop || !closeBtn || !saveBtn || !cards.length) return;

  let selectedRole = null;

  // Selecting a card
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      cards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      selectedRole = card.getAttribute("data-role");
      saveBtn.disabled = !selectedRole;
    });
  });

  // Save role
  saveBtn.addEventListener("click", () => {
    if (!selectedRole) return;
    localStorage.setItem("spawnengine_role", selectedRole);
    state.role = selectedRole;
    backdrop.classList.add("hidden");
    showToast("Role set: " + selectedRole);
    updateRoleDisplay();
  });

  closeBtn.addEventListener("click", () => {
    backdrop.classList.add("hidden");
  });
}

function updateRoleDisplay() {
  const chip = document.getElementById("mesh-role-chip");
  const iconSpan = document.getElementById("meshRoleIcon");
  if (!chip) return;

  const savedRole = localStorage.getItem("spawnengine_role");
  if (savedRole) {
    state.role = savedRole;
  }

  const role = state.role || "hunter";

  const labelMap = {
    dev: "Dev / Builder",
    creator: "Creator / Artist",
    hunter: "Alpha hunter / Trader",
    collector: "Collector / Fan",
  };

  const iconMap = {
    dev: "🧪",
    creator: "🎨",
    hunter: "🗡️",
    collector: "📦",
  };

  chip.textContent = labelMap[role] || "Alpha hunter / Trader";
  if (iconSpan) {
    iconSpan.textContent = iconMap[role] || "";
  }
}

// ---------- SETTINGS POPUP (Mesh Settings) ----------
// ---------- ROLE SELECT ----------

// Läs roller från localStorage (stöd för gammal single-role också)
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

// Öppna sheet bara om ingen roll är vald än
function showRoleSheetIfNeeded() {
  const backdrop = document.getElementById("role-backdrop");
  if (!backdrop) return;
  const roles = loadStoredRoles();
  if (!roles.length) {
    backdrop.classList.add("open");
  }
}

function setupRoleSelect() {
  const backdrop = document.getElementById("role-backdrop");
  const sheet = document.getElementById("role-sheet");
  const closeBtn = document.getElementById("role-close");
  const saveBtn = document.getElementById("save-role");
  const cards = document.querySelectorAll(".role-card");

  if (!backdrop || !sheet || !closeBtn || !saveBtn || !cards.length) return;

  // Multi-select: Set med valda roller
  let selectedRoles = new Set(loadStoredRoles());

  // Förmarkera redan sparade roller
  cards.forEach((card) => {
    const role = card.getAttribute("data-role");
    if (role && selectedRoles.has(role)) {
      card.classList.add("active");
    }
  });

  // Om inga roller valda alls: öppna sheet första gången
  if (!selectedRoles.size) {
    backdrop.classList.add("open");
    saveBtn.disabled = true;
  } else {
    saveBtn.disabled = false;
  }

  // Toggle på korten (multi-select)
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

      // Minst 1 roll krävs för att spara
      saveBtn.disabled = selectedRoles.size === 0;
    });
  });

  // Spara roller
  saveBtn.addEventListener("click", () => {
    if (!selectedRoles.size) return;

    const arr = Array.from(selectedRoles);
    localStorage.setItem("spawnengine_roles", JSON.stringify(arr));
    localStorage.removeItem("spawnengine_role"); // städa gammal nyckel

    backdrop.classList.remove("open");
    showToast("Roles updated");
    updateRoleDisplay();
  });

  // Stäng-knapp
  closeBtn.addEventListener("click", () => {
    backdrop.classList.remove("open");
  });

  // Klick utanför sheet → stäng
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) {
      backdrop.classList.remove("open");
    }
  });
}

function updateRoleDisplay() {
  const roleSpan = document.getElementById("meshRoleIcon");
  if (!roleSpan) return;

  const roles = loadStoredRoles();

  const labelMap = {
    dev: "Dev / Builder",
    creator: "Creator / Artist",
    hunter: "Alpha hunter / Trader",
    collector: "Collector / Fan",
  };

  const iconMap = {
    dev: "🧪",
    creator: "🎨",
    hunter: "⚡",
    collector: "🎴",
  };

  // Default om inget är valt
  if (!roles.length) {
    roleSpan.textContent = "⚡ Alpha hunter / Trader";
    return;
  }

  const primary = roles[0];
  const extraCount = roles.length - 1;
  const label = labelMap[primary] || "Alpha hunter / Trader";
  const icon = iconMap[primary] || "⚡";

  if (extraCount > 0) {
    roleSpan.textContent = `${icon} ${label} +${extraCount}`;
  } else {
    roleSpan.textContent = `${icon} ${label}`;
  }
}
// ---------- END ROLE SELECT ----------

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

  // Builder-actions inside Settings & builders
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
  // ... din befintliga setupMarketDetails här ...
}
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

  // Builder-actions inside Settings & builders
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

  function openMarketDetails(card) {
    const title =
      card.querySelector(".market-card-title")?.textContent.trim() || "Listing";
    const desc =
      card.querySelector(".market-card-desc")?.textContent.trim() || "";
    const price =
      card.querySelector(".market-card-price")?.textContent.trim() || "";
    const participants =
      card
        .querySelector(".market-card-participants")
        ?.textContent.trim() || "";

    titleEl.textContent = title;
    bodyEl.innerHTML = `
      <p class="section-sub">${desc}</p>
      <div class="metric-card" style="margin-top:8px;">
        <div class="metric-label">Price</div>
        <div class="metric-value metric-small">${price || "TBA"}</div>
        <p class="metric-sub">${participants || "Mesh curated slot"}</p>
      </div>
      <div class="supcast-context" style="margin-top:10px;">
        <p class="section-sub">
          This is a SpawnEngine market slot. In production this page will expose:
        </p>
        <ul class="quest-list">
          <li class="quest-item">
            <div class="quest-main">
              <div class="quest-title">Onchain actions</div>
              <p class="quest-sub">Mint / buy / swap / open events streamed from Base.</p>
            </div>
            <div class="quest-right">
              <span class="quest-meta">Live feed</span>
            </div>
          </li>
          <li class="quest-item">
            <div class="quest-main">
              <div class="quest-title">Embed API</div>
              <p class="quest-sub">Drop this listing as a widget into any miniapp.</p>
            </div>
            <div class="quest-right">
              <span class="quest-meta">Copy snippet</span>
            </div>
          </li>
        </ul>
      </div>
      <button class="btn-full-width">Copy embed snippet (mock)</button>
    `;

    backdrop.classList.add("open");
  }

  document.querySelectorAll(".market-card-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = btn.closest(".market-card");
      if (card) openMarketDetails(card);
    });
  });

  backBtn.addEventListener("click", () => {
    backdrop.classList.remove("open");
  });

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) {
      backdrop.classList.remove("open");
    }
  });
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
  setupRoleSelect();
  updateRoleDisplay();
}

// ---------- READY STATE ----------

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSpawnEngine);
} else {
  initSpawnEngine();
}