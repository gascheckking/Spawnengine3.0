// SpawnEngine v0.3 — Mesh HUD + Docking API + Venice wallet flow
// Simple vanilla JS module, no bundler.

// -------------------------------------------------------------
// BASIC STATE
// -------------------------------------------------------------

const state = {
  walletConnected: false,
  walletAddress: null,
  xp: 1575,
  spawn: 497,
  streakDays: 1,
  signals: [],
  entropyHigh: false,
};

// Example quests (mock)
const QUESTS = [
  {
    id: "q1",
    title: "Cast once on Farcaster",
    reward: "+25 XP",
    status: "Ready",
  },
  {
    id: "q2",
    title: "Buy any creator coin on Base",
    reward: "+40 XP",
    status: "Locked (demo)",
  },
  {
    id: "q3",
    title: "Open a pack in Vibe or Zora",
    reward: "+60 XP",
    status: "Locked (demo)",
  },
];

// -------------------------------------------------------------
// SIMPLE MESH DOCKING API (v0.1 SPEC)
// -------------------------------------------------------------

/**
 * Docking API: allows external apps/protocols to register as mesh nodes.
 *
 * App descriptor shape:
 * {
 *   id: "zora",
 *   name: "Zora",
 *   kind: "market" | "packs" | "social" | "wallet" | "other",
 *   url: "https://zora.co",
 *   icon: "Z",
 *   streams: ["PACK_OPEN", "TOKEN_BUY", "XP_GAIN"],  // MeshEvent kinds
 *   actions: [
 *     { id: "open-profile", label: "Open profile", type: "deeplink" },
 *     { id: "mint", label: "Mint token", type: "transaction" }
 *   ]
 * }
 */

const MeshDock = (() => {
  /** @type {Array<any>} */
  const apps = [];

  function registerApp(app) {
    if (!app || !app.id) return;
    if (apps.find((a) => a.id === app.id)) return;
    apps.push(app);
    console.log("[MeshDock] Registered app:", app.id);
  }

  /**
   * Mesh signal (lightweight MeshEvent analogue)
   * {
   *   sourceApp: "zora",
   *   kind: "TOKEN_BUY" | "PACK_OPEN" | ...,
   *   wallet: "0xabc...",
   *   payload: {...},
   *   timestamp: number
   * }
   */
  function emitSignal(signal) {
    if (!signal) return;
    console.log("[MeshDock] Signal:", signal);
    // For v0.3 we just push into state.signals and re-render Home view
    state.signals.unshift(signal);
    if (state.signals.length > 6) state.signals.pop();
    renderSignals();
  }

  function listApps() {
    return [...apps];
  }

  return { registerApp, emitSignal, listApps };
})();

// Register some core mesh apps (mock, but real structure)
MeshDock.registerApp({
  id: "zora",
  name: "Zora",
  kind: "market",
  url: "https://zora.co",
  icon: "Z",
  streams: ["TOKEN_BUY", "TOKEN_SELL", "PACK_OPEN"],
  actions: [{ id: "open", label: "Open on Zora", type: "deeplink" }],
});

MeshDock.registerApp({
  id: "vibe",
  name: "VibeMarket",
  kind: "packs",
  url: "https://vibechain.com",
  icon: "V",
  streams: ["PACK_OPEN", "BURN_COMMON", "BURN_RARE"],
  actions: [{ id: "open-pack", label: "Open pack", type: "deeplink" }],
});

MeshDock.registerApp({
  id: "tba",
  name: "The Base App",
  kind: "activity",
  url: "https://base.org",
  icon: "B",
  streams: ["XP_GAIN", "STREAK_TICK"],
  actions: [{ id: "open-feed", label: "Open activity", type: "deeplink" }],
});

// -------------------------------------------------------------
// DOM & UI BINDING
// -------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  bindNav();
  bindMenu();
  bindStreak();
  bindLoot();
  bindMesh();
  renderQuests();
  renderDockedApps();
  renderSignals(); // empty at start

  // Init wallet flow canvas mesh
  const canvas = document.getElementById("wallet-flow-canvas");
  if (canvas) {
    const demoFlows = buildDemoFlows();
    initWalletFlow(canvas, demoFlows, {
      lowPower: true,
      pixelRatio: window.devicePixelRatio || 1,
    });
  }
});

