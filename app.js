// Simple helper
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

document.addEventListener("DOMContentLoaded", () => {
  setupShellUI();
  setupTabs();
  setupWalletConnectMock();
  setupMeshLoad();
  setupBubbles();
  setupEvents();
  setupPacks();
  setupWallets();
  setupStreak();
  setupPullLab();
});

/* TOP BAR, PROFILE SHEET & SIDE MENU */

function setupShellUI() {
  const btnOpenProfile = $("#btn-open-profile");
  const btnCloseProfile = $("#btn-close-profile");
  const profileSheet = $("#profile-sheet");
  const profileBubbles = $("#profile-bubbles");
  const sheetXp = $("#sheet-xp");
  const sheetStreak = $("#sheet-streak");
  const sheetWallets = $("#sheet-wallets");

  const btnOpenMenu = $("#btn-open-menu");
  const btnCloseDrawer = $("#btn-close-drawer");
  const drawer = $("#side-drawer");

  // open / close helpers
  const openSheet = () => profileSheet.classList.remove("hidden");
  const closeSheet = () => profileSheet.classList.add("hidden");
  const openDrawer = () => drawer.classList.remove("hidden");
  const closeDrawer = () => drawer.classList.add("hidden");

  if (btnOpenProfile && profileSheet) {
    btnOpenProfile.addEventListener("click", () => {
      // sync stats from overview
      const xpText = $("#metric-xp")?.textContent || "0 XP";
      const streakText = $("#streak-counter")?.textContent || "0 days";
      const walletCount = $("#chip-active")?.textContent || "0";

      sheetXp.textContent = xpText.replace(" XP", "");
      sheetStreak.textContent = streakText;
      sheetWallets.textContent = walletCount;

      // clone bubble pills into profile
      const src = $("#bubble-row");
      if (src && profileBubbles) {
        profileBubbles.innerHTML = src.innerHTML;
      }

      openSheet();
    });
  }

  if (btnCloseProfile && profileSheet) {
    btnCloseProfile.addEventListener("click", closeSheet);
    profileSheet.addEventListener("click", (e) => {
      if (e.target === profileSheet) closeSheet();
    });
  }

  if (btnOpenMenu && drawer) {
    btnOpenMenu.addEventListener("click", openDrawer);
  }
  if (btnCloseDrawer && drawer) {
    btnCloseDrawer.addEventListener("click", closeDrawer);
    drawer.addEventListener("click", (e) => {
      if (e.target === drawer) closeDrawer();
    });
  }
}

/* TABS */

function setupTabs() {
  const tabs = $$(".tab");
  const views = $$(".view");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");

      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      views.forEach((view) => {
        const viewKey = view.getAttribute("data-view");
        view.classList.toggle("active", viewKey === target);
      });
    });
  });
}

/* WALLET CONNECT (mock) */

function setupWalletConnectMock() {
  const btn = $("#btn-connect");
  const label = $("#connect-label");
  const walletChip = $("#chip-active");

  if (!btn || !label || !walletChip) return;

  let connected = false;

  btn.addEventListener("click", () => {
    connected = !connected;
    if (connected) {
      label.textContent = "Disconnect";
      walletChip.textContent = "1";
    } else {
      label.textContent = "Connect wallet";
      walletChip.textContent = "0";
    }
  });
}

/* MESH LOAD */

function setupMeshLoad() {
  const fill = $("#activity-fill");
  const text = $("#activity-text");
  const gasChip = $("#chip-gas");
  const btn = $("#btn-refresh-activity");

  if (!fill || !text || !gasChip || !btn) return;

  function pulse() {
    const load = Math.floor(Math.random() * 101); // 0–100
    fill.style.width = `${load}%`;

    if (load < 30) {
      text.textContent = "Quiet – packs are idling.";
    } else if (load < 70) {
      text.textContent = "Active – packs & XP are flowing.";
    } else {
      text.textContent = "Wild – packs are flying and XP orbs everywhere.";
    }

    // Fake gas est
    const gas = (0.12 + Math.random() * 0.18).toFixed(2);
    gasChip.textContent = `~${gas} gwei est.`;
  }

  pulse();
  btn.addEventListener("click", pulse);
}

/* BUBBLE MAP MOCK */

function setupBubbles() {
  const row = $("#bubble-row");
  if (!row) return;

  const sample = [
    { addr: "0xA9c...91f3", status: "Hot pulls" },
    { addr: "rainbow.vibe", status: "Swap spree" },
    { addr: "0x7Be...c101", status: "Burning commons" },
    { addr: "spawniz.eth", status: "Watching grails" },
    { addr: "0xF3d...88aa", status: "Idle" },
  ];

  row.innerHTML = "";
  sample.forEach((w) => {
    const pill = document.createElement("div");
    pill.className = "bubble-pill";
    pill.innerHTML = `
      <span class="bubble-dot"></span>
      <span class="bubble-label">${w.addr} · ${w.status}</span>
    `;
    row.appendChild(pill);
  });
}

