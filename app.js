// ---------- UTIL ----------

function $(selector, scope = document) {
  return scope.querySelector(selector);
}
function $all(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}

// ---------- BACKGROUND MESH (CANVAS) ----------

(function initMeshBackground() {
  const canvas = document.getElementById("meshCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const nodes = [];
  const colors = [
    "rgba(34,211,238,0.8)",
    "rgba(59,130,246,0.8)",
    "rgba(16,185,129,0.8)",
    "rgba(244,114,182,0.8)",
  ];

  for (let i = 0; i < 18; i++) {
    nodes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: 2 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
      color: colors[i % colors.length],
    });
  }

  function step() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Connections
    ctx.lineWidth = 0.4;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.beginPath();
          ctx.globalAlpha = 1 - dist / 140;
          ctx.strokeStyle = "rgba(56,189,248,0.24)";
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    // Nodes
    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      n.phase += 0.04;

      if (n.x < 0 || n.x > window.innerWidth) n.vx *= -1;
      if (n.y < 0 || n.y > window.innerHeight) n.vy *= -1;

      const pulse = 1 + Math.sin(n.phase) * 0.35;

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.shadowColor = n.color;
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    requestAnimationFrame(step);
  }
  step();
})();

// ---------- SETTINGS SHEET & ROLES ----------

(function initSettings() {
  const sheetBackdrop = $("#settings-backdrop");
  const btnOpen = $("#settings-btn");
  const btnClose = $("#settings-close");
  const roleCards = $all(".role-card");
  const saveRoleBtn = $("#save-role");
  const rolePill = $("#meshRolePill");

  if (!sheetBackdrop) return;

  const STORAGE_KEY_ROLE = "meshRole";

  function openSheet() {
    sheetBackdrop.classList.remove("hidden");
  }
  function closeSheet() {
    sheetBackdrop.classList.add("hidden");
  }

  btnOpen?.addEventListener("click", openSheet);
  btnClose?.addEventListener("click", closeSheet);
  sheetBackdrop.addEventListener("click", (e) => {
    if (e.target === sheetBackdrop) closeSheet();
  });

  let selectedRole = null;

  roleCards.forEach((card) => {
    card.addEventListener("click", () => {
      roleCards.forEach((c) => c.classList.remove("role-selected"));
      card.classList.add("role-selected");
      selectedRole = card.dataset.role || null;
      saveRoleBtn.disabled = !selectedRole;
    });
  });

  saveRoleBtn?.addEventListener("click", () => {
    if (!selectedRole) return;
    localStorage.setItem(STORAGE_KEY_ROLE, selectedRole);
    const label = {
      dev: "Dev / Builder",
      creator: "Creator / Artist",
      hunter: "Alpha hunter",
      collector: "Collector / Fan",
    }[selectedRole];
    if (rolePill) rolePill.textContent = label || "Mesh role";
    showToast(`Role set to ${label}`);
    closeSheet();
  });

  // Load previous role
  const stored = localStorage.getItem(STORAGE_KEY_ROLE);
  if (stored) {
    const card = roleCards.find((c) => c.dataset.role === stored);
    if (card) card.classList.add("role-selected");
    saveRoleBtn.disabled = false;
    const label = {
      dev: "Dev / Builder",
      creator: "Creator / Artist",
      hunter: "Alpha hunter",
      collector: "Collector / Fan",
    }[stored];
    if (rolePill) rolePill.textContent = label || "Mesh role";
  }
})();

// ---------- TABS (TOP + BOTTOM NAV) ----------

(function initTabs() {
  const topButtons = $all(".mesh-nav-btn");
  const bottomButtons = $all(".bottom-nav-btn");
  const panels = $all(".tab-panel");

  function activateTab(tab) {
    if (!tab) return;
    panels.forEach((p) =>
      p.classList.toggle("tab-panel-active", p.id === `tab-${tab}`)
    );
    topButtons.forEach((btn) =>
      btn.classList.toggle("is-active", btn.dataset.tab === tab)
    );
    bottomButtons.forEach((btn) =>
      btn.classList.toggle("is-active", btn.dataset.tab === tab)
    );
  }

  [...topButtons, ...bottomButtons].forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      activateTab(tab);
    });
  });

  activateTab("home");
})();

