/* ============================================================
   SPAWNENGINE · SLOT MACHINE v3.2 — Stable Build
   Mesh Casino Mini-Game — Spin to earn XP, Fragments & Relics
   ============================================================ */

import { getInventory, simulatePackOpen } from "../../api/pack-actions.js";

/* —— Inject CSS automatically —— */
if (!document.querySelector('link[href="modules/slotmachine/slots.css"]')) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "modules/slotmachine/slots.css";
  document.head.appendChild(link);
}

/* —— DOM Elements —— */
const reels = [];
for (let i = 1; i <= 5; i++) {
  const el = document.getElementById(`reel${i}`);
  if (el) reels.push(el);
}
const spinBtn = document.getElementById("spinBtn");
const collectBtn = document.getElementById("collectBtn");
const betSelect = document.getElementById("betSelect");
const slotResult = document.getElementById("slotResult");
const slotBalance = document.getElementById("slotBalance");

/* —— Config —— */
const SYMBOLS = ["🍒", "💎", "⭐", "🔔", "7️⃣", "💥", "W", "S"];
let balance = 1000;
let lastLoot = null;

/* —— Helpers —— */
function randomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function rollReels() {
  reels.forEach((r, i) => {
    r.textContent = randomSymbol();
    r.style.transform = "translateY(-25px)";
    setTimeout(() => {
      r.style.transform = "translateY(0)";
    }, 120 * i);
  });
}

/* —— Spin Logic —— */
function handleSpin() {
  const bet = parseInt(betSelect.value);
  if (balance < bet) {
    showToast("❌ Not enough SPN!");
    return;
  }

  spinBtn.disabled = true;
  collectBtn.disabled = true;
  balance -= bet;
  slotBalance.textContent = `${balance} SPN`;
  slotResult.textContent = "Spinning... 🎡";

  rollReels();

  setTimeout(() => {
    const symbols = reels.map(() => randomSymbol());
    reels.forEach((r, i) => (r.textContent = symbols[i]));

    const isWin = symbols.every((s) => s === symbols[0]);
    reels.forEach((r) => r.classList.remove("win"));

    if (isWin) {
      reels.forEach((r) => r.classList.add("win"));
      const reward = simulatePackOpen();
      balance += 200;
      lastLoot = reward;
      slotResult.textContent = `🎉 JACKPOT! You won +200 SPN & loot!`;
      showToast("Jackpot loot unlocked!");
      collectBtn.disabled = false;
    } else {
      slotResult.textContent = "No win this time. Try again!";
    }

    slotBalance.textContent = `${balance} SPN`;
    spinBtn.disabled = false;
  }, 2000);
}

/* —— Collect Loot —— */
function handleCollect() {
  if (!lastLoot) return;
  const inv = getInventory();
  showToast(
    `Loot added: ${lastLoot.events.join(", ")} | Inv: ${inv.fragments}F / ${inv.shards}S`
  );
  lastLoot = null;
  collectBtn.disabled = true;
}

/* —— Toast —— */
function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style = `
    position: fixed;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: #4df2ff;
    color: #000;
    padding: 8px 14px;
    border-radius: 8px;
    font-weight: 600;
    font-family: system-ui, sans-serif;
    z-index: 9999;
    box-shadow: 0 0 15px rgba(77,242,255,0.6);
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

/* —— Init —— */
window.addEventListener("DOMContentLoaded", () => {
  slotBalance.textContent = `${balance} SPN`;
  if (spinBtn) spinBtn.addEventListener("click", handleSpin);
  if (collectBtn) collectBtn.addEventListener("click", handleCollect);
  console.log("🎰 SlotMachine initialized (v3.2)");
});