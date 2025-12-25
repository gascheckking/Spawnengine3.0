/* ============================================================
   SPAWNENGINE HUD v3.2 — Mesh + HUD logik
   ============================================================ */

// — IMPORTS
import { getInventory, simulatePackOpen, simulateSynthesis } from "../../api/pack-actions.js";
import { createTicket, renderSupCastList } from "../supcast/supcast.js";
import { getHomeFeed } from "../../api/mesh-feed.js";
import { getProfile, updateWalletStatus } from "../../api/user-profile.js";
import { getTokenData } from "../../api/spawnengine-token.js";
import { getSystemActivity } from "../../api/activity.js";

// — GLOBAL STATE
let balanceXp = 0;
let role = localStorage.getItem("spawnRole") || "Explorer";
let inventory = getInventory();

// — DOM READY
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("hudRole").textContent = role;

  updateInventory();
  bindNavigation();
  bindHUD();
  renderProfile();
  renderToken();
  renderFeed();

  toast("HUD v3.2 loaded");
});

// — NAVIGATION
function bindNavigation() {
  const buttons = document.querySelectorAll(".hud-nav button");
  buttons.forEach((btn) =>
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const view = btn.dataset.view;
      document.querySelectorAll(".hud-view").forEach((v) => v.classList.remove("active"));
      document.getElementById(view).classList.add("active");
    })
  );
}

// — HUD-EVENTS
function bindHUD() {
  const xpEl = document.getElementById("hudXp");
  const spnEl = document.getElementById("hudSpn");

  document.getElementById("hudBoost").addEventListener("click", () => {
    balanceXp += 50;
    xpEl.textContent = `XP: ${balanceXp}`;
    toast("+50 XP claimed");
  });

  document.getElementById("hudRefresh").addEventListener("click", () => {
    const modules = Math.floor(Math.random() * 10) + 1;
    document.getElementById("hudModules").textContent = modules;
    toast(`Mesh synced (${modules} modules)`);
  });

  document.getElementById("lootOpen").addEventListener("click", () => {
    const reward = simulatePackOpen();
    inventory = reward.inventory;
    updateInventory();
    toast("🎁 Pack opened!");
  });

  document.getElementById("lootSynth").addEventListener("click", () => {
    const res = simulateSynthesis();
    inventory = res.inventory;
    updateInventory();
    toast(res.message);
  });

  document.getElementById("forgeStart").addEventListener("click", () => {
    const result = simulateSynthesis();
    document.getElementById("forgeResult").textContent = result.message;
    updateInventory();
    toast("Forge attempt executed");
  });

  document.getElementById("supcastSend").addEventListener("click", () => {
    const text = document.getElementById("supcastInput").value.trim();
    if (!text) return toast("Enter message");
    createTicket(text, "General", "@spawniz");
    document.getElementById("supcastInput").value = "";
    renderSupCastList("supcastFeed");
    toast("🎫 Ticket submitted");
  });

  renderSupCastList("supcastFeed");

  const themeSelect = document.getElementById("hudTheme");
  themeSelect.value = localStorage.getItem("spawnTheme") || "glassbase";
  themeSelect.addEventListener("change", (e) => {
    document.body.dataset.theme = e.target.value;
    localStorage.setItem("spawnTheme", e.target.value);
    toast(`Theme set to ${e.target.value}`);
  });

  const tf = document.getElementById("trackerFeed");
  tf.innerHTML = `
    <div>👣 Tracking: ${localStorage.getItem("wallet") || "0x...C0DE"}</div>
    <div>💸 XP claim event registered.</div>
    <div>📈 Loot data synced.</div>`;
}

// — INVENTORY
function updateInventory() {
  document.getElementById("hudFrag").textContent = inventory.fragments;
  document.getElementById("hudShard").textContent = inventory.shards;
  document.getElementById("hudRelic").textContent = inventory.relics;
}