// Bottom nav tabs
function bindNav() {
  const navItems = document.querySelectorAll(".nav-item");
  const views = {
    home: document.getElementById("view-home"),
    loot: document.getElementById("view-loot"),
    quests: document.getElementById("view-quests"),
    mesh: document.getElementById("view-mesh"),
  };

  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      navItems.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      Object.keys(views).forEach((k) => {
        views[k].classList.toggle("active", k === tab);
      });
    });
  });

  // Connect wallet (mock)
  const btnConnect = document.getElementById("btn-connect");
  if (btnConnect) {
    btnConnect.addEventListener("click", () => {
      if (!state.walletConnected) {
        // mock short wallet
        state.walletConnected = true;
        state.walletAddress = "0xSpawn...mesh";
      } else {
        state.walletConnected = false;
        state.walletAddress = null;
      }
      updateWalletUI();
    });
  }
}

function updateWalletUI() {
  const btnConnect = document.getElementById("btn-connect");
  if (!btnConnect) return;
  if (state.walletConnected) {
    btnConnect.classList.add("connected");
    btnConnect.textContent = state.walletAddress;
  } else {
    btnConnect.classList.remove("connected");
    btnConnect.textContent = "Connect wallet";
  }
}

// Side menu
function bindMenu() {
  const btnMenu = document.getElementById("btn-menu");
  const btnClose = document.getElementById("btn-menu-close");
  const backdrop = document.getElementById("side-menu-backdrop");
  const menu = document.getElementById("side-menu");

  const open = () => {
    menu.classList.add("open");
    backdrop.classList.add("open");
  };
  const close = () => {
    menu.classList.remove("open");
    backdrop.classList.remove("open");
  };

  if (btnMenu) btnMenu.addEventListener("click", open);
  if (btnClose) btnClose.addEventListener("click", close);
  if (backdrop) backdrop.addEventListener("click", close);
}

// Streak + XP logic
function bindStreak() {
  const btnCheckin = document.getElementById("btn-checkin");
  if (!btnCheckin) return;
  btnCheckin.addEventListener("click", () => {
    state.streakDays += 1;
    state.xp += 25;
    emitStreakSignal();
    updateStreakUI();
  });
  updateStreakUI();
}

function updateStreakUI() {
  const daysEl = document.getElementById("streak-days");
  const textEl = document.getElementById("streak-text");
  const xpEl = document.getElementById("xp-balance");
  const streakRing = document.getElementById("streak-ring");

  if (daysEl) daysEl.textContent = state.streakDays.toString();
  if (textEl) {
    const remaining = Math.max(0, 7 - state.streakDays);
    if (remaining > 0) {
      textEl.textContent = `Keep the streak for ${remaining} more day${
        remaining === 1 ? "" : "s"
      } for a full weekly run.`;
    } else {
      textEl.textContent = "Weekly run complete — orbit is fully charged.";
    }
  }
  if (xpEl) xpEl.textContent = `${state.xp} XP`;

  // conic-gradient based on streak out of 30
  const progress = Math.min(1, state.streakDays / 30);
  const deg = Math.floor(progress * 360);
  if (streakRing) {
    streakRing.style.background =
      `radial-gradient(circle at center, #05050d 48%, transparent 49%),` +
      `conic-gradient(#00ffff 0deg, #ff7bff ${deg}deg, rgba(40,40,70,0.8) ${deg}deg)`;
  }
}

