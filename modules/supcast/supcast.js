/* ============================================================
   SPAWNENGINE · SUPCAST v3.2
   Support-as-a-System · Mesh-connected Knowledge Layer
   ============================================================ */

import { createTicket, getTickets, renderSupCastList } from "../../api/supcast-actions.js";

/* —— Inject CSS automatically —— */
if (!document.querySelector('link[href="modules/supcast/supcast.css"]')) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "modules/supcast/supcast.css";
  document.head.appendChild(link);
}

/* —— Elements —— */
const input = document.getElementById("supportInput");
const category = document.getElementById("supportCategory");
const submitBtn = document.getElementById("submitSupport");
const feedContainer = document.getElementById("supcastFeed");

/* —— Render Tickets —— */
function renderTickets() {
  const tickets = getTickets();
  if (!tickets.length) {
    feedContainer.innerHTML = "<p>No tickets yet. Be the first to create one!</p>";
    return;
  }

  feedContainer.innerHTML = tickets
    .map(
      (t) => `
    <div class="supcast-item ${t.status}">
      <div class="supcast-item-main">
        <div class="supcast-title">${t.message}</div>
        <div class="supcast-meta">#${t.id} · ${t.category} · ${t.time}</div>
      </div>
      <div class="supcast-actions">
        <button class="supcast-btn" data-id="${t.id}">Resolve</button>
        <div class="supcast-status">${t.status}</div>
      </div>
    </div>`
    )
    .join("");

  document.querySelectorAll(".supcast-btn").forEach((btn) =>
    btn.addEventListener("click", () => resolveTicket(btn.dataset.id))
  );
}

/* —— Create Ticket —— */
submitBtn?.addEventListener("click", () => {
  const msg = input.value.trim();
  const cat = category.value;
  if (!msg) return showToast("Please enter your message.");

  createTicket(msg, cat, "@spawniz");
  input.value = "";
  showToast("🎫 Support ticket created!");
  renderTickets();
});

/* —— Resolve Ticket —— */
function resolveTicket(id) {
  const tickets = getTickets();
  const t = tickets.find((x) => x.id == id);
  if (t) t.status = "solved";
  showToast("✅ Ticket resolved!");
  renderTickets();
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
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

/* —— Init —— */
window.addEventListener("DOMContentLoaded", () => {
  renderTickets();
  console.log("💬 SupCast module loaded (v3.2)");
});