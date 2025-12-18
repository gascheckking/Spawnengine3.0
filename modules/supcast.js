/* ============================================================
   SPAWNENGINE SUPCAST MODULE v1.0
   Support-as-a-System · Mesh-connected Knowledge Layer
   ============================================================ */
window.SpawnMesh = window.SpawnMesh || { event: () => {} };
/* —— mock-database —— */
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

/* —— helpers —— */
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

/* —— API-core —— */

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
  if (!t) {
    return { success: false, message: "Ticket not found." };
  }

  if (t.status === "Solved") {
    return { success: false, message: "Already solved." };
  }

  t.status = "Solved";
  t.solvedBy = solver;
  t.solvedAt = Date.now();

  if (window.SpawnMesh) SpawnMesh.event("xp");

  console.log(`✅ [SUPCAST] Ticket #${id} solved by ${solver}.`);

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

/* —— XP link —— */
export function getXpFromSolved() {
  const solved = SUPCAST_TICKETS.filter((t) => t.status === "Solved");
  const total = solved.reduce((sum, t) => sum + (t.xpReward || 0), 0);
  return {
    count: solved.length,
    totalXp: total
  };
}

/* —— reset (debug/dev) —— */
export function resetSupcast() {
  SUPCAST_TICKETS = [];
  console.log("♻️ [SUPCAST] Reset ticket list.");
}

/* —— UI helpers —— */
export function renderSupCastList(containerId = "supcastFeed") {
  const el = document.getElementById(containerId);
  if (!el) return;
  const tickets = getTickets();

  el.innerHTML = tickets
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
      </div>
    `
    )
    .join("");
}

/* —— global exposure —— */
window.SupCast = {
  getTickets,
  createTicket,
  solveTicket,
  filterTickets,
  getXpFromSolved,
  resetSupcast,
  renderSupCastList
};

console.log("🧩 SupCast module initialized.");
