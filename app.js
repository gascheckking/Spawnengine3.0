// app.js
// SpawnEngine — Mesh HUD v0.3 (frontend-logik)

(function () {
  // -----------------------------
  // STATE
  // -----------------------------
  let xp = 1575;
  let spawnBalance = 497;
  let streakDays = 1;
  let streakWeeklyTarget = 7;
  let homeActivity = [];
  let meshActivity = [];
  let lootActivity = [];

  let invFragments = 12;
  let invShards = 3;
  let invRelics = 1;

  let hasCheckedInToday = false;

  // För enkel mock av gas och wallets
  let gasEstimateValue = 0.21;
  let activeWalletsValue = 1;

  // -----------------------------
  // DOM HELPERS
  // -----------------------------
  function $(selector) {
    return document.querySelector(selector);
  }

  function $all(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function setText(id, value) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    if (el) el.textContent = value;
  }

  function showElement(el) {
    if (!el) return;
    el.style.display = "flex";
  }

  function hideElement(el) {
    if (!el) return;
    el.style.display = "none";
  }

  // -----------------------------
  // TOAST
  // -----------------------------
  let toastTimeout = null;

  function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("toast-visible");

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove("toast-visible");
    }, 2600);
  }

  // -----------------------------
  // ACTIVITY LOGGING
  // -----------------------------
  function addActivity(list, item) {
    list.unshift(item);
    // cap 20 entries per list
    if (list.length > 20) list.pop();
  }

  function renderActivityList(list, ulEl) {
    if (!ulEl) return;
    ulEl.innerHTML = "";
    list.forEach((item) => {
      const li = document.createElement("li");
      li.className = "activity-item";
      li.dataset.type = item.type || "misc";

      const title = document.createElement("div");
      title.className = "activity-title";
      title.textContent = item.title;

      const meta = document.createElement("div");
      meta.className = "activity-meta";
      meta.textContent = item.meta;

      li.appendChild(title);
      li.appendChild(meta);
      ulEl.appendChild(li);
    });
  }

  function logMeshEvent(title, meta, type = "mesh") {
    const entry = {
      title,
      meta,
      type,
      ts: Date.now(),
    };
    addActivity(meshActivity, entry);
    const meshList = document.getElementById("meshEvents");
    renderActivityList(meshActivity, meshList);
  }

  function logHomeEvent(title, meta, type = "general") {
    const entry = {
      title,
      meta,
      type,
      ts: Date.now(),
    };
    addActivity(homeActivity, entry);
    const homeList = document.getElementById("homeActivityList");
    renderActivityList(homeActivity, homeList);
  }

  function logLootEvent(title, meta, type = "loot") {
    const entry = {
      title,
      meta,
      type,
      ts: Date.now(),
    };
    addActivity(lootActivity, entry);
    const lootList = document.getElementById("lootEvents");
    renderActivityList(lootActivity, lootList);
  }

  // -----------------------------
  // STATS / METRICS RENDER
  // -----------------------------
  function renderStats() {
    setText("xpBalance", `${xp} XP`);
    setText("spawnBalance", `${spawnBalance} SPN`);
    setText("streakDays", streakDays);
    const remaining = Math.max(streakWeeklyTarget - streakDays, 0);
    setText("streakRemaining", remaining);

    setText("gasEstimate", `~${gasEstimateValue.toFixed(2)} gwei est.`);
    setText("activeWallets", activeWalletsValue);
    setText("invFragments", invFragments);
    setText("invShards", invShards);
    setText("invRelics", invRelics);
  }

  // -----------------------------
  // BOTTOM NAV / TABS
  // -----------------------------
  function initTabs() {
    const navButtons = $all(".bottom-nav .nav-btn");
    const panels = $all(".tab-panel");

    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab-target");
        if (!target) return;

        navButtons.forEach((b) => b.classList.remove("nav-btn-active"));
        btn.classList.add("nav-btn-active");

        panels.forEach((panel) => {
          if (panel.id === `tab-${target}`) {
            panel.classList.add("tab-panel-active");
          } else {
            panel.classList.remove("tab-panel-active");
          }
        });
      });
    });
  }

  // -----------------------------
  // HOME: CHECK-IN
  // -----------------------------
  function initCheckIn() {
    const btn = $("#btn-checkin");
    if (!btn) return;

    btn.addEventListener("click", () => {
      if (hasCheckedInToday) {
        showToast("You already checked in · streak saved");
        return;
      }

      hasCheckedInToday = true;
      streakDays += 1;
      xp += 25; // base XP reward
      spawnBalance += 3; // liten bonus

      renderStats();
      logHomeEvent("Daily check-in complete", "+25 XP · streak advanced", "quest");
      logMeshEvent(
        "Streak ping recorded",
        "Mesh stream updated from daily ritual",
        "mesh"
      );

      showToast("Streak +1 · XP +25");
    });
  }

  // -----------------------------
  // LOOT / PACKS / LAB / INVENTORY
  // -----------------------------
  function initLootViews() {
    const segmentedButtons = $all(".segmented-btn[data-loot-view]");
    const lootViews = $all(".loot-view");

    segmentedButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const view = btn.getAttribute("data-loot-view");
        segmentedButtons.forEach((b) =>
          b.classList.remove("segmented-btn-active")
        );
        btn.classList.add("segmented-btn-active");

        lootViews.forEach((lv) => {
          if (lv.id === `lootView-${view}`) {
            lv.classList.add("loot-view-active");
          } else {
            lv.classList.remove("loot-view-active");
          }
        });
      });
    });

    // PACK OPEN
    const btnOpenPack = $("#btn-open-pack");
    if (btnOpenPack) {
      btnOpenPack.addEventListener("click", () => {
        // enkel mock: 3–5 fragments, chans på shard/relic
        const fragmentCount = 3 + Math.floor(Math.random() * 3);
        const gotShard = Math.random() < 0.4;
        const gotRelic = !gotShard && Math.random() < 0.12;

        invFragments += fragmentCount;
        if (gotShard) invShards += 1;
        if (gotRelic) invRelics += 1;

        const gainedXP = 40 + Math.floor(Math.random() * 40);
        xp += gainedXP;

        renderStats();

        const summaryParts = [`+${fragmentCount} Fragments`];
        if (gotShard) summaryParts.push("+1 Shard");
        if (gotRelic) summaryParts.push("+1 Relic");

        const summary = summaryParts.join(" · ");

        logLootEvent("Opened Starter mesh pack", `${summary} · +${gainedXP} XP`);
        logHomeEvent("Pack opened", summary, "pack");
        logMeshEvent("Pack stream pulse", "New loot opened in the mesh", "pack");

        showToast("Pack opened · loot added");
      });
    }

    // LAB SYNTH
    const btnSynth = $("#btn-simulate-synth");
    const labResult = $("#labResult");
    if (btnSynth && labResult) {
      btnSynth.addEventListener("click", () => {
        if (invFragments < 3 && invShards < 1) {
          labResult.textContent = "Not enough Fragments/Shards to synthesize.";
          return;
        }

        let result;
        if (invShards >= 1 && Math.random() < 0.6) {
          // shard → relic
          invShards -= 1;
          invRelics += 1;
          xp += 80;
          result = "Shard fused into a new Relic · +80 XP";
        } else {
          // fragments → shard
          const cost = Math.min(5, invFragments);
          invFragments -= cost;
          invShards += 1;
          xp += 45;
          result = `${cost} Fragments fused into a Shard · +45 XP`;
        }

        renderStats();
        labResult.textContent = result;
        logLootEvent("Pull Lab synthesis", result, "lab");
        logMeshEvent("Lab event", "Synthesis update in mesh state", "lab");
        logHomeEvent("Lab action", result, "lab");
        showToast("Synthesis complete");
      });
    }
  }

  // -----------------------------
  // QUESTS
  // -----------------------------
  function initQuests() {
    const questList = $("#questList");
    if (!questList) return;

    const quests = [
      {
        id: "q-checkin",
        title: "Daily ritual · Check in",
        desc: "Hit your daily streak check-in inside the mesh HUD.",
        xp: 20,
      },
      {
        id: "q-pack-open",
        title: "Open 1 mesh pack",
        desc: "Simulate at least one Starter mesh pack today.",
        xp: 40,
      },
      {
        id: "q-share",
        title: "Share your mesh",
        desc: "Share a screenshot or cast of your mesh HUD.",
        xp: 35,
      },
      {
        id: "q-explore",
        title: "Tap through the Mesh explorer",
        desc: "Open the Mesh tab and trigger at least one mesh event.",
        xp: 30,
      },
      {
        id: "q-support",
        title: "Answer a SupCast-style question",
        desc: "Mock: imagine claiming & solving a support case.",
        xp: 50,
      },
    ];

    questList.innerHTML = "";

    quests.forEach((q) => {
      const li = document.createElement("li");
      li.className = "quest-item";
      li.dataset.questId = q.id;

      const title = document.createElement("div");
      title.className = "quest-title";
      title.textContent = q.title;

      const desc = document.createElement("div");
      desc.className = "quest-desc";
      desc.textContent = q.desc;

      const footer = document.createElement("div");
      footer.className = "quest-footer";

      const xpTag = document.createElement("span");
      xpTag.className = "quest-xp";
      xpTag.textContent = `+${q.xp} XP`;

      const btn = document.createElement("button");
      btn.className = "btn-outline quest-complete-btn";
      btn.textContent = "Complete (mock)";
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.textContent = "Completed";

        xp += q.xp;
        renderStats();
        showToast(`Quest complete · +${q.xp} XP`);

        logHomeEvent(q.title, `Completed · +${q.xp} XP`, "quest");
        logMeshEvent("Quest pulse", `${q.id} completed`, "quest");
      });

      footer.appendChild(xpTag);
      footer.appendChild(btn);

      li.appendChild(title);
      li.appendChild(desc);
      li.appendChild(footer);
      questList.appendChild(li);
    });
  }

  // -----------------------------
  // MESH TAB (mode copy)
  // -----------------------------
  function initMeshTab() {
    const buttons = $all(".segmented-btn[data-mesh-mode]");
    const copyEl = $("#meshModeCopy");
    if (!buttons.length || !copyEl) return;

    const copyMap = {
      alpha:
        "Viewing mesh demo in Alpha hunters mode — wallets with aggressive pack activity flare brighter.",
      new: "Viewing mesh demo in New creators mode — fresh contracts and spin-up clusters bubble to the surface.",
      gravity:
        "Viewing mesh demo in Gravity clusters mode — wallets with the largest XP streams bend the mesh around them.",
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-mesh-mode");
        buttons.forEach((b) => b.classList.remove("segmented-btn-active"));
        btn.classList.add("segmented-btn-active");

        const text = copyMap[mode] || copyMap.gravity;
        copyEl.innerHTML = text.replace(
          "Gravity clusters",
          "<strong>Gravity clusters</strong>"
        );

        logMeshEvent(
          "Mesh mode switched",
          `User selected ${mode} mesh filter`,
          "mesh-mode"
        );
      });
    });

    const btnFullMesh = $("#btn-open-full-mesh");
    if (btnFullMesh) {
      btnFullMesh.addEventListener("click", () => {
        logMeshEvent(
          "Full Mesh Explorer",
          "User opened full-screen mesh demo (mock)",
          "mesh"
        );
        showToast("Full Mesh Explorer is mock-only for now");
        // Här kan du senare: window.location.href = "/mesh.html";
      });
    }
  }

  // -----------------------------
  // ACCOUNT SHEET
  // -----------------------------
  function initAccountSheet() {
    const btnAccount = $("#btn-account");
    const sheet = $("#account-sheet");
    const btnClose = $("#btn-close-account");
    if (!btnAccount || !sheet || !btnClose) return;

    function openSheet() {
      showElement(sheet);

      // push state så back-knappen kan stänga
      history.pushState({ sheet: "account" }, "", "#account");
    }

    function closeSheet(fromPopState = false) {
      hideElement(sheet);
      if (!fromPopState && location.hash === "#account") {
        history.back();
      }
    }

    btnAccount.addEventListener("click", openSheet);
    btnClose.addEventListener("click", () => closeSheet(false));

    sheet.addEventListener("click", (e) => {
      if (e.target === sheet) {
        closeSheet(false);
      }
    });

    // Sheet actions
    sheet.addEventListener("click", (e) => {
      const row = e.target.closest(".sheet-row");
      if (!row) return;
      const action = row.getAttribute("data-action");
      if (!action) return;

      switch (action) {
        case "referrals":
          showToast("Referrals panel (mock) · track earned XP & SPN");
          logHomeEvent(
            "Opened Referrals",
            "Referral dashboard accessed (mock)",
            "referral"
          );
          break;
        case "earnings":
          showToast("Earnings overview (mock) · mesh rewards summary");
          logHomeEvent(
            "Opened Earnings",
            "Earnings dashboard accessed (mock)",
            "earnings"
          );
          break;
        case "collectibles":
          showToast("Collectibles (mock) · packs & onchain items");
          logHomeEvent(
            "Opened Collectibles",
            "Collectibles overview accessed (mock)",
            "collectibles"
          );
          break;
        case "swap-wallet":
          showToast("Swap wallet (mock) · choose another Base address");
          logHomeEvent(
            "Swap wallet",
            "Wallet swap flow opened (mock)",
            "wallet"
          );
          break;
        case "logout":
          showToast("Disconnected (mock) · wallet/session cleared");
          logHomeEvent(
            "Log out",
            "User disconnected from HUD (mock)",
            "session"
          );
          break;
        default:
          break;
      }
    });

    // Popstate för back-knapp
    window.addEventListener("popstate", (event) => {
      if (event.state && event.state.sheet === "account") {
        // state försvinner när vi backar, så bara se till att det är stängt
        hideElement(sheet);
      }
    });
  }

  // -----------------------------
  // SETTINGS SHEET
  // -----------------------------
  function initSettingsSheet() {
    const btnSettings = $("#btn-settings");
    const sheet = $("#settings-sheet");
    const btnClose = $("#btn-close-settings");
    const btnBack = $("#btn-settings-back");

    if (!btnSettings || !sheet || !btnClose || !btnBack) return;

    function openSheet() {
      showElement(sheet);
      history.pushState({ sheet: "settings" }, "", "#settings");
    }

    function closeSheet(fromPopState = false) {
      hideElement(sheet);
      if (!fromPopState && location.hash === "#settings") {
        history.back();
      }
    }

    btnSettings.addEventListener("click", openSheet);
    btnClose.addEventListener("click", () => closeSheet(false));
    btnBack.addEventListener("click", () => closeSheet(false));

    sheet.addEventListener("click", (e) => {
      if (e.target === sheet) {
        closeSheet(false);
      }
    });

    // Exempel: klick på settings-rader
    const rows = sheet.querySelectorAll(".settings-row");
    rows.forEach((row) => {
      row.addEventListener("click", () => {
        const label = row.textContent.trim();
        showToast(`Settings: ${label} (mock)`);
        logHomeEvent("Settings interaction", label, "settings");
      });
    });

    window.addEventListener("popstate", (event) => {
      if (event.state && event.state.sheet === "settings") {
        hideElement(sheet);
      }
    });
  }

  // -----------------------------
  // BOTTOM NAV: HIDES ON SCROLL
  // -----------------------------
  function initBottomNavScrollHide() {
    const nav = $("#bottom-nav");
    if (!nav) return;

    let lastY = window.scrollY;

    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      if (y > lastY + 12) {
        nav.classList.add("bottom-nav-hidden");
      } else if (y < lastY - 12) {
        nav.classList.remove("bottom-nav-hidden");
      }
      lastY = y;
    });
  }

  // -----------------------------
  // REAL-TIME ACTIVITY PULSE (mock)
  // -----------------------------
  function initLivePulse() {
    const types = ["pack", "quest", "social", "xp", "mesh"];

    function randomItem(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    const titles = [
      "Wallet bridged XP",
      "Pack opened on Base",
      "New creator coin ping",
      "Mesh streak updated",
      "SupCast-style support ping",
    ];

    const metas = [
      "+12 XP · small pulse",
      "+40 XP · pack streak",
      "Creator hook event",
      "XP stream rebalanced",
      "Support answered · +25 XP",
    ];

    setInterval(() => {
      // liten chans för fake event, inte hela tiden
      if (Math.random() < 0.4) {
        const t = randomItem(titles);
        const m = randomItem(metas);
        const type = randomItem(types);

        logHomeEvent(t, m, type);
      }
    }, 5500);
  }

  // -----------------------------
  // OPTIONAL: ACTIVITY FILTERS (om HTML har dem)
  // -----------------------------
  function initActivityFilters() {
    const filterButtons = $all("[data-activity-filter]");
    const list = $("#homeActivityList");
    if (!filterButtons.length || !list) return;

    function applyFilter(filter) {
      const items = list.querySelectorAll(".activity-item");
      items.forEach((li) => {
        const type = li.dataset.type || "general";
        if (filter === "all" || type === filter) {
          li.style.display = "";
        } else {
          li.style.display = "none";
        }
      });
    }

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.getAttribute("data-activity-filter");
        filterButtons.forEach((b) =>
          b.classList.remove("activity-filter-active")
        );
        btn.classList.add("activity-filter-active");
        applyFilter(filter || "all");
      });
    });

    // default
    applyFilter("all");
  }

  // -----------------------------
  // INIT
  // -----------------------------
  document.addEventListener("DOMContentLoaded", () => {
    renderStats();
    initTabs();
    initCheckIn();
    initLootViews();
    initQuests();
    initMeshTab();
    initAccountSheet();
    initSettingsSheet();
    initBottomNavScrollHide();
    initLivePulse();
    initActivityFilters();

    // Seed: visa några start-events så listorna inte är tomma
    logHomeEvent(
      "Mesh HUD booted",
      "SpawnEngine v0.3 mock mesh online",
      "system"
    );
    logMeshEvent(
      "Mesh background running",
      "WebGL nodes/orbits initialized (demo)",
      "system"
    );
  });
})();