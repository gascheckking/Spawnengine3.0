// Simple mock state
const state = {
  connected: false,
  xp: 1575,
  spawn: 497,
  streakDays: 1,
  walletCount: 1,
};

// === DOM HELPERS ===
function $(sel) {
  return document.querySelector(sel);
}
function $all(sel) {
  return Array.from(document.querySelectorAll(sel));
}

// === TABS ===
function initTabs() {
  const buttons = $all(".tab-button");
  const views = {
    home: $("#view-home"),
    loot: $("#view-loot"),
    quests: $("#view-quests"),
    mesh: $("#view-mesh"),
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      Object.values(views).forEach((v) => v.classList.remove("active"));
      views[view].classList.add("active");
    });
  });
}

// === SIDE DRAWER ===
function initDrawer() {
  const drawer = $("#side-drawer");
  $("#btn-open-drawer").addEventListener("click", () => {
    drawer.classList.add("open");
  });
  $("#btn-close-drawer").addEventListener("click", () => {
    drawer.classList.remove("open");
  });

  $("#btn-logout").addEventListener("click", () => {
    state.connected = false;
    updateWalletUi();
    alert("Wallet disconnected (demo).");
    drawer.classList.remove("open");
  });

  $("#btn-swap-wallet").addEventListener("click", () => {
    alert("Swap wallet — in real mesh, this opens your wallet selector.");
  });

  $("#btn-settings").addEventListener("click", () => {
    drawer.classList.add("open");
  });
}

// === WALLET MOCK ===
function updateWalletUi() {
  const btn = $("#btn-connect");
  const wallets = $("#status-wallets");
  if (state.connected) {
    btn.textContent = "Wallet connected";
    btn.classList.add("connected");
    wallets.textContent = state.walletCount.toString();
  } else {
    btn.textContent = "Connect wallet";
    btn.classList.remove("connected");
    wallets.textContent = "0";
  }
}

function initWallet() {
  $("#btn-connect").addEventListener("click", () => {
    if (!state.connected) {
      // mock connect
      state.connected = true;
      state.walletCount = 1;
      updateWalletUi();
      pushActivityHome({
        app: "SpawnEngine",
        title: "Wallet connected",
        subtitle: "Mesh orbit initialized for @spawniz.",
        ago: "Just now",
      });
    } else {
      alert("Already connected (demo).");
    }
  });
}

// === XP / STREAK ===
function refreshStats() {
  $("#xp-balance").textContent = `${state.xp} XP`;
  $("#spawn-balance").textContent = `${state.spawn} SPN`;
  $("#streak-days").textContent = state.streakDays.toString();
  const remaining = Math.max(0, 7 - state.streakDays);
  $("#streak-copy").textContent =
    remaining > 0
      ? `Keep the streak for ${remaining} more day${
          remaining === 1 ? "" : "s"
        } for a full weekly run.`
      : "Weekly run complete — entropy loves your consistency.";
}

function initCheckin() {
  $("#btn-checkin").addEventListener("click", () => {
    state.streakDays += 1;
    const gained = 15;
    state.xp += gained;
    refreshStats();
    pushActivityHome({
      app: "Daily",
      title: "Streak check-in",
      subtitle: `You gained +${gained} XP and extended your streak.`,
      ago: "Just now",
    });
  });

  // Quest button that uses XP
  $all(".quest-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const xp = parseInt(btn.dataset.xp || "0", 10);
      state.xp += xp;
      refreshStats();
      pushActivityHome({
        app: "Quest",
        title: "Quest complete",
        subtitle: `You completed a ritual quest and earned +${xp} XP.`,
        ago: "Just now",
      });
    });
  });
}

// === LOOT / PACKS ===
function initLoot() {
  const segPacks = $("#seg-packs");
  const segPull = $("#seg-pull");
  const viewPacks = $("#loot-packs");
  const viewPull = $("#loot-pull");

  function setSeg(target) {
    [segPacks, segPull].forEach((b) => b.classList.remove("active"));
    [viewPacks, viewPull].forEach((v) => v.classList.remove("active"));
    if (target === "packs") {
      segPacks.classList.add("active");
      viewPacks.classList.add("active");
    } else {
      segPull.classList.add("active");
      viewPull.classList.add("active");
    }
  }

  segPacks.addEventListener("click", () => setSeg("packs"));
  segPull.addEventListener("click", () => setSeg("pull"));

  $("#btn-open-pack").addEventListener("click", () => {
    // mock pack open
    const rarities = ["COMMON", "RARE", "EPIC", "LEGENDARY"];
    const r = rarities[Math.floor(Math.random() * rarities.length)];
    const xpGain = r === "COMMON" ? 10 : r === "RARE" ? 25 : r === "EPIC" ? 55 : 120;
    state.xp += xpGain;
    refreshStats();

    pushLootLog({
      title: `Pack opened · ${r}`,
      subtitle: `You pulled a ${r.toLowerCase()} fragment · +${xpGain} XP.`,
      ago: "Just now",
    });

    pushActivityMesh({
      app: "Loot",
      title: `${r} fragment pulled`,
      subtitle: `New shard added to your mesh inventory.`,
      ago: "Just now",
    });
  });
}

// === ACTIVITY FEEDS ===

const homeList = $("#activity-list-home");
const meshList = $("#activity-list-mesh");
const lootLog = $("#loot-log");

function createActivityElement({ app, title, subtitle, ago }) {
  const li = document.createElement("li");
  li.className = "activity-item";
  li.innerHTML = `
    <div class="activity-icon"></div>
    <div class="activity-content">
      <div class="activity-title">${title}</div>
      <div class="activity-sub">${subtitle}</div>
      <div class="activity-meta">${app} · ${ago}</div>
    </div>
  `;
  return li;
}

function pushActivityHome(item) {
  if (!homeList) return;
  const li = createActivityElement(item);
  homeList.prepend(li);
}

function pushActivityMesh(item) {
  if (!meshList) return;
  const li = createActivityElement(item);
  meshList.prepend(li);
}

function pushLootLog(item) {
  if (!lootLog) return;
  const li = createActivityElement(item);
  lootLog.prepend(li);
}

// seed some mock events
function seedActivity() {
  pushActivityHome({
    app: "WarpLet",
    title: "WarpLet Universe Expansion",
    subtitle: "New boxes bring neon monsters into your mesh.",
    ago: "9m",
  });

  pushActivityHome({
    app: "BETR",
    title: "FREE Spin-to-Claim is live",
    subtitle: "Spin the flywheel and compound your $BETR rewards.",
    ago: "20m",
  });

  pushActivityMesh({
    app: "Mesh",
    title: "Alpha cluster detected",
    subtitle: "3 wallets opened packs in the last 2 minutes.",
    ago: "2m",
  });

  pushActivityMesh({
    app: "SpawnEngine",
    title: "Mesh layer booted",
    subtitle: "Demo mesh v0.3 is running on local mock.",
    ago: "Just now",
  });
}

// === INIT ===

window.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initDrawer();
  initWallet();
  initCheckin();
  initLoot();
  refreshStats();
  updateWalletUi();
  seedActivity();
});