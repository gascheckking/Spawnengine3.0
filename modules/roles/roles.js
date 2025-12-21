/* ============================================================
   SPAWNENGINE · ROLES v3.2
   Role Selector and Identity Handler for Mesh Onboarding
   ============================================================ */

import { MeshCore } from "../../core/MeshCore.js";

/* —— Auto-inject CSS —— */
if (!document.querySelector('link[href="modules/roles/roles.css"]')) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "modules/roles/roles.css";
  document.head.appendChild(link);
}

/* —— Wait for DOM —— */
window.addEventListener("DOMContentLoaded", () => {
  const roleButtons = document.querySelectorAll("[data-role]");
  const roleDisplay = document.getElementById("selectedRole");
  const confirmBtn = document.getElementById("confirmRole");

  let selectedRole = localStorage.getItem("spawnRole") || null;

  /* —— Render current role —— */
  function updateRoleDisplay() {
    if (roleDisplay) {
      roleDisplay.textContent = selectedRole
        ? `Current Role: ${selectedRole}`
        : "Select your onchain role";
    }
  }

  /* —— Role select —— */
  roleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedRole = btn.dataset.role;
      roleButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      updateRoleDisplay();
    });
  });

  /* —— Confirm role —— */
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (!selectedRole) return showToast("Select a role first!");
      localStorage.setItem("spawnRole", selectedRole);
      if (MeshCore?.state) MeshCore.state.role = selectedRole;
      showToast(`✅ Role set to ${selectedRole}`);
      console.log(`Role confirmed: ${selectedRole}`);
    });
  }

  /* —— Toast helper —— */
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

  /* —— Init Log —— */
  updateRoleDisplay();
  console.log("🧬 Roles module loaded successfully (v3.2)");
});