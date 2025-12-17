/* ============================================================
   SpawnEngine Roles Module v3.1
   Role management for Mesh identities
   ============================================================ */

import { getProfile, updateProfileRole } from "../../api/user-profile.js";

/* —— Elements —— */
const roleDisplay = document.getElementById("roleDisplay");
const roleList = document.getElementById("roleList");

/* —— Mock Role Definitions —— */
const AVAILABLE_ROLES = [
  {
    id: "builder",
    title: "Builder",
    desc: "Construct tools, interfaces, and Mesh modules.",
    emoji: "🧱",
  },
  {
    id: "trader",
    title: "Trader",
    desc: "Buy, sell, and swap assets within the Mesh economy.",
    emoji: "💱",
  },
  {
    id: "collector",
    title: "Collector",
    desc: "Gather rare packs and relics to boost your Mesh XP.",
    emoji: "🎴",
  },
  {
    id: "operator",
    title: "Operator",
    desc: "Manage nodes and optimize onchain Mesh flow.",
    emoji: "⚙️",
  },
  {
    id: "vibe",
    title: "Vibe Agent",
    desc: "Shape the Mesh culture. Influence. Engage. Lead.",
    emoji: "✨",
  },
];

/* —— Render Role List —— */
function renderRoles() {
  const user = getProfile();
  roleDisplay.textContent = user.currentRole;

  roleList.innerHTML = AVAILABLE_ROLES.map(role => `
    <div class="role-card" data-id="${role.id}">
      <div class="role-icon">${role.emoji}</div>
      <h4>${role.title}</h4>
      <p>${role.desc}</p>
    </div>
  `).join("");

  attachRoleEvents();
}

/* —— Handle Role Selection —— */
function attachRoleEvents() {
  const cards = document.querySelectorAll(".role-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const selected = card.dataset.id;
      updateProfileRole(selected);
      renderRoles();
      showToast(`Role changed to ${selected.toUpperCase()}`);
    });
  });
}

/* —— UI Feedback Toast —— */
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
window.addEventListener("DOMContentLoaded", renderRoles);