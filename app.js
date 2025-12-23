// ============================================================
// SPAWNENGINE APP CORE v3.6
// ============================================================

// Navigation between views
document.querySelectorAll("#mainNav button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.querySelectorAll("#mainNav button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.view).classList.add("active");

    spawnMeshPulse("#4df2ff", innerWidth / 2, innerHeight / 2);
  });
});

// Mock live ticker updater
const ticker = document.querySelector(".live-ticker");
const events = [
  "PACK_OPEN · Neon Fragment",
  "BURN_EVENT · XP Sync",
  "CAST_POST · Farcaster",
  "SWAP · Base Mesh",
];
let index = 0;
setInterval(() => {
  if (ticker) ticker.textContent = "LIVE " + events[index % events.length];
  index++;
}, 4000);