// -----------------------------------------------------
// Venice-style wallet flow background (blurrad)
// -----------------------------------------------------
function initWalletFlow(canvas, flows, options = {}) {
  const ctx = canvas.getContext("2d");
  const pixelRatio = options.pixelRatio || window.devicePixelRatio || 1;
  const lowPower = options.lowPower || false;

  let width, height;
  let nodes = new Map();
  let particles = [];
  let time = 0;
  let animationFrameId;
  let lastFrameTime = 0;
  const targetFPS = lowPower ? 24 : 60;
  const frameInterval = 1000 / targetFPS;

  const colors = {
    coin: { r: 0, g: 255, b: 255 },
    pack: { r: 200, g: 100, b: 255 },
    burn: { r: 255, g: 100, b: 50 },
    xp: { r: 100, g: 255, b: 200 },
    node: { r: 255, g: 255, b: 255 },
    background: { r: 0, g: 0, b: 0 }
  };

  class Node {
    constructor(id, isCore = false) {
      this.id = id;
      this.x = 0;
      this.y = 0;
      this.vx = 0;
      this.vy = 0;
      this.isCore = isCore;
      this.radius = isCore ? 10 : 6;
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

      const margin = this.radius + 20;
      if (this.x < margin) { this.x = margin; this.vx *= -0.5; }
      if (this.x > bounds.width - margin) { this.x = bounds.width - margin; this.vx *= -0.5; }
      if (this.y < margin) { this.y = margin; this.vy *= -0.5; }
      if (this.y > bounds.height - margin) { this.y = bounds.height - margin; this.vy *= -0.5; }
    }

    draw(ctx, t) {
      const pulse = Math.sin(t * 0.0015 + this.pulsePhase) * 0.25 + 1;
      const r = this.radius * pulse;
      const glow = this.connections > 4 ? 26 : 16;

      const gradient = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        r + glow
      );
      gradient.addColorStop(0, `rgba(${colors.node.r}, ${colors.node.g}, ${colors.node.b}, 0.7)`);
      gradient.addColorStop(0.4, `rgba(${colors.node.r}, ${colors.node.g}, ${colors.node.b}, 0.25)`);
      gradient.addColorStop(1, `rgba(${colors.node.r}, ${colors.node.g}, ${colors.node.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r + glow, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${colors.node.r}, ${colors.node.g}, ${colors.node.b}, 0.9)`;
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
      this.speed = (Math.random() * 0.004 + 0.003) * (lowPower ? 0.6 : 1);
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
      const x = this.fromNode.x + dx * this.progress + Math.cos(this.offsetAngle) * this.offsetRadius;
      const y = this.fromNode.y + dy * this.progress + Math.sin(this.offsetAngle) * this.offsetRadius;

      const c = colors[this.kind];
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.size * 4);
      gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 1)`);
      gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, this.size * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);
  }

  function processData(flowsData) {
    nodes.clear();
    particles = [];

    const walletVolumes = {};
    flowsData.forEach(f => {
      walletVolumes[f.from] = (walletVolumes[f.from] || 0) + f.volume;
      walletVolumes[f.to] = (walletVolumes[f.to] || 0) + f.volume;
    });

    const sortedWallets = Object.entries(walletVolumes).sort(([, a], [, b]) => b - a);
    const coreWalletIds = new Set(
      sortedWallets.slice(0, Math.max(1, Math.floor(sortedWallets.length * 0.2))).map(([id]) => id)
    );

    sortedWallets.forEach(([id]) => {
      nodes.set(id, new Node(id, coreWalletIds.has(id)));
    });

    const centerX = width / 2;
    const centerY = height / 2;
    const angleStep = (Math.PI * 2) / Math.max(nodes.size, 1);
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
      }
      i++;
    });

    flowsData.forEach(f => {
      const fromNode = nodes.get(f.from);
      const toNode = nodes.get(f.to);
      if (fromNode && toNode) {
        fromNode.connections++;
        toNode.connections++;
        if (!lowPower || Math.random() > 0.35) {
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

    ctx.fillStyle = "rgba(0,0,10,0.9)";
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    nodes.forEach(node => node.update(centerX, centerY, { width, height }));
    nodes.forEach(node => node.draw(ctx, time));

    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });

    animationFrameId = requestAnimationFrame(drawFrame);
  }

  function init() {
    resize();
    processData(flows);
    window.addEventListener("resize", resize);
    animationFrameId = requestAnimationFrame(drawFrame);
  }

  init();

  return {
    destroy() {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    }
  };
}

// -----------------------------------------------------
// Lore generator + rarity mapping
// -----------------------------------------------------
const MeshEventKind = {
  PACK_OPEN: "PACK_OPEN",
  TOKEN_BUY: "TOKEN_BUY",
  TOKEN_SELL: "TOKEN_SELL",
  BURN_COMMON: "BURN_COMMON",
  BURN_RARE: "BURN_RARE",
  BURN_LEGENDARY: "BURN_LEGENDARY",
  BURN_MYTHIC: "BURN_MYTHIC",
  STREAK_TICK: "STREAK_TICK",
  STREAK_BROKEN: "STREAK_BROKEN",
  QUEST_COMPLETE: "QUEST_COMPLETE",
  QUEST_MISS: "QUEST_MISS",
  XP_GAIN: "XP_GAIN",
  XP_ORB_DROP: "XP_ORB_DROP"
};

function shortWallet(wallet) {
  if (!wallet) return "0xmesh";
  if (wallet.length <= 10) return wallet;
  return `${wallet.slice(0, 4)}…${wallet.slice(-4)}`;
}

function seededRandom(seed) {
  let x = (seed || Math.floor(Math.random() * 2147483647)) % 2147483647;
  if (x === 0) x = 1;
  return () => {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
}

function mapRarityName(r) {
  switch (r) {
    case "COMMON":
      return "common";
    case "RARE":
      return "charged shard";
    case "EPIC":
      return "phase fragment";
    case "LEGENDARY":
      return "gravity core";
    case "MYTHIC":
      return "relic";
    default:
      return (r || "").toLowerCase();
  }
}

function generateLore(e, opts) {
  const rand = opts && opts.seed !== undefined ? seededRandom(opts.seed + e.timestamp) : Math.random;
  const walletShort = shortWallet(e.wallet || "0xmesh");
  const amountStr = e.amount !== undefined ? String(e.amount) : "a";
  const streakStr = e.streakDays !== undefined ? String(e.streakDays) : "";
  const token = e.tokenSymbol || "token";
  const collection = e.collectionName || "realm";
  const rarityLower = mapRarityName(e.rarity);

  let templates = [];

  switch (e.kind) {
    case MeshEventKind.PACK_OPEN:
      templates = [
        `${walletShort} tore open ${amountStr} pack${e.amount !== 1 ? "s" : ""} in ${collection} — ${rarityLower} splinters scatter across the mesh.`,
        `${walletShort} unlocked ${amountStr} ${rarityLower} pull${e.amount !== 1 ? "s" : ""} — the orbit flexes around their ID.`,
        `${walletShort} cracked a pack vein in ${collection}, birthing ${amountStr} ${rarityLower} hit${e.amount !== 1 ? "s" : ""}.`,
        `Pack rift opened by ${walletShort} in ${collection}, yielding ${rarityLower} charge; mesh hum rises.`,
        `${walletShort}'s pull in ${collection} reveals ${amountStr} ${rarityLower} node${e.amount !== 1 ? "s" : ""} — vault glow spikes.`
      ];
      break;
    case MeshEventKind.TOKEN_BUY:
      templates = [
        `${walletShort} acquired ${amountStr} ${token} — mesh nodes align, orbit expands.`,
        `Buy signal from ${walletShort}: ${amountStr} ${token} pulled into the vault; entropy stabilizes.`,
        `${walletShort} infused ${amountStr} ${token} into their mesh — relics stir in response.`,
        `${amountStr} ${token} claimed by ${walletShort}; the forge hums with new potential.`,
        `${walletShort} bolstered their streak with ${amountStr} ${token} — mesh briefly shimmers.`
      ];
      break;
    case MeshEventKind.TOKEN_SELL:
      templates = [
        `${walletShort} released ${amountStr} ${token} — orbit contracts, entropy spikes.`,
        `Sell executed by ${walletShort}: ${amountStr} ${token} dispersed; mesh dims slightly.`,
        `${walletShort} traded away ${amountStr} ${token} — shards scatter across the realm.`,
        `${amountStr} ${token} offloaded by ${walletShort}; vault echoes with the shift.`,
        `${walletShort}'s sell of ${amountStr} ${token} — Pull Lab flickers in the aftermath.`
      ];
      break;
    case MeshEventKind.BURN_COMMON:
      templates = [
        `${walletShort} burned ${amountStr} common${e.amount !== 1 ? "s" : ""} — entropy feeds the mesh, orbit steadies.`,
        `Common fragments torched by ${walletShort}; shards coalesce in the forge.`,
        `${walletShort} sacrificed ${amountStr} common${e.amount !== 1 ? "s" : ""} — vault absorbs the essence.`,
        `Burn complete: ${amountStr} common${e.amount !== 1 ? "s" : ""} by ${walletShort}; mesh pulses.`,
        `${walletShort}'s common burn — relics awaken faintly in ${collection}.`
      ];
      break;
    case MeshEventKind.BURN_RARE:
      templates = [
        `${walletShort} incinerated ${amountStr} charged shard${e.amount !== 1 ? "s" : ""} — entropy surges, orbit warps.`,
        `Shard stacks burned by ${walletShort}; relic whispers echo through the mesh.`,
        `${walletShort} offered ${amountStr} charged shard${e.amount !== 1 ? "s" : ""} to the forge — vault ignites.`,
        `Intense burn: ${amountStr} charged shard${e.amount !== 1 ? "s" : ""} from ${walletShort}; Pull Lab roils.`,
        `${walletShort}'s shard sacrifice in ${collection} — mesh glow intensifies.`
      ];
      break;
    case MeshEventKind.BURN_LEGENDARY:
      templates = [
        `${walletShort} consigned ${amountStr} gravity core${e.amount !== 1 ? "s" : ""} to flames — orbit quakes, entropy boils.`,
        `Gravity cores burned by ${walletShort}; ancient forces stir in the mesh.`,
        `${walletShort} unleashed ${amountStr} gravity-core burn${e.amount !== 1 ? "s" : ""} — vault resonates deeply.`,
        `Epic burn executed: ${amountStr} gravity core${e.amount !== 1 ? "s" : ""} by ${walletShort}; shards reform.`,
        `${walletShort}'s core offering — Pull Lab erupts in ${collection}.`
      ];
      break;
    case MeshEventKind.BURN_MYTHIC:
      templates = [
        `${walletShort} dared burn ${amountStr} relic${e.amount !== 1 ? "s" : ""} — mesh fractures, orbit realigns eternally.`,
        `Relic essence torched by ${walletShort}; cosmic entropy floods the realm.`,
        `${walletShort} committed ${amountStr} relic${e.amount !== 1 ? "s" : ""} to the void — vault transcends.`,
        `Ultimate burn: ${amountStr} relic${e.amount !== 1 ? "s" : ""} from ${walletShort}; pulls evolve.`,
        `${walletShort}'s relic pyre in ${collection} — Pull Lab ascends.`
      ];
      break;
    case MeshEventKind.STREAK_TICK:
      templates = [
        `${walletShort}'s streak ticks to ${streakStr} days — orbit tightens, mesh strengthens.`,
        `Daily ritual complete for ${walletShort}: streak at ${streakStr}; XP orbits align.`,
        `${walletShort} maintained streak of ${streakStr} days — vault pulses with loyalty.`,
        `Streak advanced by ${walletShort} to ${streakStr} — entropy bows to persistence.`,
        `${walletShort}'s orbit holds at ${streakStr} days; relics hum in approval.`
      ];
      break;
    case MeshEventKind.STREAK_BROKEN:
      templates = [
        `${walletShort}'s streak shattered at ${streakStr} days — orbit loosens, XP orbs flee.`,
        `Break detected: ${walletShort}'s ${streakStr}-day streak ends; mesh dims.`,
        `${walletShort} lost their ${streakStr}-day streak — entropy claims the fragments.`,
        `Streak broken for ${walletShort} after ${streakStr} days; vault echoes emptily.`,
        `${walletShort}'s ${streakStr}-day run ends — Pull Lab resets with a sigh.`
      ];
      break;
    case MeshEventKind.QUEST_COMPLETE:
      templates = [
        `${walletShort} conquered a quest in ${collection} — mesh rewards with ${amountStr} XP, orbit expands.`,
        `Quest fulfilled by ${walletShort}; ${amountStr} XP infused, relics awaken.`,
        `${walletShort} completed quest — vault absorbs ${amountStr} XP, entropy calms.`,
        `Victory for ${walletShort}: quest done, ${amountStr} XP gained; streak intensifies.`,
        `${walletShort}'s quest triumph in ${collection} — mesh glows with ${amountStr} XP.`
      ];
      break;
    case MeshEventKind.QUEST_MISS:
      templates = [
        `${walletShort} missed a quest — orbit wavers, XP orbs dissipate.`,
        `Quest evaded ${walletShort}; mesh contracts slightly, entropy rises.`,
        `${walletShort}'s quest lapse — vault hungers, relics slumber.`,
        `Missed opportunity for ${walletShort}: quest lost; Pull Lab stirs uneasily.`,
        `${walletShort} let a quest slip in ${collection} — streak orbit flickers.`
      ];
      break;
    case MeshEventKind.XP_GAIN:
      templates = [
        `${walletShort} harnessed ${amountStr} XP — mesh nodes brighten, orbit stabilizes.`,
        `XP surge for ${walletShort}: ${amountStr} absorbed; relics pulse.`,
        `${walletShort} gained ${amountStr} XP — vault expands, entropy aligns.`,
        `${amountStr} XP claimed by ${walletShort}; streak amplifies the flow.`,
        `${walletShort}'s XP infusion of ${amountStr} — Pull Lab hums contentedly.`
      ];
      break;
    case MeshEventKind.XP_ORB_DROP:
      templates = [
        `${walletShort} dropped ${amountStr} XP orb${e.amount !== 1 ? "s" : ""} — mesh scatters energy, orbit shifts.`,
        `Orb release by ${walletShort}: ${amountStr} XP freed; entropy dances.`,
        `${walletShort} let fall ${amountStr} XP orb${e.amount !== 1 ? "s" : ""} — vault echoes the loss.`,
        `${amountStr} XP orb${e.amount !== 1 ? "s" : ""} dropped from ${walletShort}; relics dim.`,
        `${walletShort}'s XP orb drop — Pull Lab resets in ${collection}.`
      ];
      break;
    default:
      return `${walletShort} triggered an unknown event — mesh anomalies detected.`;
  }

  const index = Math.floor(rand() * templates.length);
  let lore = templates[index];
  if (opts && opts.short) {
    lore = lore.split(" — ")[0] || lore;
    if (lore.length > 140) lore = lore.slice(0, 137) + "...";
  }
  return lore;
}

