/* ============================================================
   SPAWNENGINE · Tracker Miniapp v1.2
   Mesh Tracker — Live XP / Activity Feed Miniapp
   Built on MiniappTemplate (v1.1)
   ============================================================ */

import { MiniappTemplate } from "./miniapp-template.js";
import { MeshCore } from "../mesh-core.js";
import { MeshVisualizer } from "../visuals/mesh-visualizer.js";

export class TrackerMiniapp extends MiniappTemplate {
  constructor() {
    super({
      id: "miniapp-tracker",
      type: "tracker",
      name: "Mesh Tracker",
      icon: "📡",
      version: "1.2",
      config: { refreshInterval: 6000 },
    });

    this.interval = null;
    this.attachTo("trackerView");
    this.startTracking();
  }

  /* —— START TRACKING —— */
  startTracking() {
    this.interval = setInterval(() => {
      const xp = MeshCore.state?.xp || 0;
      const recent = MeshCore.state?.events?.slice(-1)[0] || "Idle...";
      this.updateState("xp", xp);
      this.updateState("lastEvent", recent);

      // Pulse + feed update
      MeshVisualizer.trigger("xp_gain");
      this.post(`XP: ${xp} — ${recent}`);
    }, this.config.refreshInterval);
  }

  /* —— MANUAL REFRESH —— */
  refresh() {
    const xp = MeshCore.state?.xp || 0;
    const recent = MeshCore.state?.events?.slice(-1)[0] || "No events";
    this.addXP(2, "Manual refresh");
    this.post(`Manual check → XP: ${xp} (${recent})`);
    MeshVisualizer.trigger("xp_gain");
  }

  /* —— RENDER UI —— */
  attachTo(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return console.warn(`⚠️ Tracker container ${containerId} missing`);

    el.innerHTML = `
      <div class="tracker-card">
        <h3>${this.icon} ${this.name}</h3>
        <p id="trackerXP">XP: 0</p>
        <p id="trackerEvent">Latest: —</p>
        <button id="trackerRefresh">Refresh</button>
      </div>
    `;

    const refreshBtn = el.querySelector("#trackerRefresh");
    refreshBtn.addEventListener("click", () => this.refresh());
  }

  /* —— STOP & DESTROY —— */
  destroy() {
    if (this.interval) clearInterval(this.interval);
    super.destroy();
  }
}

/* —— GLOBAL ACCESS —— */
if (typeof window !== "undefined") {
  window.TrackerMiniapp = new TrackerMiniapp();
  console.log("%c📡 TrackerMiniapp active", "color:#4df2ff");
}