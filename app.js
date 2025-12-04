// ------------------------------------------------------
// Simple demo state
// ------------------------------------------------------

let isConnected = false;
let xpBalance = 1575;
let spnBalance = 497;
let streakDays = 1;
const streakTarget = 7;

// rarity mapping (for lore / feed text)
const rarityLabels = {
  COMMON: "fragment",
  RARE: "shard",
  EPIC: "core",
  LEGENDARY: "prime",
  MYTHIC: "relic"
};

// ------------------------------------------------------
// Wallet-flow mesh (2D canvas) — Venice-inspired
// ------------------------------------------------------

function initWalletFlow(canvas, flows, options = {}) {
  const ctx = canvas.getContext("2d");
  const pixelRatio = options.pixelRatio || window.devicePixelRatio || 1;
  const lowPower = options.lowPower || false;

  let width, height;
  let nodes = new Map();
  let particles = [];
  let animationFrameId;
  let lastFrameTime = 0;
  const targetFPS = lowPower ? 24 : 60;
  const frameInterval = 1000 / targetFPS;
  let time = 0;

  const colors = {
    coin: { r: 0, g: 255, b: 255 },
    pack: { r: 200, g: 100, b: 255 },
    burn: { r: 255, g: 100, b: 50 },
    xp: { r: 100, g: 255, b: 200 },
    node: { r: 255, g: 255, b: 255 }
  };

  class Node {
    constructor(id, isCore = false) {
      this.id = id;
      this.x = 0;
      this.y = 0;
      this.vx = 0;
      this.vy = 0;
      this.isCore = isCore;
      this.radius = isCore ? 8 : 5;
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

    draw(ctx, time) {
      const pulse = Math.sin(time * 0.002 + this.pulsePhase) * 0.2 + 1;
      const r = this.radius * pulse;
      const glow = this.connections > 5 ? 20 : 10;

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
        `rgba(${colors.node.r}, ${colors.node.g}, ${colors.node.b}, 0.8)`
      );
      gradient.addColorStop(
        0.5,
        `rgba(${colors.node.r}, ${colors.node.g}, ${colors.node.b}, 0.3)`
      );
      gradient.addColorStop(
        1,
        `rgba(${colors.node.r}, ${colors.node.g}, ${colors.node.b}, 0)`
      );

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r + glow, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${colors.node.r}, ${colors.node.g}, ${colors.node.b}, 1)`;
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
      this.progress = 0;
      this.speed = (Math.random() * 0.005 + 0.005) * (lowPower ? 0.5 : 1);
      this.size = Math.random() * 2 + 1;
      this.offsetAngle = Math.random() * Math.PI * 2;
      this.offsetRadius = Math.random() * 5;
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

      const c = colors[this.kind];
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.size * 3);
      gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 1)`);
      gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);

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
    flows.forEach(f => {
      walletVolumes[f.from] = (walletVolumes[f.from] || 0) + f.volume;
      walletVolumes[f.to] = (walletVolumes[f.to] || 0) + f.volume;
    });

    const sortedWallets = Object.entries(walletVolumes).sort(
      ([, a], [, b]) => b - a
    );
    const coreWalletIds = new Set(
      sortedWallets
        .slice(0, Math.max(1, Math.floor(sortedWallets.length * 0.25)))
        .map(([id]) => id)
    );

    sortedWallets.forEach(([id]) => {
      nodes.set(id, new Node(id, coreWalletIds.has(id)));
    });

    const centerX = width / 2;
    const centerY = height / 2;
    const angleStep = (Math.PI * 2) / nodes.size;
    let i = 0;
    nodes.forEach(node => {
      if (node.isCore) {
        node.x = centerX + (Math.random() - 0.5) * 80;
        node.y = centerY + (Math.random() - 0.5) * 80;
      } else {
        const angle = i * angleStep;
        const radius = Math.min(width, height) * 0.35;
        node.x = centerX + Math.cos(angle) * radius;
        node.y = centerY + Math.sin(angle) * radius;
        i++;
      }
    });

    flows.forEach(f => {
      const fromNode = nodes.get(f.from);
      const toNode = nodes.get(f.to);
      if (fromNode && toNode) {
        fromNode.connections++;
        toNode.connections++;
        if (!lowPower || Math.random() > 0.5) {
          particles.push(new Particle(fromNode, toNode, f.kind));
        }
      }
    });
  }

  function drawFrame(timestamp) {
    const delta = timestamp - lastFrameTime;
    if (delta < frameInterval) {
      animationFrameId = requestAnimationFrame(drawFrame);
      return;
    }
    lastFrameTime = timestamp;
    time += delta;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(3, 2, 12, 1)";
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    nodes.forEach(node => node.update(centerX, centerY, { width, height }));

    ctx.globalCompositeOperation = "lighter";

    ctx.lineCap = "round";
    flows.forEach(f => {
      const fromNode = nodes.get(f.from);
      const toNode = nodes.get(f.to);
      if (!fromNode || !toNode) return;
      const baseColor = colors[f.kind] || colors.xp;
      ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.18)`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.stroke();
    });

    particles.forEach(p => p.update());
    particles.forEach(p => p.draw(ctx));
    nodes.forEach(node => node.draw(ctx, time));

    ctx.globalCompositeOperation = "source-over";
    animationFrameId = requestAnimationFrame(drawFrame);
  }

  resize();
  processData(flows);
  window.addEventListener("resize", resize);
  animationFrameId = requestAnimationFrame(drawFrame);

  return {
    refresh(newFlows) {
      processData(newFlows);
    },
    destroy() {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    }
  };
}

// ------------------------------------------------------
// Activity feed text (lite mesh-lore)
// ------------------------------------------------------

function shortWallet(addr) {
  if (!addr) return "0xmesh";
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function generateLore(event) {
  const w = shortWallet(event.wallet);
  const token = event.tokenSymbol || "token";
  const rarity = event.rarity ? rarityLabels[event.rarity] : "";
  const amount = event.amount ?? 1;

  switch (event.kind) {
    case "PACK_OPEN":
      return randomFrom([
        `${w} tore open ${amount} pack${amount !== 1 ? "s" : ""} — ${rarity} shards slip into the mesh.`,
        `${w} cracked a pack and surfaced a ${rarity} line of loot.`,
        `Entropy twitch: ${w} opened packs, ${rarity} pieces dropped into orbit.`
      ]);
    case "XP_GAIN":
      return randomFrom([
        `${w} gained ${amount} XP — orbit tightens.`,
        `${amount} XP threaded into ${w}'s mesh lane.`,
        `${w} nudged the streak with ${amount} XP.`
      ]);
    case "STREAK_TICK":
      return randomFrom([
        `${w}'s streak reached ${amount} days.`,
        `${w} checked in — orbit now at ${amount} days.`,
        `Daily ritual: ${w} kept the streak alive (${amount}).`
      ]);
    default:
      return `${w} pinged the mesh.`;
  }
}

