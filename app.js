// Init WebGL background + HUD logic

document.addEventListener("DOMContentLoaded", () => {
  // WebGL mesh background
  const canvas = document.getElementById("mesh-canvas");
  if (canvas && window.initMeshExplorer) {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    window.initMeshExplorer(canvas, { lowGPU: isMobile });
  }

  const tabs = document.querySelectorAll(".nav-btn");
  const panels = document.querySelectorAll(".tab-panel");
  const bottomNav = document.getElementById("bottom-nav");

  function setTab(tab) {
    panels.forEach((p) =>
      p.id === `tab-${tab}`
        ? p.classList.add("tab-panel-active")
        : p.classList.remove("tab-panel-active")
    );
    tabs.forEach((b) =>
      b.dataset.tabTarget === tab
        ? b.classList.add("nav-btn-active")
        : b.classList.remove("nav-btn-active")
    );
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => setTab(btn.dataset.tabTarget));
  });

  // Nav hide on scroll
  let lastScroll = 0;
  window.addEventListener("scroll", () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (y > lastScroll + 5) {
      bottomNav.classList.add("nav-hidden");
    } else if (y < lastScroll - 5) {
      bottomNav.classList.remove("nav-hidden");
    }
    lastScroll = y;
  });

  // Toast helper
  const toastEl = document.getElementById("toast");
  let toastTimeout;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("toast-show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(
      () => toastEl.classList.remove("toast-show"),
      2200
    );
  }

  // Mock data
  const homeActivity = [
    "0xspawn maintained streak of 2 days.",
    "Opened Starter mesh pack · gained +120 XP.",
    "Minted 1× Relic from Pull Lab.",
    "Docked app 'Tiny Legends Tracker' to mesh.",
    "Received +15 XP from Farcaster quest frame.",
  ];

  const meshEvents = [
    "Wallet 0xabc routed 3 pack pulls through Creator X.",
    "Gravity shift: Creator Y cluster saw +200% XP flow.",
    "High-volume wallet burned 50% of a meme coin.",
    "Alpha hunter wallet bridged in new liquidity.",
    "Mesh entropy window updated (mock data).",
  ];

  const quests = [
    {
      label: "Daily",
      title: "Check in and keep your streak alive",
      reward: "+25 XP",
    },
    {
      label: "Base quest",
      title: "Mint any Base NFT today",
      reward: "+35 XP · 1 Fragment",
    },
    {
      label: "Creator quest",
      title: "Buy 10 tokens from a new creator",
      reward: "+100 XP · 1 Shard",
    },
    {
      label: "Tribe quest",
      title: "Reach 5 combined streak days in your Tribe",
      reward: "+200 XP · Tribe badge (mock)",
    },
  ];

  // Render feeds

  const homeActivityList = document.getElementById("homeActivityList");
  homeActivity.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t;
    homeActivityList.appendChild(li);
  });

  const meshEventsList = document.getElementById("meshEvents");
  meshEvents.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t;
    meshEventsList.appendChild(li);
  });

  const questList = document.getElementById("questList");
  quests.forEach((q) => {
    const li = document.createElement("li");
    li.className = "quest-item";
    li.innerHTML = `
      <div class="quest-label">${q.label}</div>
      <div class="quest-title">${q.title}</div>
      <div class="quest-reward">${q.reward}</div>
    `;
    questList.appendChild(li);
  });

  // Streak / XP check-in mock
  const streakDaysEl = document.getElementById("streakDays");
  const streakRemainingEl = document.getElementById("streakRemaining");
  const xpBalanceEl = document.getElementById("xpBalance");
  let streakDays = 1;
  let streakRemaining = 6;
  let xpBalance = 1575;

  document.getElementById("btn-checkin").addEventListener("click", () => {
    streakDays += 1;
    streakRemaining = Math.max(0, streakRemaining - 1);
    xpBalance += 25;

    streakDaysEl.textContent = String(streakDays);
    streakRemainingEl.textContent = String(streakRemaining);
    xpBalanceEl.textContent = `${xpBalance} XP`;

    showToast("Check-in recorded · +25 XP");
  });

  // Loot tab subviews
  const lootButtons = document.querySelectorAll("[data-loot-view]");
  lootButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.lootView;
      document
        .querySelectorAll(".loot-view")
        .forEach((v) => v.classList.remove("loot-view-active"));
      document
        .getElementById(`lootView-${view}`)
        .classList.add("loot-view-active");

      lootButtons.forEach((b) =>
        b === btn
          ? b.classList.add("segmented-btn-active")
          : b.classList.remove("segmented-btn-active")
      );
    });
  });

  // Mock inventory
  document.getElementById("invFragments").textContent = "12";
  document.getElementById("invShards").textContent = "3";
  document.getElementById("invRelics").textContent = "1";

  // Pack open simulation
  const lootEventsEl = document.getElementById("lootEvents");
  document.getElementById("btn-open-pack").addEventListener("click", () => {
    const gainedXp = 120;
    xpBalance += gainedXp;
    xpBalanceEl.textContent = `${xpBalance} XP`;

    const li = document.createElement("li");
    li.textContent =
      "Opened Starter mesh pack · +2 Fragments · chance roll on Shard (demo).";
    lootEventsEl.prepend(li);

    showToast(`Pack opened · +${gainedXp} XP`);
  });

  document
    .getElementById("btn-simulate-synth")
    .addEventListener("click", () => {
      document.getElementById("labResult").textContent =
        "Synthesis demo: 4× Fragments → 1× Shard, 2× Shards → 1× Relic (mock only).";
      showToast("Pull Lab synthesis simulated");
    });

  // Mesh mode copy
  const meshModeCopy = document.getElementById("meshModeCopy");
  const meshModeButtons = document.querySelectorAll("[data-mesh-mode]");
  meshModeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      meshModeButtons.forEach((b) =>
        b === btn
          ? b.classList.add("segmented-btn-active")
          : b.classList.remove("segmented-btn-active")
      );
      const mode = btn.dataset.meshMode;
      if (mode === "alpha") {
        meshModeCopy.innerHTML =
          'Viewing mesh demo in <strong>Alpha hunters</strong> mode — wallets with the most pack activity glow hotter along the mesh.';
      } else if (mode === "new") {
        meshModeCopy.innerHTML =
          'Viewing mesh demo in <strong>New creators</strong> mode — fresh tokens spawning new micro-clusters.';
      } else {
        meshModeCopy.innerHTML =
          'Viewing mesh demo in <strong>Gravity clusters</strong> mode — wallets with the largest XP streams bend the mesh around them.';
      }
    });
  });

  document
    .getElementById("btn-open-full-mesh")
    .addEventListener("click", () => {
      window.location.href = "mesh.html";
    });

  // Account sheet
  const accountSheet = document.getElementById("account-sheet");
  const btnAccount = document.getElementById("btn-account");
  const btnCloseAccount = document.getElementById("btn-close-account");

  function openAccountSheet() {
    accountSheet.classList.add("sheet-backdrop-active");
  }
  function closeAccountSheet() {
    accountSheet.classList.remove("sheet-backdrop-active");
  }

  btnAccount.addEventListener("click", openAccountSheet);
  btnCloseAccount.addEventListener("click", closeAccountSheet);
  accountSheet.addEventListener("click", (e) => {
    if (e.target === accountSheet) closeAccountSheet();
  });

  accountSheet.querySelectorAll(".sheet-row").forEach((row) => {
    row.addEventListener("click", () => {
      const action = row.dataset.action;
      switch (action) {
        case "referrals":
          showToast("Referrals · future XP share & invite codes");
          break;
        case "earnings":
          showToast("Earnings · mock PnL dashboard coming later");
          break;
        case "collectibles":
          showToast("Collectibles · link to Zora / Vibe collections");
          break;
        case "swap-wallet":
          showToast("Swap wallet · open wallet selector (future)");
          break;
        case "logout":
          showToast("Wallet disconnected (demo)");
          break;
      }
    });
  });

  // Settings sheet
  const settingsSheet = document.getElementById("settings-sheet");
  const btnSettings = document.getElementById("btn-settings");
  const btnSettingsBack = document.getElementById("btn-settings-back");
  const btnCloseSettings = document.getElementById("btn-close-settings");

  function openSettings() {
    settingsSheet.classList.add("sheet-backdrop-active");
  }
  function closeSettings() {
    settingsSheet.classList.remove("sheet-backdrop-active");
  }

  btnSettings.addEventListener("click", openSettings);
  btnSettingsBack.addEventListener("click", closeSettings);
  btnCloseSettings.addEventListener("click", closeSettings);
  settingsSheet.addEventListener("click", (e) => {
    if (e.target === settingsSheet) closeSettings();
  });
});