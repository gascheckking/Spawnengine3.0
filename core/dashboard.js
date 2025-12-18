// core/dashboard.js
import { meshCore } from "./MeshCore.js";

function initDashboard() {
  const xpEl = document.getElementById("dash-xp");
  const spawnEl = document.getElementById("dash-spawn");
  const feedEl = document.getElementById("dash-feed");

  if (!xpEl || !spawnEl || !feedEl) return;

  // Startvärden
  const stats = meshCore.getStats();
  xpEl.innerText = stats.xp;
  spawnEl.innerText = stats.spawn;

  // XP-uppdatering
  meshCore.on("xpUpdate", (newXp) => {
    xpEl.innerText = newXp;
    xpEl.style.color = "#b9ff7a";
    setTimeout(() => (xpEl.style.color = "#3cf6ff"), 500);
  });

  // Feeduppdatering
  meshCore.on("feedUpdate", (eventMsg) => {
    const item = document.createElement("div");
    item.className = "se-feed-item";
    item.innerText = `> ${eventMsg}`;
    feedEl.prepend(item);
    if (feedEl.children.length > 12) feedEl.removeChild(feedEl.lastChild);
  });

  console.log("%c[Dashboard] Ready", "color:#3cf6ff");
}

document.addEventListener("DOMContentLoaded", initDashboard);