// -----------------------------------------------------
// UI wiring
// -----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const bgCanvas = document.getElementById("wallet-flow-canvas");

  // demo flows for wallet mesh background
  const demoFlows = [
    { from: "0xspawn", to: "0xmesh1", volume: 4, kind: "coin" },
    { from: "0xmesh1", to: "0xmesh2", volume: 2, kind: "pack" },
    { from: "0xmesh2", to: "0xmesh3", volume: 5, kind: "xp" },
    { from: "0xmesh3", to: "0xspawn", volume: 1, kind: "burn" },
    { from: "0xmesh4", to: "0xmesh1", volume: 3, kind: "xp" },
    { from: "0xmesh4", to: "0xmesh5", volume: 4, kind: "coin" }
  ];

  initWalletFlow(bgCanvas, demoFlows, { lowPower: isMobile });

  // DOM refs
  const topTabs = document.querySelectorAll(".top-tab");
  const bottomTabs = document.querySelectorAll(".bottom-tab");
  const panels = document.querySelectorAll(".tab-panel");

  const btnConnect = document.getElementById("btn-connect");
  const activeWalletsEl = document.getElementById("active-wallets");

  const btnSettings = document.getElementById("btn-settings");
  const btnAccount = document.getElementById("btn-account");
  const accountSheet = document.getElementById("account-sheet");
  const settingsSheet = document.getElementById("settings-sheet");
  const sheetCloseButtons = document.querySelectorAll(".sheet-close-btn");

  const lootSegButtons = document.querySelectorAll(".segmented-btn[data-loot-view]");
  const meshFilterButtons = document.querySelectorAll(".mesh-filter-toggle .segmented-btn");
  const lootViews = {
    packs: document.getElementById("loot-view-packs"),
    lab: document.getElementById("loot-view-lab")
  };

  const activityList = document.getElementById("activity-list");
  const oracleList = document.getElementById("oracle-list");
  const meshEventList = document.getElementById("mesh-event-list");
  const streakDayEl = document.querySelector(".streak-day");
  const streakTextEl = document.getElementById("streak-text");

  const btnCheckin = document.getElementById("btn-checkin");
  const questCheckinBtn = document.getElementById("quest-checkin-btn");
  const btnOpenPack = document.getElementById("btn-open-pack");

  const meshFilterCopy = document.getElementById("mesh-filter-copy");

  const settingsRoot = document.getElementById("settings-root");
  const settingsDetail = document.getElementById("settings-detail");
  const settingsDetailTitle = document.getElementById("settings-detail-title");
  const settingsDetailBody = document.getElementById("settings-detail-body");
  const settingsBack = document.querySelector("[data-settings-back]");
  const sheetSettingRows = document.querySelectorAll("[data-settings-view]");
  const sheetAccountRows = document.querySelectorAll("[data-open-settings]");
  const btnLogout = document.getElementById("btn-logout");

  // simple app state
  let walletConnected = false;
  let streakDays = 1;
  let xpBalance = 1575;
  let spnBalance = 497;

  // helpers
  function setActiveTab(tabName) {
    topTabs.forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.tab === tabName);
    });
    bottomTabs.forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.tab === tabName);
    });
    panels.forEach(panel => {
      panel.classList.toggle("is-active", panel.id === `tab-${tabName}`);
    });
  }

  function pushMeshEvent(event) {
    const lore = generateLore(event, { short: true, seed: 42 });
    const li = document.createElement("li");
    li.textContent = lore;
    meshEventList.prepend(li);
    while (meshEventList.children.length > 10) {
      meshEventList.removeChild(meshEventList.lastChild);
    }
  }

  function pushActivityLine(targetList, text, limit) {
    const li = document.createElement("li");
    li.textContent = text;
    targetList.prepend(li);
    while (targetList.children.length > limit) {
      targetList.removeChild(targetList.lastChild);
    }
  }

  function refreshBalancesUI() {
    document.getElementById("xp-balance").textContent = `${xpBalance} XP`;
    document.getElementById("spn-balance").textContent = `${spnBalance} SPN`;
    streakDayEl.textContent = String(streakDays);
    streakTextEl.textContent = `Keep the streak for ${Math.max(
      0,
      7 - streakDays
    )} more days for a full weekly run.`;
  }

  // initial demo activity + oracle
  const seedEvents = [
    {
      kind: MeshEventKind.XP_GAIN,
      wallet: "0xspawn",
      amount: 50,
      collectionName: "Spawn mesh",
      timestamp: Date.now() - 60000
    },
    {
      kind: MeshEventKind.PACK_OPEN,
      wallet: "0xspawn",
      amount: 1,
      rarity: "EPIC",
      collectionName: "Foil Realms",
      timestamp: Date.now() - 40000
    },
    {
      kind: MeshEventKind.STREAK_TICK,
      wallet: "0xspawn",
      streakDays: streakDays,
      timestamp: Date.now() - 20000
    }
  ];
  seedEvents.forEach(e => {
    pushMeshEvent(e);
    pushActivityLine(activityList, generateLore(e, { short: true, seed: 7 }), 12);
  });

  const oracleSeed = [
    "Alpha signal (demo): wallet 0xmesh1 opens packs right after XP spikes.",
    "Gravity shift (demo): Creator cluster ‘Spawn mesh’ up 180% XP in 24h.",
    "Burn event (demo): high-volume wallet compressed a stack of gravity cores."
  ];
  oracleSeed.forEach(t => pushActivityLine(oracleList, t, 6));

  refreshBalancesUI();

  // Tab click wiring
  [...topTabs, ...bottomTabs].forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      if (tab) setActiveTab(tab);
    });
  });

  // Connect wallet mock
  btnConnect.addEventListener("click", () => {
    walletConnected = !walletConnected;
    if (walletConnected) {
      btnConnect.textContent = "Wallet connected";
      btnConnect.classList.add("connected");
      activeWalletsEl.textContent = "1";
      pushActivityLine(activityList, "Wallet connected to SpawnEngine mesh.", 12);
    } else {
      btnConnect.textContent = "Connect wallet";
      btnConnect.classList.remove("connected");
      activeWalletsEl.textContent = "0";
      pushActivityLine(activityList, "Wallet disconnected from mesh.", 12);
    }
  });

  // Loot segmented control
  lootSegButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.lootView;
      lootSegButtons.forEach(b => b.classList.toggle("is-active", b === btn));
      Object.entries(lootViews).forEach(([key, el]) => {
        el.classList.toggle("is-active", key === view);
        el.style.display = key === view ? "block" : "none";
      });
    });
  });

  // Mesh filter segmented
  meshFilterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      meshFilterButtons.forEach(b => b.classList.toggle("is-active", b === btn));
      const mode = btn.dataset.meshFilter;
      if (mode === "alpha") {
        meshFilterCopy.innerHTML =
          "Viewing mesh demo in <strong>Alpha hunters</strong> mode — high pack activity wallets glow brighter.";
      } else if (mode === "new") {
        meshFilterCopy.innerHTML =
          "Viewing mesh demo in <strong>New creators</strong> mode — fresh token and pack launches float to the edge of the mesh.";
      } else {
        meshFilterCopy.innerHTML =
          "Viewing mesh demo in <strong>Gravity clusters</strong> mode — wallets with the largest XP streams bend the mesh around them.";
      }
    });
  });

  // Check-in handling
  function performCheckin(source) {
    const now = Date.now();
    streakDays += 1;
    xpBalance += 25;
    refreshBalancesUI();

    const event = {
      kind: MeshEventKind.STREAK_TICK,
      wallet: "0xspawn",
      streakDays,
      timestamp: now
    };
    pushMeshEvent(event);
    pushActivityLine(activityList, `${source}: streak ticked to ${streakDays} days (+25 XP).`, 12);
    pushActivityLine(
      oracleList,
      `Oracle hint (demo): ${streakDays}-day streaks unlock stronger tribe bonuses.`,
      6
    );
  }

  btnCheckin.addEventListener("click", () => performCheckin("Home check-in"));
  questCheckinBtn.addEventListener("click", () => performCheckin("Quest check-in"));

  // Pack open simulation
  btnOpenPack.addEventListener("click", () => {
    const now = Date.now();
    const rarityRoll = ["COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"][
      Math.floor(Math.random() * 5)
    ];
    const event = {
      kind: MeshEventKind.PACK_OPEN,
      wallet: "0xspawn",
      amount: 1,
      rarity: rarityRoll,
      collectionName: "Spawn packs",
      timestamp: now
    };
    xpBalance += 35;
    refreshBalancesUI();
    pushMeshEvent(event);
    pushActivityLine(activityList, generateLore(event, { short: true, seed: 13 }), 12);
    pushActivityLine(
      oracleList,
      `Oracle hint (demo): recent ${mapRarityName(rarityRoll)} pulls may signal early creator momentum.`,
      6
    );
    setActiveTab("loot");
  });

  // Account sheet
  btnAccount.addEventListener("click", () => {
    accountSheet.classList.remove("sheet-hidden");
  });

  // Settings sheet
  btnSettings.addEventListener("click", () => {
    settingsSheet.classList.remove("sheet-hidden");
    showSettingsRoot();
  });

  sheetCloseButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.closeSheet;
      if (target === "account") accountSheet.classList.add("sheet-hidden");
      if (target === "settings") settingsSheet.classList.add("sheet-hidden");
    });
  });

  // Settings detail
  function showSettingsRoot() {
    settingsRoot.style.display = "block";
    settingsDetail.classList.add("hidden");
  }

  function openSettingsDetail(key) {
    settingsRoot.style.display = "none";
    settingsDetail.classList.remove("hidden");

    const map = {
      social: {
        title: "Social profiles",
        body: "Link Farcaster, X and other socials so mesh quests, Tribe streaks and referrals can tag your accounts."
      },
      notifications: {
        title: "Notifications",
        body: "Control XP, streak and pack alerts. Later this connects to Base push and Farcaster Frames so you never miss a daily ritual."
      },
      feeds: {
        title: "Feeds & Oracle feed",
        body: "Tune which docked apps feed into your activity + Oracle feed. The Sentient Mesh layer will scan this stream for Alpha patterns."
      },
      "preferred-wallet": {
        title: "Preferred wallet",
        body: "Choose the main wallet for streaks and XP. Other wallets can still dock into your mesh as satellites."
      },
      "verified-addresses": {
        title: "Verified addresses",
        body: "Lock in addresses you control for creator coins, packs, referral splits and Launchpad revenue."
      },
      "warp-links": {
        title: "Docked apps & XP SDK",
        body: "Manage apps that plug into the SpawnEngine XP SDK. Any Base app here can grant SpawnEngine XP directly to your mesh."
      },
      "premium-filters": {
        title: "Premium mesh filters",
        body: "Future SPN-paid tier that unlocks deep filters like Whale Movement, Creator Yield Analysis and high-resolution Gravity clusters."
      },
      theme: {
        title: "Theme",
        body: "Switch visual skins like Deep Void, Neon Grid or Foil Realms overlay. Purely cosmetic, zero RNG impact."
      },
      support: {
        title: "Support",
        body: "SpawnEngine hub for bugs, feature requests and Base ecosystem integrations."
      },
      launchpad: {
        title: "SpawnEngine Launchpad",
        body: "Zero-code token & pack launch via standardized bonding curves. Creators get instant liquidity; SpawnEngine skims protocol fees."
      },
      referrals: {
        title: "Referrals",
        body: "Track wallets you’ve onboarded, XP earned from them and future SPN splits when they launch their own meshes."
      },
      earnings: {
        title: "Earnings",
        body: "Overview of XP, SPN and Launchpad fees earned from quests, packs, creator bounties and sponsored meshes."
      },
      collectibles: {
        title: "Collectibles",
        body: "View your packs, fragments, shards, relic keys and future booster NFTs once on-chain minting is live."
      },
      "swap-wallet": {
        title: "Swap wallet",
        body: "Disconnect the current wallet and connect a new one. Mesh ID keeps your streak history while addresses can rotate."
      }
    };

    const item = map[key] || { title: key, body: "" };
    settingsDetailTitle.textContent = item.title;
    settingsDetailBody.textContent = item.body;
  }

  sheetSettingRows.forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.settingsView;
      openSettingsDetail(key);
    });
  });

  sheetAccountRows.forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.openSettings;
      settingsSheet.classList.remove("sheet-hidden");
      accountSheet.classList.add("sheet-hidden");
      openSettingsDetail(key);
    });
  });

  settingsBack.addEventListener("click", () => {
    showSettingsRoot();
  });

  btnLogout.addEventListener("click", () => {
    walletConnected = false;
    btnConnect.textContent = "Connect wallet";
    btnConnect.classList.remove("connected");
    activeWalletsEl.textContent = "0";
    accountSheet.classList.add("sheet-hidden");
    pushActivityLine(activityList, "Wallet disconnected via account panel.", 12);
  });
});