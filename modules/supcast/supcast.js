/* ============================================================
   SPAWNENGINE SUPCAST MODULE v3.1
   Support-as-a-System · Mesh-connected Knowledge Layer
   ============================================================ */

window.SpawnMesh = window.SpawnMesh || { event: () => {} };

/* —— MOCK DATABASE —— */
let SUPCAST_TICKETS = [
  {
    id: 101,
    title: "Base transaction failed",
    category: "Network",
    status: "Open",
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    solvedBy: null,
    xpReward: 25,
    author: "@spawniz"
  },
  {
    id: 102,
    title: "Pack reveal lag on mobile",
    category: "Performance",
    status: "Claimed",
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    solvedBy: "@mesh_support",
    xpReward: 50,
    author: "@mesh_trader"
  }
];

/* —— HELPERS —— */
function generateId() {
  return Math.floor(Math.random() * 100000);
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ============================================================
   SUPCAST API CORE
   ============================================================ */

/**
 * Get all tickets (mock)
 */
export function getTickets() {
  return SUPCAST_TICKETS.map((t) => ({
    ...t,
    timeAgo: timeAgo(t.createdAt)
  }));
}

/**
 * Create new support ticket
 * @param {string} title
 * @param {string} category
 * @param {string} author
 */
export function createTicket(title, category = "General", author = "@unknown") {
  const newTicket = {
    id: generateId(),
    title,
    category,
    status: "Open",
    createdAt: Date.now(),
    solvedBy: null,
    xpReward: 20,
    author
  };

  SUPCAST_TICKETS.unshift(newTicket);
  console.log("🎟️ [SUPCAST] Ticket created:", newTicket.title);

  if (window.SpawnMesh) SpawnMesh.event("xp");

  renderSupCastList();
  showToast(`Ticket “${title}” opened.`);

  return {
    success: true,
    message: `Ticket “${title}” opened in SupCast.`,
    ticket: newTicket
  };
}

/**
 * Mark ticket as solved
 * @param {number} id
 * @param {string} solver
 */
export function solveTicket(id, solver = "@mesh_support") {
  const t = SUPCAST_TICKETS.find((x) => x.id === id);
  if (!t) return { success: false, message: "Ticket not found." };
  if (t.status === "Solved") return { success: false, message: "Already solved." };

  t.status = "Solved";
  t.solvedBy = solver;
  t.solvedAt = Date.now();

  if (window.SpawnMesh) SpawnMesh.event("xp");

  console.log(`✅ [SUPCAST] Ticket #${id} solved by ${solver}.`);

  renderSupCastList();
  showToast(`Ticket #${id} solved.`);

  return {
    success: true,
    message: `Ticket #${id} marked as solved.`,
    ticket: t
  };
}

/**
 * Filter tickets by status
 * @param {string} status - "Open" | "Claimed" | "Solved"
 */
export function filterTickets(status) {
  return SUPCAST_TICKETS.filter(
    (t) => t.status.toLowerCase() === status.toLowerCase()
  );
}

/**
 * Return XP gained from solved tickets
 */
export function getXpFromSolved() {
  const solved = SUPCAST_TICKETS.filter((t) => t.status === "Solved");
  const total = solved.reduce((sum, t) => sum + (t.xpReward || 0), 0);
  return { count: solved.length, totalXp: total };
}

/**
 * Reset ticket list (dev/debug)
 */
export function resetSupcast() {
  SUPCAST_TICKETS = [];
  console.log("♻️ [SUPCAST] Reset ticket list.");
  renderSupCastList();
}

/* ============================================================
   UI RENDERING + FEEDBACK
   ============================================================ */

/**
 * Render ticket list to DOM
 */
export function renderSupCastList(containerId = "supcastFeed") {
  const el = document.getElementById(containerId);
  if (!el) return;

  const tickets = getTickets();
  el.innerHTML = tickets.length
    ? tickets
        .map(
          (t) => `
        <div class="supcast-item supcast-${t.status.toLowerCase()}">
          <div class="supcast-item-main">
            <div class="supcast-title">${t.title}</div>
            <div class="supcast-meta">${t.category} · ${t.timeAgo}</div>
          </div>
          <div class="supcast-actions">
            ${
              t.status === "Open"
                ? `<button class="supcast-btn" onclick="SupCast.solveTicket(${t.id}, '@spawniz')">Mark solved</button>`
                : `<div class="supcast-status">${t.status}</div>`
            }
          </div>
        </div>`
        )
        .join("")
    : `<p class="supcast-empty">No tickets yet. Start by submitting one above.</p>`;
}

/**
 * Simple toast message system
 */
function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style = `
    position: fixed;
    bottom: 14px;
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

/* ============================================================
   GLOBAL EXPORT
   ============================================================ */
window.SupCast = {
  getTickets,
  createTicket,
  solveTicket,
  filterTickets,
  getXpFromSolved,
  resetSupcast,
  renderSupCastList
};

console.log("🧩 SupCast module initialized · v3.1");