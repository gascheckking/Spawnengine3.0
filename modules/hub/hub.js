import { renderSupCastList } from "../supcast/supcast.js";

const role = localStorage.getItem("meshRole") || "Explorer";
document.getElementById("hubRole").textContent = role;

document.getElementById("hubRefresh").addEventListener("click", () => {
  document.getElementById("hubModules").textContent = Math.floor(Math.random() * 10);
  showToast("Mesh synced successfully!");
});

document.getElementById("hubXPBoost").addEventListener("click", () => {
  const el = document.getElementById("hubStreak");
  let val = parseInt(el.textContent);
  el.textContent = val + 1;
  showToast(`XP Streak: ${val + 1}`);
});

document.getElementById("openSupcast").addEventListener("click", () => {
  window.location.href = "../supcast/supcast.html";
});

// SupCast mini render
window.addEventListener("DOMContentLoaded", () => {
  renderSupCastList("miniSupcastFeed");
});

// Toast helper
function showToast(msg) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.style = `
    position: fixed;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: #4df2ff;
    color: #000;
    padding: 8px 16px;
    border-radius: 10px;
    font-weight: 600;
    font-family: system-ui, sans-serif;
    z-index: 9999;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}