// ------------------------------------------------------
// MAIN APP WIRING
// ------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tab-button");
  const views = document.querySelectorAll(".view-content");
  const btnConnect = document.getElementById("btn-connect");
  const btnCheckin = document.getElementById("btn-checkin");
  const xpEl = document.getElementById("xp-balance");
  const spnEl = document.getElementById("spn-balance");
  const streakEl = document.getElementById("streak-count");
  const streakRemEl = document.getElementById("streak-remaining");
  const feedEl = document.getElementById("activity-feed");
  const meshXpCountEl = document.getElementById("mesh-xp-count");

  const lootToggle = document.getElementById("loot-toggle");
  const lootSections = document.querySelectorAll(".loot-section");

  const drawer = document.getElementById("settings-drawer");
  const drawerBackdrop = drawer.querySelector(".drawer-backdrop");
  const drawerClose = document.getElementById("drawer-close");
  const drawerItems = drawer.querySelectorAll(".drawer-item");
  const btnHeaderGear = document.getElementById("btn-header-gear");
  const btnHeaderMenu = document.getElementById("btn-header-menu");

  const meshCanvas = document.getElementById("meshCanvas");
  let meshInstance = null;

  // stateful demo flows
  let meshFlows = createDemoFlows();
  meshInstance = initWalletFlow(meshCanvas, meshFlows, { lowPower: true });
  meshXpCountEl.textContent = meshFlows.filter(f => f.kind === "xp").length;

  // --------- helper: update UI numbers ---------

  function renderState() {
    xpEl.textContent = `${xpBalance} XP`;
    spnEl.textContent = `${spnBalance} SPN`;
    streakEl.textContent = String(streakDays);
    const remaining = Math.max(streakTarget - streakDays, 0);
    streakRemEl.textContent = String(remaining);
  }

  renderState();

  // --------- tabs ---------

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      views.forEach(v =>
        v.id === target ? v.classList.add("active") : v.classList.remove("active")
      );
    });
  });

  // --------- loot segmented control ---------

  if (lootToggle) {
    lootToggle.addEventListener("click", e => {
      const button = e.target.closest(".segmented-button");
      if (!button) return;
      const mode = button.dataset.mode;
      lootToggle
        .querySelectorAll(".segmented-button")
        .forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      lootSections.forEach(sec =>
        sec.id === `loot-${mode}`
          ? sec.classList.add("active")
          : sec.classList.remove("active")
      );
    });
  }

  // --------- wallet connect ---------

  btnConnect.addEventListener("click", () => {
    isConnected = !isConnected;
    if (isConnected) {
      btnConnect.textContent = "Wallet connected";
      btnConnect.classList.add("connected");
      btnConnect.style.boxShadow = "0 0 26px rgba(75,255,210,0.7)";
    } else {
      btnConnect.textContent = "Connect wallet";
      btnConnect.classList.remove("connected");
      btnConnect.style.boxShadow = "";
    }
  });

  // --------- streak / check-in ---------

  btnCheckin.addEventListener("click", () => {
    streakDays = Math.min(streakDays + 1, 30);
    xpBalance += 25;
    pushFeedEvent({
      kind: "STREAK_TICK",
      wallet: "0xSpawnizDemo",
      amount: streakDays
    });
    pushFeedEvent({
      kind: "XP_GAIN",
      wallet: "0xSpawnizDemo",
      amount: 25
    });
    refreshMeshFlows();
    renderState();
  });

  // --------- activity feed ---------

  function pushFeedEvent(ev) {
    const li = document.createElement("li");
    li.className = "feed-item";
    li.textContent = generateLore(ev);
    feedEl.prepend(li);
    while (feedEl.children.length > 12) {
      feedEl.removeChild(feedEl.lastChild);
    }
  }

  // seed some demo events
  [
    { kind: "PACK_OPEN", wallet: "0xSpawnizDemo", rarity: "RARE", amount: 1 },
    { kind: "XP_GAIN", wallet: "0xSpawnizDemo", amount: 35 },
    { kind: "STREAK_TICK", wallet: "0xSpawnizDemo", amount: 1 }
  ].forEach(e => pushFeedEvent(e));

  // --------- mesh flows refresh on actions ---------

  function createDemoFlows() {
    const wallets = [
      "0xSpawniz",
      "0xMeshAlpha",
      "0xTinyNode",
      "0xQuestWhale",
      "0xPackOpener",
      "0xRelicHunter"
    ];
    const kinds = ["coin", "pack", "burn", "xp"];
    const flows = [];
    for (let i = 0; i < 22; i++) {
      const from = wallets[Math.floor(Math.random() * wallets.length)];
      let to = wallets[Math.floor(Math.random() * wallets.length)];
      if (to === from) {
        to = wallets[(wallets.indexOf(to) + 1) % wallets.length];
      }
      flows.push({
        from,
        to,
        kind: randomFrom(kinds),
        volume: Math.random() * 5 + 1
      });
    }
    return flows;
  }

  function refreshMeshFlows() {
    meshFlows = createDemoFlows();
    if (meshInstance) {
      meshInstance.refresh(meshFlows);
    }
    meshXpCountEl.textContent = meshFlows.filter(f => f.kind === "xp").length;
  }

  // --------- drawer / settings ---------

  function openDrawer() {
    drawer.classList.remove("hidden");
  }

  function closeDrawer() {
    drawer.classList.add("hidden");
  }

  btnHeaderGear.addEventListener("click", openDrawer);
  btnHeaderMenu.addEventListener("click", openDrawer);
  drawerBackdrop.addEventListener("click", closeDrawer);
  drawerClose.addEventListener("click", closeDrawer);

  drawerItems.forEach(item => {
    item.addEventListener("click", () => {
      const action = item.dataset.action;
      switch (action) {
        case "referrals":
          alert("Referrals: later this becomes your invite tree & reward split.");
          break;
        case "bookmarks":
          alert("Bookmarks: saved packs, quests & creator meshes.");
          break;
        case "earnings":
          alert("Earnings: simulated SPN / XP earnings dashboard.");
          break;
        case "collectibles":
          alert("Collectibles: future place for SpawnEngine cards & relics.");
          break;
        case "settings":
          alert("Settings: network, theme & notification preferences.");
          break;
        case "swap":
          alert("Swap wallet: in real version this opens a wallet selector.");
          break;
        case "logout":
          isConnected = false;
          btnConnect.textContent = "Connect wallet";
          btnConnect.classList.remove("connected");
          btnConnect.style.boxShadow = "";
          alert("Wallet disconnected in this demo.");
          break;
      }
    });
  });
});