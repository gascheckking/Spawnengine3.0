/* ============================================================
   SpawnEngine SlotMachine v3.1
   Casino-style Mesh loot system with XP/Item rewards
   ============================================================ */

import { getInventory, simulatePackOpen } from "../../api/pack-actions.js";

/* —— Elements —— */
const reels = [
  document.getElementById("reel1"),
  document.getElementById("reel2"),
  document.getElementById("reel3"),
  document.getElementById("reel4"),
  document.getElementById("reel5"),
];
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
    r.style.transform = "translateY(-20px)";
    setTimeout(() => {
      r.style.transform = "translateY(0)";
    }, 200 * i);
  });
}

/* —— Spin Logic —— */
spinBtn.addEventListener("click", () => {
  const bet = parseInt(betSelect.value);
  if (balance < bet) {
    showToast("Not enough SPN!");
    return;
  }

  spinBtn.disabled = true;
  collectBtn.disabled = true;
  balance -= bet;
  slotBalance.textContent = `${balance} SPN`;
  slotResult.textContent = "Spinning...";

  rollReels();

  setTimeout(() => {
    const symbols = reels.map(() => randomSymbol());
    reels.forEach((r, i) => (r.textContent = symbols[i]));

    const isWin = symbols.every((s) => s === symbols[0]);
    if (isWin) {
      const reward = simulatePackOpen();
      balance += 200;
      lastLoot = reward;
      slotResult.textContent = `🎉 JACKPOT! You won +200 SPN and loot!`;
      showToast("Jackpot loot unlocked!");
      collectBtn.disabled = false;
    } else {
      slotResult.textContent = "No win this time. Try again!";
    }

    slotBalance.textContent = `${balance} SPN`;
    spinBtn.disabled = false;
  }, 2000);
});

/* —— Collect Loot —— */
collectBtn.addEventListener("click", () => {
  if (!lastLoot) return;
  const inv = getInventory();
  showToast(`Loot added: ${lastLoot.events.join(", ")} | Inv: ${inv.fragments}F / ${inv.shards}S`);
  lastLoot = null;
  collectBtn.disabled = true;
});

/* —— Toast System —— */
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
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

/* —— Init —— */
window.addEventListener("DOMContentLoaded", () => {
  slotBalance.textContent = `${balance} SPN`;
});