// — TOAST
function toast(msg) {
  const el = document.getElementById("hudToast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2000);
}

// ============================================================
// 🔁 MESH UNIVERSE LOGIK
// ============================================================

const xpEl = document.getElementById("xpBalance");
const spnEl = document.getElementById("spnBalance");
const roleEl = document.getElementById("userRole");
const handleEl = document.getElementById("userHandle");
const walletBtn = document.getElementById("connectWalletBtn");
const feedList = document.getElementById("meshFeedList");
const tokenPrice = document.getElementById("tokenPrice");
const tokenChange = document.getElementById("tokenChange");
const tokenTVL = document.getElementById("tokenTVL");
const tokenUsers = document.getElementById("tokenUsers");
const refreshBtn = document.getElementById("refreshMeshBtn");

// — PROFIL
function renderProfile() {
  const user = getProfile();
  xpEl.textContent = user.xpBalance;
  spnEl.textContent = user.spnBalance;
  roleEl.textContent = user.currentRole;
  handleEl.textContent = user.handle;
  walletBtn.textContent = user.isConnected ? "Disconnect Wallet" : "Connect Wallet";
}

// — TOKEN
function renderToken() {
  const token = getTokenData();
  tokenPrice.textContent = `$${token.priceUsd}`;
  tokenChange.textContent = `${(token.dailyChange * 100).toFixed(1)}%`;
  tokenTVL.textContent = `${token.tvlEth} ETH`;
  tokenUsers.textContent = token.participants;
}

// — FEED
function renderFeed() {
  const feed = getHomeFeed();
  const system = getSystemActivity();
  const combined = [...feed, ...system.slice(0, 3)];
  feedList.innerHTML = combined.map(event => `<li>${event}</li>`).join("");
}

// — WALLET TOGGLE
walletBtn?.addEventListener("click", () => {
  const user = getProfile();
  updateWalletStatus(!user.isConnected);
  renderProfile();
  toast(user.isConnected ? "Wallet connected!" : "Wallet disconnected.");
});

// — REFRESH BUTTON
refreshBtn?.addEventListener("click", () => {
  renderProfile();
  renderToken();
  renderFeed();
  toast("Mesh Universe refreshed.");
});
// 🎰 SLOT MACHINE
const rewards = [
  { rewardType: "xp", amount: 50, emoji: "⭐", weight: 40 },
  { rewardType: "xp", amount: 100, emoji: "✨", weight: 20 },
  { rewardType: "fragments", amount: 1, emoji: "💎", weight: 15 },
  { rewardType: "fragments", amount: 2, emoji: "💎", weight: 8 },
  { rewardType: "shards", amount: 3, emoji: "🔹", weight: 10 },
  { rewardType: "shards", amount: 5, emoji: "🔹", weight: 5 },
  { rewardType: "relic", amount: 1, emoji: "🏛️", weight: 2 }
];

function simulateSlotSpin() {
  const total = rewards.reduce((sum, r) => sum + r.weight, 0);
  let rand = Math.random() * total;
  for (const r of rewards) {
    rand -= r.weight;
    if (rand <= 0) return r;
  }
  return rewards[0];
}

function animateReels(duration = 1500) {
  const reels = document.querySelectorAll('#slotReels .reel');
  const emojis = ["🔒", "⭐", "💎", "🔹", "✨", "🏛️", "🎰"];
  reels.forEach((reel, i) => {
    reel.classList.add('spinning');
    let count = 0;
    const interval = setInterval(() => {
      reel.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      count++;
      if (count > 30) clearInterval(interval);
    }, 80 - i * 20);
  });
  return new Promise(res => setTimeout(() => {
    document.querySelectorAll('.reel').forEach(r => r.classList.remove('spinning'));
    res();
  }, duration));
}

async function handleSlotSpin() {
  const btn = document.getElementById('slotSpinBtn');
  const resultDiv = document.getElementById('slotResult');
  if (btn.disabled) return;

  btn.disabled = true;
  btn.textContent = "Spinning...";
  resultDiv.textContent = "The reels are turning...";

  await animateReels(2000);

  const reward = simulateSlotSpin();
  document.querySelectorAll('#slotReels .reel').forEach(reel => reel.textContent = reward.emoji);

  if (!inventory[reward.rewardType]) inventory[reward.rewardType] = 0;
  inventory[reward.rewardType] += reward.amount;

  updateInventory();
  resultDiv.textContent = `🎉 You won ${reward.amount} ${reward.rewardType.toUpperCase()} ${reward.emoji}`;
  if (typeof toast === 'function') toast(`+${reward.amount} ${reward.rewardType}`, "success");

  btn.disabled = false;
  btn.textContent = "🎰 Spin Again";
}

document.getElementById('slotSpinBtn')?.addEventListener('click', handleSlotSpin);

// 🔁 XP LOOP
let xpStreak = parseInt(localStorage.getItem("xpStreak")) || 0;
const xpStreakEl = document.getElementById("xpStreakCount");
if (xpStreakEl) xpStreakEl.textContent = xpStreak;

document.getElementById("completeLoopBtn")?.addEventListener("click", () => {
  const tasks = document.querySelectorAll("#loopTasks input[type='checkbox']");
  let gainedXP = 0;
  let allCompleted = true;

  tasks.forEach(task => {
    if (task.checked) {
      gainedXP += parseInt(task.dataset.xp || "0");
    } else {
      allCompleted = false;
    }
  });

  if (!allCompleted) {
    toast("Complete all tasks to get your XP bonus!", "warning");
    return;
  }

  xpStreak++;
  localStorage.setItem("xpStreak", xpStreak);
  balanceXp += gainedXP + (xpStreak * 10);
  xpStreakEl.textContent = xpStreak;
  document.getElementById("hudXp").textContent = `XP: ${balanceXp}`;
  toast(`🔥 Loop complete! +${gainedXP} XP (+${xpStreak * 10} streak bonus)`);

  tasks.forEach(t => (t.checked = false));
});

// 💼 WALLET
function updateWalletUI() {
  const profile = getProfile(); // mock or real
  const addressEl = document.getElementById("walletAddress");
  const balanceEl = document.getElementById("walletBalance");
  const spnEl = document.getElementById("walletSPN");

  if (!profile) return;
  addressEl.textContent = profile.wallet || "Not Connected";
  balanceEl.textContent = inventory.spawnTokens || 0;
  spnEl.textContent = inventory.spnBalance || 0;
}

document.getElementById("walletBuyBtn")?.addEventListener("click", () => {
  toast("Redirecting to buy provider...", "info");
  // TODO: Moonpay/Ramp/Stripe
});

document.getElementById("walletSendBtn")?.addEventListener("click", () => {
  const to = prompt("Enter wallet address:");
  const amt = prompt("Amount to send:");
  if (to && amt) toast(`Sending ${amt} Tokens to ${to}`, "success");
});

document.getElementById("walletReceiveBtn")?.addEventListener("click", () => {
  const addr = getProfile()?.wallet || "0x123";
  navigator.clipboard.writeText(addr);
  toast(`Copied: ${addr}`, "success");
});

document.getElementById("walletBridgeBtn")?.addEventListener("click", () => {
  toast("Bridge function coming soon!", "info");
});

document.addEventListener("DOMContentLoaded", () => {
  updateWalletUI();
});
