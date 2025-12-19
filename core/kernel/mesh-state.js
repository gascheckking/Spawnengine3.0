/* ============================================================
   SPAWNENGINE · MeshState v1.0
   Global system state manager (read-only sync)
   ============================================================ */

import { MeshKernel } from "./mesh-kernel.js";
import { AutoBuilder } from "./autobuilder.js";

export const MeshState = {
  summary() {
    const kernel = MeshKernel.state;
    const proposals = AutoBuilder.getProposals();

    return {
      uptime: kernel.uptime,
      modules: Object.keys(kernel.modules).length,
      totalEvents: kernel.totalEvents,
      lastUpdate: new Date(kernel.lastUpdate).toLocaleString(),
      recentInsights: MeshKernel.getInsights(),
      proposals,
    };
  },

  renderDashboard(containerId = "meshFeed") {
    const el = document.getElementById(containerId);
    if (!el) return;

    const data = this.summary();
    el.innerHTML = `
      <div class="feed-item">⏱ Uptime: ${data.uptime}s</div>
      <div class="feed-item">🧩 Active Modules: ${data.modules}</div>
      <div class="feed-item">📊 Events Logged: ${data.totalEvents}</div>
      <div class="feed-item">🕓 Last Update: ${data.lastUpdate}</div>
      <div class="feed-item">💡 Proposals:</div>
      ${data.proposals.map(p => `<div class="feed-sub">• ${p.title}</div>`).join("")}
    `;
  },
};