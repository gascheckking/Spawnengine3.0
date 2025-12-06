// app.js — SpawnEngine3.0 · Mesh HUD v0.3 + basic wallet/onchain hook + SupCast + Settings

// ---------- ONCHAIN CONFIG (NYTT) ----------

const SPAWN_CONFIG = {
  RPC_URL: "https://mainnet.base.org", // publik Base RPC (ingen nyckel behövs)
  CHAIN_ID: 8453,
  CHAIN_NAME: "Base",
};

// Wallet-state
let spawnProvider = null;
let spawnSigner = null;
let spawnAddress = null;

// smidigt helper
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

// expose för SupCast / andra scripts
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

  // uppdatera ev. header-XP om du har nåt där
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

// ---------- ACCOUNT / SETTINGS SHEETS ----------

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

function setupSettingsSheet() {
  const sheet = $("#settings-sheet");
  const btnOpen = $("#btn-settings");
  const btnBack = $("#btn-settings-back");
  const btnClose = $("#btn-close-settings");
  if (!sheet || !btnOpen || !btnBack || !btnClose) return;

  const scroll = sheet.querySelector(".settings-scroll");
  if (!scroll) return;

  const baseMarkup = scroll.innerHTML;

  const PAGES = {
    "Connected socials": {
      title: "Connected socials",
      body: `
        <p>Link your Farcaster, X, Zora and other socials so SpawnEngine can pull avatars, handles and mesh XP.</p>
        <ul>
          <li>Farcaster · used for casts, XP and quests.</li>
          <li>Zora · pack mints, coins and creator stats.</li>
          <li>X / Twitter · optional, for reach &amp; support.</li>
        </ul>
        <p><em>v0.3 is mock only – in v1.0 this is a full wallet + social link flow.</em></p>
      `,
    },
    Notifications: {
      title: "Notifications",
      body: `
        <p>Configure how SpawnEngine pings you when things happen:</p>
        <ul>
          <li>Pack opened · you or followed creators.</li>
          <li>Quest completed · daily/weekly streak status.</li>
          <li>SupCast answers · replies on your support cases.</li>
        </ul>
        <p>In v0.3 this is a preview – no push is sent yet.</p>
      `,
    },
    "Feeds & oracle feed": {
      title: "Feeds & oracle feed",
      body: `
        <p>Control what goes into your mesh feed:</p>
        <ul>
          <li>Onchain packs &amp; coins from Vibe / Zora.</li>
          <li>Trusted oracle feeds with XP signals.</li>
          <li>Experimental &quot;weird&quot; feeds for degen mode.</li>
        </ul>
        <p>Later this becomes a full filter-builder tied to contracts.</p>
      `,
    },
    "Preferred wallet": {
      title: "Preferred wallet",
      body: `
        <p>Set which wallet is your main mesh identity on Base.</p>
        <ul>
          <li>Pick primary wallet for XP and quests.</li>
          <li>Mark &quot;viewer only&quot; wallets for scouting.</li>
          <li>In v1.0 you&#39;ll be able to quick-switch from here.</li>
        </ul>
      `,
    },
    "Verified addresses": {
      title: "Verified addresses",
      body: `
        <p>Mark addresses you really control so rewards can flow safely.</p>
        <ul>
          <li>Creator payout wallets.</li>
          <li>Pack treasury / multisig.</li>
          <li>Cold storage addresses.</li>
        </ul>
        <p>Verification in v0.3 is mock – this page is the design spec.</p>
      `,
    },
    "Docked apps & XP SDK": {
      title: "Docked apps & XP SDK",
      body: `
        <p>Dock external apps into the mesh so they can earn/give XP.</p>
        <ul>
          <li>WarpAI, Tiny Legends, Vibe packs, custom games.</li>
          <li>Each app gets an XP key and limits.</li>
          <li>Activity flows into this HUD as streaks and quests.</li>
        </ul>
      `,
    },
    "Premium mesh filters": {
      title: "Premium mesh filters",
      body: `
        <p>Advanced filters for hunters and builders:</p>
        <ul>
          <li>Show only verified creators.</li>
          <li>Filter on pack odds, volume, or XP yield.</li>
          <li>Save custom presets as &quot;Warp paths&quot;.</li>
        </ul>
      `,
    },
    Theme: {
      title: "Theme",
      body: `
        <p>Pick how SpawnEngine should look:</p>
        <ul>
          <li>Mesh Neon (current).</li>
          <li>Terminal Mono (dev mode).</li>
          <li>Vibe Retro (pack arcade).</li>
        </ul>
        <p>Color modes are mock – but the choices are real.</p>
      `,
    },
    Support: {
      title: "Support",
      body: `
        <p>Short path into SupCast and other support layers:</p>
        <ul>
          <li>Jump into SupCast with context attached.</li>
          <li>Open docs, FAQ and example flows.</li>
          <li>Ping core team when something truly explodes.</li>
        </ul>
      `,
    },
    "SpawnEngine Launchpad": {
      title: "SpawnEngine Launchpad",
      body: `
        <p>Creator-side view for spinning up new meshes:</p>
        <ul>
          <li>Create pack series, coins and quests in one flow.</li>
          <li>Preview XP curves and reward ladders.</li>
          <li>Connect to Vibe / Zora / Base contracts.</li>
        </ul>
        <p>This is where SpawnEngine becomes a full protocol, not just a HUD.</p>
      `,
    },
  };

  function renderSettingsList() {
    scroll.innerHTML = baseMarkup;
    const rows = scroll.querySelectorAll(".settings-row");
    rows.forEach((row) => {
      row.addEventListener("click", () => {
        const label = row.textContent.trim();
        const page = PAGES[label];
        if (!page) {
          showToast(`${label} · not wired (demo).`);
          return;
        }
        renderSettingsDetail(page);
      });
    });

    const closeBtn = $("#btn-close-settings");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        sheet.setAttribute("aria-hidden", "true");
        sheet.classList.remove("open");
      });
    }
  }

  function renderSettingsDetail(page) {
    scroll.innerHTML = `
      <div class="settings-section-label">${page.title}</div>
      <div class="mesh-mini-card">
        ${page.body}
      </div>
      <button id="settings-back-to-list" class="btn-full-width">
        Back to settings
      </button>
    `;

    const backListBtn = $("#settings-back-to-list");
    if (backListBtn) {
      backListBtn.addEventListener("click", () => {
        renderSettingsList();
      });
    }
  }

  function open() {
    sheet.setAttribute("aria-hidden", "false");
    sheet.classList.add("open");
    renderSettingsList();
  }
  function close() {
    sheet.setAttribute("aria-hidden", "true");
    sheet.classList.remove("open");
  }

  btnOpen.addEventListener("click", open);
  btnBack.addEventListener("click", () => {
    renderSettingsList();
  });
  btnClose.addEventListener("click", close);
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet) close();
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