// ---------- STREAK ENGINE ----------

(function initStreak() {
  const daysEl = $("#streakDays");
  const remainingEl = $("#streakRemaining");
  const barFill = $("#streakBarFill");
  const btn = $("#btn-checkin");

  const STORAGE_STREAK_DAYS = "meshStreakDays";
  const STORAGE_STREAK_LAST = "meshStreakLast";

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  function load() {
    const days = parseInt(localStorage.getItem(STORAGE_STREAK_DAYS) || "1", 10);
    const last = localStorage.getItem(STORAGE_STREAK_LAST) || "";
    return { days, last };
  }

  function save(days) {
    localStorage.setItem(STORAGE_STREAK_DAYS, String(days));
    localStorage.setItem(STORAGE_STREAK_LAST, todayKey());
  }

  function render(days) {
    if (daysEl) daysEl.textContent = String(days);
    const remaining = Math.max(0, 7 - days);
    if (remainingEl) remainingEl.textContent = String(remaining);
    if (barFill) {
      const pct = Math.min(100, (days / 7) * 100);
      barFill.style.width = `${Math.max(12, pct)}%`;
    }
  }

  const { days, last } = load();
  render(days);

  btn?.addEventListener("click", () => {
    const nowKey = todayKey();
    const current = load();
    if (current.last === nowKey) {
      showToast("You already checked in today.");
      return;
    }
    const newDays =
      current.last &&
      new Date(current.last).getDate() + 1 !== new Date().getDate()
        ? 1
        : current.days + 1;
    save(newDays);
    render(newDays);
    showToast("Daily check-in added to your mesh streak.");
  });
})();

// ---------- MOCK DATA HELPERS ----------

function pushEvent(listEl, payload, max = 16) {
  if (!listEl) return;
  const li = document.createElement("li");
  li.className = "activity-item";
  li.innerHTML = `
    <div class="activity-title">${payload.title}</div>
    <div class="activity-meta">${payload.meta}</div>
  `;
  listEl.prepend(li);
  while (listEl.children.length > max) {
    listEl.removeChild(listEl.lastChild);
  }
}

// ---------- HOME FEED ----------

(function initHomeFeed() {
  const list = $("#homeActivityList");
  if (!list) return;

  const seedEvents = [
    {
      title: "Spawniz minted 3 packs on VibeMarket",
      meta: "1 min ago · pack_open · +120 XP",
    },
    {
      title: "feetsniffer.eth bought 250 of your Zora coin",
      meta: "12 min ago · token_buy · +320 XP",
    },
    {
      title: "Daily mesh check-in completed",
      meta: "Today · streak · +25 XP",
    },
  ];

  seedEvents.forEach((e) => pushEvent(list, e));

  // Periodic mock events
  setInterval(() => {
    const samples = [
      {
        title: "New follower bridged to Base",
        meta: "Live mesh · bridge event",
      },
      {
        title: "SpawnEngine booster opened (mock)",
        meta: "Loot lab · 1 Shard, 2 Fragments",
      },
      {
        title: "SupCast reply marked as solved",
        meta: "Support mesh · +45 XP",
      },
    ];
    const ev = samples[Math.floor(Math.random() * samples.length)];
    pushEvent(list, ev);
  }, 14000);
})();

// ---------- LOOT / SLOT / HISTORY ----------