/* OVERVIEW EVENTS MOCK */

function setupEvents() {
  const list = $("#overview-events");
  if (!list) return;

  const events = [
    {
      type: "PACK_OPEN",
      label: "0xA93…e1c2 → Neon Fragments (Rare)",
      ago: "10s ago",
    },
    {
      type: "BURN_COMMON",
      label: "0x4B1…aa32 → 3 commons → entropy fed",
      ago: "25s ago",
    },
    {
      type: "TOKEN_BUY",
      label: "0xD29…b81d → 420 SPAWN",
      ago: "1m ago",
    },
    {
      type: "QUEST_COMPLETE",
      label: "0x91F…ccd0 → Daily mesh quest",
      ago: "2m ago",
    },
  ];

  list.innerHTML = "";
  events.forEach((ev) => {
    const li = document.createElement("li");
    li.className = "event-item";
    li.innerHTML = `
      <div class="event-title">${ev.type}</div>
      <div class="event-meta">${ev.label} · ${ev.ago}</div>
    `;
    list.appendChild(li);
  });
}

/* PACK LIST MOCK */

function setupPacks() {
  const list = $("#pack-list");
  if (!list) return;

  const packs = [
    "Neon Fragment · Rare · opened",
    "Void Shard · Common · opened",
    "Shard Forge · Legendary · unopened",
    "Prime Relic · Epic · opened",
    "Spawn Core · Mythic · unopened",
  ];

  list.innerHTML = "";
  packs.forEach((p) => {
    const li = document.createElement("li");
    li.className = "event-item";
    li.innerHTML = `
      <div class="event-title">${p}</div>
    `;
    list.appendChild(li);
  });
}

/* WALLET LIST MOCK */

function setupWallets() {
  const list = $("#wallet-list");
  const btn = $("#btn-add-mock-wallet");
  if (!list || !btn) return;

  const baseWallets = [
    { label: "Main vault", addr: "0xF3a…92b0" },
    { label: "Sniping wallet", addr: "0x91c…7e10" },
  ];

  function render() {
    list.innerHTML = "";
    baseWallets.forEach((w) => {
      const row = document.createElement("div");
      row.className = "wallet-row";
      row.innerHTML = `
        <span>${w.addr}</span>
        <span class="wallet-tag">${w.label}</span>
      `;
      list.appendChild(row);
    });
  }

  render();

  btn.addEventListener("click", () => {
    const id = baseWallets.length + 1;
    baseWallets.push({
      label: "Mesh node " + id,
      addr:
        "0x" +
        Math.random().toString(16).slice(2, 6) +
        "…" +
        Math.random().toString(16).slice(2, 6),
    });
    render();
  });
}

/* DAILY STREAK */

function setupStreak() {
  let streakDays = 1;

  const counter = $("#streak-counter");
  const fill = $("#streak-fill");
  const copy = $("#streak-copy");
  const modal = $("#streak-modal");
  const modalFill = $("#streak-modal-fill");
  const modalText = $("#streak-modal-text");

  const btnOpen = $("#btn-open-streak");
  const btnClose = $("#btn-close-streak");
  const btnClaim = $("#btn-claim-streak");
  const btnSkip = $("#btn-skip-streak");

  if (
    !counter ||
    !fill ||
    !copy ||
    !modal ||
    !modalFill ||
    !modalText ||
    !btnOpen ||
    !btnClose ||
    !btnClaim ||
    !btnSkip
  ) {
    return;
  }

  function updateUI() {
    counter.textContent = `${streakDays} day${streakDays === 1 ? "" : "s"}`;
    const pct = Math.min((streakDays / 7) * 100, 100);
    fill.style.width = pct + "%";
    modalFill.style.width = pct + "%";

    const remaining = Math.max(0, 7 - streakDays);
    copy.textContent =
      remaining > 0
        ? `Keep the streak for ${remaining} more days for a full weekly run.`
        : "Full weekly run completed – mesh is glowing.";
    modalText.textContent = "Ping the mesh once per day to build your streak.";
  }

  updateUI();

  btnOpen.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  const closeModal = () => modal.classList.add("hidden");

  btnClose.addEventListener("click", closeModal);
  btnSkip.addEventListener("click", closeModal);

  btnClaim.addEventListener("click", () => {
    streakDays = Math.min(streakDays + 1, 7);
    updateUI();
    closeModal();
  });
}

/* PULL LAB LUCK ENGINE */

function setupPullLab() {
  const fill = $("#lab-fill");
  const text = $("#lab-text");
  const btn = $("#btn-roll-luck");
  if (!fill || !btn || !text) return;

  btn.addEventListener("click", () => {
    const val = 20 + Math.random() * 60;
    fill.style.width = `${val}%`;

    if (val < 35) {
      text.textContent = "Low entropy – better save packs for later.";
    } else if (val < 70) {
      text.textContent = "Decent luck – streak XP feels solid.";
    } else {
      text.textContent = "Cracked odds – today is a good day to rip packs.";
    }
  });
}