// Loot / Pull Lab actions
function bindLoot() {
  const segButtons = document.querySelectorAll(".seg-btn");
  const segViews = {
    "packs": document.getElementById("seg-packs"),
    "pull-lab": document.getElementById("seg-pull-lab"),
  };
  segButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const seg = btn.getAttribute("data-seg");
      segButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      Object.keys(segViews).forEach((k) => {
        segViews[k].classList.toggle("active", k === seg);
      });
    });
  });

  const btnOpenPack = document.getElementById("btn-open-pack");
  if (btnOpenPack) {
    btnOpenPack.addEventListener("click", () => {
      // mock pack open
      state.xp += 40;
      state.spawn += 3;
      emitPackSignal();
      updateStreakUI();
      const spawnEl = document.getElementById("spawn-balance");
      if (spawnEl) spawnEl.textContent = `${state.spawn} SPN`;
      flashEntropy("Pack opened");
    });
  }

  const btnEntropy = document.getElementById("btn-entropy-ping");
  if (btnEntropy) {
    btnEntropy.addEventListener("click", () => {
      state.entropyHigh = !state.entropyHigh;
      updateEntropyUI();
    });
  }
}

function updateEntropyUI() {
  const pill = document.getElementById("entropy-pill");
  if (!pill) return;
  if (state.entropyHigh) {
    pill.textContent = "High entropy window";
    pill.style.borderColor = "#ffb86c";
  } else {
    pill.textContent = "Stable";
    pill.style.borderColor = "rgba(0,255,255,0.4)";
  }
}

function flashEntropy(reason) {
  state.entropyHigh = true;
  updateEntropyUI();
  setTimeout(() => {
    state.entropyHigh = false;
    updateEntropyUI();
  }, 2500);
}

// Mesh tab
function bindMesh() {
  const btnMeshFull = document.getElementById("btn-mesh-full");
  if (btnMeshFull) {
    btnMeshFull.addEventListener("click", () => {
      window.location.href = "./mesh.html";
    });
  }
}

function renderQuests() {
  const list = document.getElementById("quest-list");
  if (!list) return;
  list.innerHTML = "";
  QUESTS.forEach((q) => {
    const li = document.createElement("li");
    li.className = "quest-item";
    li.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:13px;font-weight:500;">${q.title}</div>
          <div style="font-size:11px;color:#9aa0ff;">${q.reward}</div>
        </div>
        <span class="pill-soft">${q.status}</span>
      </div>
    `;
    list.appendChild(li);
  });
}

function renderDockedApps() {
  const list = document.getElementById("dock-list");
  const count = document.getElementById("docked-count");
  if (!list || !count) return;
  const apps = MeshDock.listApps();
  list.innerHTML = "";
  apps.forEach((app) => {
    const li = document.createElement("li");
    li.className = "dock-item";
    li.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;font-size:12px;">
        <div style="width:22px;height:22px;border-radius:999px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;">
          ${app.icon || "?"}
        </div>
        <div>
          <div style="font-weight:500;">${app.name}</div>
          <div style="font-size:11px;color:#9aa0ff;">Streams: ${app.streams.join(
            ", "
          )}</div>
        </div>
      </div>
    `;
    list.appendChild(li);
  });
  count.textContent = `${apps.length} apps`;
}

function renderSignals() {
  const list = document.getElementById("signal-list");
  const pill = document.getElementById("signals-pill");
  if (!list || !pill) return;
  list.innerHTML = "";
  state.signals.forEach((sig) => {
    const li = document.createElement("li");
    li.className = "signal-item";
    const ts = new Date(sig.timestamp).toLocaleTimeString();
    li.textContent = `[${ts}] ${sig.sourceApp} · ${sig.kind}`;
    list.appendChild(li);
  });
  pill.textContent = `${state.signals.length} events`;
}

// Emit some demo mesh signals
function emitStreakSignal() {
  MeshDock.emitSignal({
    sourceApp: "spawnengine",
    kind: "STREAK_TICK",
    wallet: state.walletAddress || "0xspawn-mock",
    payload: { streakDays: state.streakDays },
    timestamp: Date.now(),
  });
}

function emitPackSignal() {
  MeshDock.emitSignal({
    sourceApp: "vibe",
    kind: "PACK_OPEN",
    wallet: state.walletAddress || "0xspawn-mock",
    payload: { collection: "Foil Realms", rarity: "RARE" },
    timestamp: Date.now(),
  });
}

