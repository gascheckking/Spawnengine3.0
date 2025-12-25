// ============================================================
// SPAWNENGINE APP CORE v3.6
// ============================================================

// 🌐 NAVIGATION BETWEEN VIEWS
document.querySelectorAll("#mainNav button").forEach(btn => {
  btn.addEventListener("click", () => {
    // Remove active state from all
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.querySelectorAll("#mainNav button").forEach(b => b.classList.remove("active"));

    // Set new active view
    btn.classList.add("active");
    const viewId = btn.dataset.view;
    const targetView = document.getElementById(viewId);
    if (targetView) targetView.classList.add("active");

    // Pulse background
    if (typeof spawnMeshPulse === "function") {
      spawnMeshPulse("#4df2ff", innerWidth / 2, innerHeight / 2);
    }
  });
});

// 📡 MOCK LIVE TICKER
const ticker = document.querySelector(".live-ticker");
const events = [
  "PACK_OPEN · Neon Fragment",
  "BURN_EVENT · XP Sync",
  "CAST_POST · Farcaster",
  "SWAP · Base Mesh"
];
let index = 0;

setInterval(() => {
  if (ticker) {
    ticker.textContent = "LIVE " + events[index % events.length];
    index++;
  }
}, 4000);