(function initLoot() {
  const lootViews = {
    packs: $("#lootView-packs"),
    slot: $("#lootView-slot"),
    history: $("#lootView-history"),
  };
  const segButtons = $all(".segmented-btn[data-loot-view]");
  const lootEventsList = $("#lootEvents");
  const lootHistoryList = $("#lootHistory");
  const btnOpenPack = $("#btn-open-pack");
  const slotReels = $all(".slot-reel", $("#lootView-slot"));
  const btnSlotSpin = $("#btn-slot-spin");
  const slotResult = $("#slotResult");

  function setLootView(view) {
    Object.entries(lootViews).forEach(([key, el]) => {
      if (!el) return;
      el.classList.toggle("loot-view-active", key === view);
    });
    segButtons.forEach((b) =>
      b.classList.toggle(
        "segmented-btn-active",
        b.dataset.lootView === view
      )
    );
  }

  segButtons.forEach((btn) => {
    btn.addEventListener("click", () => setLootView(btn.dataset.lootView));
  });
  setLootView("packs");

  btnOpenPack?.addEventListener("click", () => {
    const outcomes = [
      "2x Fragments · 1x Shard",
      "1x Core · 2x Fragments",
      "3x Fragments",
      "1x Shard · 1x Fragment",
    ];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    const payload = {
      title: "Simulated pack open",
      meta: `${new Date().toLocaleTimeString()} · ${outcome}`,
    };
    pushEvent(lootEventsList, payload);
    pushEvent(lootHistoryList, payload);
    showToast("Simulated pack open · loot updated.");
  });

  btnSlotSpin?.addEventListener("click", () => {
    const symbols = ["❇️", "💠", "✨", "🌀", "⭐️", "🧬"];
    slotReels.forEach((r) => {
      r.classList.remove("spin");
      void r.offsetWidth; // restart animation
      r.classList.add("spin");
    });

    setTimeout(() => {
      const result = [];
      slotReels.forEach((r) => {
        const sym = symbols[Math.floor(Math.random() * symbols.length)];
        r.textContent = sym;
        result.push(sym);
        r.classList.remove("spin");
      });

      const win =
        result[0] === result[1] && result[1] === result[2]
          ? "Mesh win! Rare concept unlocked."
          : "No match – but you unlocked a new UX idea.";
      if (slotResult) slotResult.textContent = win;

      const payload = {
        title: "Slot spin (mock)",
        meta: `${new Date().toLocaleTimeString()} · ${result.join(" ")} · ${
          win.includes("win") ? "RARE" : "MISS"
        }`,
      };
      pushEvent(lootHistoryList, payload);
      showToast("Slot spin simulated.");
    }, 650);
  });
})();

// ---------- MARKET ----------

(function initMarket() {
  const grid = $("#marketGrid");
  const filterButtons = $all(".market-filter-chip");
  const emptyLabel = $("#marketEmpty");

  if (!grid) return;

  const listings = [
    {
      id: 1,
      title: "SpawnEngine Booster v1",
      meta: "Pack · 0.025 ETH · 128 supply",
      tagline: "Base-native creator pack for XP hunters.",
      type: "packs",
    },
    {
      id: 2,
      title: "$SPAWNIZ creator token",
      meta: "Token · warped mesh index",
      tagline: "Utility + reputation for Mesh architects.",
      type: "tokens",
    },
    {
      id: 3,
      title: "WarpAI · Zora coin",
      meta: "Token · Zora Base",
      tagline: "XP-driven activity tracker for mints.",
      type: "tokens",
    },
    {
      id: 4,
      title: "VibeMarket Booster Slot",
      meta: "Service · UX module",
      tagline: "Drop-in slot UX for any onchain pack.",
      type: "services",
    },
    {
      id: 5,
      title: "Mesh Avatar Set",
      meta: "Collectible · 24 supply",
      tagline: "Creator-themed profile avatars for Base.",
      type: "collectibles",
    },
  ];

  function render(filter = "all") {
    grid.innerHTML = "";
    const filtered =
      filter === "all"
        ? listings
        : listings.filter((l) => l.type === filter);

    if (!filtered.length) {
      emptyLabel.style.display = "block";
      return;
    }
    emptyLabel.style.display = "none";

    filtered.forEach((l) => {
      const card = document.createElement("div");
      card.className = "market-card";
      card.innerHTML = `
        <div class="market-title">${l.title}</div>
        <div class="market-meta">${l.meta}</div>
        <div class="market-tagline">${l.tagline}</div>
      `;
      grid.appendChild(card);
    });
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      filterButtons.forEach((b) =>
        b.classList.toggle("is-active", b === btn)
      );
      render(f);
    });
  });

  render("all");
})();

// ---------- QUESTS ----------