// -------------------------------------------------------------
// VENICE WALLET FLOW CANVAS (simplified, integrated)
// -------------------------------------------------------------

/**
 * flows: Array<{ from: string, to: string, volume: number, kind: "coin"|"pack"|"burn"|"xp" }>
 */
function initWalletFlow(canvas, flows, options = {}) {
  const ctx = canvas.getContext("2d");
  const pixelRatio = options.pixelRatio || window.devicePixelRatio || 1;
  const lowPower = options.lowPower || false;

  let width = 0;
  let height = 0;
  let nodes = new Map();
  let particles = [];
  let time = 0;
  let lastFrameTime = 0;
  const targetFPS = lowPower ? 24 : 60;
  const frameInterval = 1000 / targetFPS;

  const colors = {
    coin: { r: 0, g: 255, b: 255 },
    pack: { r: 200, g: 100, b: 255 },
    burn: { r: 255, g: 120, b: 60 },
    xp: { r: 100, g: 255, b: 200 },
    node: { r: 255, g: 255, b: 255 },
    background: { r: 0, g: 0, b: 0 },
  };

  class Node {
    constructor(id, isCore = false) {
      this.id = id;
      this.x = 0;
      this.y = 0;
      this.vx = 0;
      this.vy = 0;
      this.isCore = isCore;
      this.radius = isCore ? 9 : 6;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.connections = 0;
    }

    update(centerX, centerY, bounds) {
      if (this.isCore) {
        const dx = centerX - this.x;
        const dy = centerY - this.y;
        this.vx += dx * 0.02;
        this.vy += dy * 0.02;
      }

      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.85;
      this.vy *= 0.85;

      const margin = this.radius + 10;
      if (this.x < margin) {
        this.x = margin;
        this.vx *= -0.5;
      }
      if (this.x > bounds.width - margin) {
        this.x = bounds.width - margin;
        this.vx *= -0.5;
      }
      if (this.y < margin) {
        this.y = margin;
        this.vy *= -0.5;
      }
      if (this.y > bounds.height - margin) {
        this.y = bounds.height - margin;
        this.vy *= -0.5;
      }
    }

    draw(ctx, t) {
      const pulse = Math.sin(t * 0.002 + this.pulsePhase) * 0.2 + 1;
      const r = this.radius * pulse;
      const glow = this.connections > 4 ? 22 : 12;

      const gradient = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        r + glow
      );
      gradient.addColorStop(
        0,
        `rgba(${colors.node.r},${colors.node.g},${colors.node.b},0.9)`
      );
      gradient.addColorStop(
        0.5,
        `rgba(${colors.node.r},${colors.node.g},${colors.node.b},0.25)`
      );
      gradient.addColorStop(
        1,
        `rgba(${colors.node.r},${colors.node.g},${colors.node.b},0)`
      );

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r + glow, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${colors.node.r},${colors.node.g},${colors.node.b},1)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  class Particle {
    constructor(fromNode, toNode, kind) {
      this.fromNode = fromNode;
      this.toNode = toNode;
      this.kind = kind;
      this.progress = Math.random();
      this.speed =
        (Math.random() * 0.005 + 0.005) * (lowPower ? 0.5 : 1.0);
      this.size = Math.random() * 2 + 1;
      this.offsetAngle = Math.random() * Math.PI * 2;
      this.offsetRadius = Math.random() * 6;
    }

    update() {
      this.progress += this.speed;
      if (this.progress > 1) this.progress = 0;
    }

    draw(ctx) {
      const dx = this.toNode.x - this.fromNode.x;
      const dy = this.toNode.y - this.fromNode.y;
      const x =
        this.fromNode.x +
        dx * this.progress +
        Math.cos(this.offsetAngle) * this.offsetRadius;
      const y =
        this.fromNode.y +
        dy * this.progress +
        Math.sin(this.offsetAngle) * this.offsetRadius;

      const c = colors[this.kind] || colors.coin;
      const gradient = ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        this.size * 3
      );
      gradient.addColorStop(0, `rgba(${c.r},${c.g},${c.b},1)`);
      gradient.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, this.size * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function processData(flows) {
    nodes.clear();
    particles = [];

    const walletVolumes = {};
    flows.forEach((f) => {
      walletVolumes[f.from] = (walletVolumes[f.from] || 0) + f.volume;
      walletVolumes[f.to] = (walletVolumes[f.to] || 0) + f.volume;
    });

    const sortedWallets = Object.entries(walletVolumes).sort(
      ([, a], [, b]) => b - a
    );
    const coreWalletIds = new Set(
      sortedWallets
        .slice(0, Math.max(1, Math.floor(sortedWallets.length * 0.2)))
        .map(([id]) => id)
    );

    sortedWallets.forEach(([id]) => {
      nodes.set(id, new Node(id, coreWalletIds.has(id)));
    });

    const centerX = width / 2;
    const centerY = height / 2;
    const angleStep = (Math.PI * 2) / nodes.size;
    let i = 0;
    nodes.forEach((node) => {
      if (node.isCore) {
        node.x = centerX + (Math.random() - 0.5) * 120;
        node.y = centerY + (Math.random() - 0.5) * 120;
      } else {
        const angle = i * angleStep;
        const radius = Math.min(width, height) * 0.33;
        node.x = centerX + Math.cos(angle) * radius;
        node.y = centerY + Math.sin(angle) * radius;
        i++;
      }
    });

    flows.forEach((f) => {
      const fromNode = nodes.get(f.from);
      const toNode = nodes.get(f.to);
      if (fromNode && toNode) {
        fromNode.connections++;
        toNode.connections++;
        if (!lowPower || Math.random() > 0.4) {
          particles.push(new Particle(fromNode, toNode, f.kind));
        }
      }
    });
  }

  function drawFrame(ts) {
    const now = ts;
    const delta = now - lastFrameTime;
    if (delta < frameInterval) {
      requestAnimationFrame(drawFrame);
      return;
    }
    lastFrameTime = now;
    time += delta;

    ctx.clearRect(0, 0, width, height);

    // subtle dark overlay gradient
    const bgGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.1,
      0,
      width * 0.5,
      height * 0.7,
      Math.max(width, height)
    );
    bgGrad.addColorStop(0, "rgba(43,29,121,0.28)");
    bgGrad.addColorStop(1, "rgba(0,0,0,0.95)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const bounds = { width, height };

    nodes.forEach((node) => {
      node.update(centerX, centerY, bounds);
    });

    // draw links
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    nodes.forEach((fromNode) => {
      nodes.forEach((toNode) => {
        if (fromNode === toNode) return;
        const dist = Math.hypot(
          toNode.x - fromNode.x,
          toNode.y - fromNode.y
        );
        if (dist < Math.min(width, height) * 0.5) {
          const alpha = 0.04 * (1 - dist / (Math.min(width, height) * 0.5));
          ctx.strokeStyle = `rgba(100,180,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          ctx.stroke();
        }
      });
    });
    ctx.restore();

    particles.forEach((p) => {
      p.update();
      p.draw(ctx);
    });

    nodes.forEach((node) => node.draw(ctx, time));

    requestAnimationFrame(drawFrame);
  }

  resize();
  processData(flows);
  window.addEventListener("resize", resize);
  requestAnimationFrame(drawFrame);
}

// build some mock wallet flows for background
function buildDemoFlows() {
  const wallets = [
    "spawniz",
    "vibemarket",
    "zora",
    "base-app",
    "collector-1",
    "collector-2",
    "creator-x",
    "creator-y",
  ];
  const kinds = ["coin", "pack", "burn", "xp"];
  const flows = [];
  for (let i = 0; i < 32; i++) {
    const from = wallets[Math.floor(Math.random() * wallets.length)];
    let to = wallets[Math.floor(Math.random() * wallets.length)];
    if (to === from) {
      to = wallets[(wallets.indexOf(from) + 1) % wallets.length];
    }
    flows.push({
      from,
      to,
      volume: Math.floor(Math.random() * 10) + 1,
      kind: kinds[Math.floor(Math.random() * kinds.length)],
    });
  }
  return flows;
}