// ---------- WALLET / ONCHAIN (NYTT) ----------

function setupWallet() {
  const btnConnect = $("#btn-connect-wallet");   // t.ex. knapp i header
  const addrEls = $$(".wallet-address");        // alla element som ska visa adress
  const xpSourceEl = $("#walletXpSource");      // liten text: "XP from Base tx"

  if (!btnConnect) {
    // om du inte gjort HTML ännu så bryter inget
    return;
  }

  function updateWalletUI() {
    const label = spawnAddress ? "Disconnect" : "Connect";
    btnConnect.textContent = label;

    const short = spawnAddress ? shortenAddress(spawnAddress) : "Not connected";
    addrEls.forEach((el) => (el.textContent = short));

    if (xpSourceEl) {
      xpSourceEl.textContent = spawnAddress
        ? "XP synced from your Base tx history (mock formula)."
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
        // försök byta nät
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

      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.on("accountsChanged", handleAccountsChanged);
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

  btnConnect.addEventListener("click", () => {
    if (spawnAddress) disconnect();
    else connect();
  });

  updateWalletUI();
}

// läser riktig Base-data och mappar till din mesh-XP
async function loadOnchainData(updateWalletUI) {
  if (!spawnAddress) return;
  try {
    const rpc = new ethers.providers.JsonRpcProvider(SPAWN_CONFIG.RPC_URL);
    const [txCount, balance, gasPrice] = await Promise.all([
      rpc.getTransactionCount(spawnAddress),
      rpc.getBalance(spawnAddress),
      rpc.getGasPrice(),
    ]);

    // enkel XP-formel: grund-XP + tx-count * 10
    const baseXp = 200;
    state.xp = baseXp + txCount * 10;

    // uppdatera lite UI-grejer
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
    if (updateWalletUI) updateWalletUI();
  } catch (e) {
    console.error(e);
    showToast("Could not load onchain data.");
  }
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
  setupSettingsSheet();
  setupLivePulse();
  setupWallet(); // <— nya wallet-delen
}

// Kör oavsett var scriptet ligger
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSpawnEngine);
} else {
  initSpawnEngine();
}