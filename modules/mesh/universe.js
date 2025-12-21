/* ============================================================
   SPAWNENGINE · Mesh Universe Module v3.1
   Handles Mesh Feed, Profile, Token Data & Network Status
   ============================================================ */

import { getHomeFeed } from "../../api/mesh-feed.js";
import { getProfile, updateWalletStatus } from "../../api/user-profile.js";
import { getTokenData } from "../../api/spawnengine-token.js";
import { getSystemActivity } from "../../api/activity.js";

/* —— Inject CSS automatically —— */
if (!document.querySelector('link[href="modules/mesh/universe.css"]')) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "modules/mesh/universe.css";
  document.head.appendChild(link);
}

/* —— Element references —— */
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
const meshStatus = document.getElementById("meshStatus");
const refreshBtn = document.getElementById("refreshMeshBtn");

/* —— Render Profile —— */
function renderProfile() {
  const user = getProfile();
  xpEl.textContent = user.xpBalance;
  spnEl.textContent = user.spnBalance;
  roleEl.textContent = user.currentRole;
  handleEl.textContent = user.handle;
  walletBtn.textContent = user.isConnected ? "Disconnect Wallet" : "Connect Wallet";
}

/* —— Wallet Toggle —— */
walletBtn.addEventListener("click", () => {
  const user = getProfile();
  updateWalletStatus(!user.isConnected);
  renderProfile();
  showToast(user.isConnected ? "Wallet connected!" : "Wallet disconnected.");
});

/* —— Token Info —— */
function renderToken() {
  const token = getTokenData();
  tokenPrice.textContent = `$${token.priceUsd}`;
  tokenChange.textContent = `${(token.dailyChange * 100).toFixed(1)}%`;
  tokenTVL.textContent = `${token.tvlEth} ETH`;
  tokenUsers.textContent = token.participants;
}

/* —— Mesh Feed —— */
function renderFeed() {
  const feed = getHomeFeed();
  const system = getSystemActivity();

  const combined = [...feed, ...system.slice(0, 3)];

  feedList.innerHTML = combined.map(event => `<li>${event}</li>`).join("");
}

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

/* —— Mesh Connection Indicator —— */
window.addEventListener("offline", () => {
  meshStatus.textContent = "🔴 Offline";
});
window.addEventListener("online", () => {
  meshStatus.textContent = "🟢 Online";
});

/* —— Refresh Button —— */
refreshBtn.addEventListener("click", () => {
  renderProfile();
  renderToken();
  renderFeed();
  showToast("Mesh Universe refreshed.");
});

/* —— Init —— */
window.addEventListener("DOMContentLoaded", () => {
  renderProfile();
  renderToken();
  renderFeed();
});