(function initQuests() {
  const list = $("#questList");
  if (!list) return;

  const quests = [
    {
      title: "Design XP quest for mainnet → Base bridge",
      xp: "+80 XP",
      lane: "Base UX",
    },
    {
      title: "Prototype card opening flow for Vibe-style booster",
      xp: "+120 XP",
      lane: "UX · Packs",
    },
    {
      title: "Map your favorite creators into Mesh HUD",
      xp: "+40 XP",
      lane: "Social mesh",
    },
  ];

  quests.forEach((q) => {
    const li = document.createElement("li");
    li.className = "quest-item";
    li.innerHTML = `
      <div class="quest-title">${q.title}</div>
      <div class="quest-meta">
        <span>${q.lane}</span>
        <span>${q.xp}</span>
      </div>
    `;
    list.appendChild(li);
  });
})();

// ---------- AI MESH HELPER (MOCK) ----------

(function initMeshHelper() {
  const input = $("#meshInput");
  const output = $("#meshOutput");
  const btn = $("#btn-mesh-generate");

  btn?.addEventListener("click", () => {
    const text = (input?.value || "").trim();
    const base =
      text ||
      "User wants a better way to see all their Base / Vibe / Zora actions in one screen.";
    const concept = [
      "Cinematic XP quest screen that gamifies best route mainnet → Base.",
      "Minimalist Mesh HUD card showing gas saved, XP earned and packs opened in one glance.",
      "Farcaster frame that displays today's mesh loop with 3 actions: open pack, connect wallet, share cast.",
      "Animated slot-style reveal UX for Vibe packs, with rarity ladder baked into design.",
    ];
    const pick = concept[Math.floor(Math.random() * concept.length)];

    const out = `Mesh concept generated

Input:
- ${base}

Idea:
- ${pick}

Use in:
- MidJourney / Sora for visuals
- Figma for HUD layout
- Quest copy for SpawnEngine Mesh.`;

    if (output) output.textContent = out;
    showToast("Mesh concept generated (mock).");
  });
})();

// ---------- SUPCAST ----------

(function initSupCast() {
  const titleEl = $("#supcastTitle");
  const bodyEl = $("#supcastBody");
  const catEl = $("#supcastCategory");
  const btn = $("#btn-supcast-send");
  const feed = $("#supcastFeed");

  const seed = [
    {
      title: "Base app streak view feels hidden",
      body: "Suggest a clearer daily ritual surface directly in home HUD.",
      category: "Base App",
      meta: "Mock · yesterday",
    },
  ];

  function renderItem(item) {
    const li = document.createElement("li");
    li.className = "activity-item";
    li.innerHTML = `
      <div class="activity-title">${item.title}</div>
      <div class="activity-meta">${item.category} · ${item.meta}</div>
    `;
    feed.prepend(li);
  }

  seed.forEach(renderItem);

  btn?.addEventListener("click", () => {
    const title = (titleEl.value || "").trim();
    const body = (bodyEl.value || "").trim();
    const cat = catEl.value || "SpawnEngine";

    if (!title || !body) {
      showToast("Fill in title and context first.");
      return;
    }

    renderItem({
      title,
      category: cat,
      meta: "Just now",
    });

    titleEl.value = "";
    bodyEl.value = "";
    showToast("SupCast stored locally (mock).");
  });
})();

// ---------- WALLET MOCK ----------

(function initWalletMock() {
  const btn = $("#btn-connect");
  const addrEls = $all("[data-wallet-address]");
  const statusLabel = $("#wallet-status-label");
  const balanceEl = $("#walletBalanceEth");
  const activeWalletsEls = [$("span#activeWallets"), $("#activeWalletsStat")];

  let connected = false;

  btn?.addEventListener("click", () => {
    connected = !connected;
    if (connected) {
      const addr = "0xSpawn...Mesh";
      addrEls.forEach((el) => (el.textContent = addr));
      if (statusLabel) statusLabel.textContent = "Connected · Base";
      if (balanceEl) balanceEl.textContent = "0.4200 ETH";
      activeWalletsEls.forEach((el) => el && (el.textContent = "1"));
      showToast("Wallet connected (mock).");
    } else {
      addrEls.forEach((el) => (el.textContent = "Not connected"));
      if (statusLabel) statusLabel.textContent = "Not connected";
      if (balanceEl) balanceEl.textContent = "0.0000 ETH";
      activeWalletsEls.forEach((el) => el && (el.textContent = "0"));
      showToast("Wallet disconnected (mock).");
    }
  });
})();