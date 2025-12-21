/* ============================================================
   SPAWNENGINE · Kernel Init v1.0
   Bootstraps Kernel, Sync, and Autonomous Loops
   ============================================================ */

import { MeshKernel } from "./mesh-kernel.js";
import { AutoBuilder } from "./autobuilder.js";
import { EventLoop } from "./event-loop.js";
import { MeshState } from "./mesh-state.js";
import { MeshSync } from "./mesh-sync.js";

/* —— KERNEL BOOT —— */
window.addEventListener("DOMContentLoaded", () => {
  console.log("%c🧠 Booting SpawnKernel Systems...", "color:#b9ff7a");

  // Starta kärnkomponenter
  MeshKernel.init();
  AutoBuilder.init();
  EventLoop.start();
  MeshSync.init();

  // Vänta lite innan dashboard-render
  setTimeout(() => {
    MeshState.renderDashboard("meshFeed");
  }, 2000);

  // Visuell feedback
  if (window.spawnMeshPulse) window.spawnMeshPulse("#4df2ff");

  console.log("%c✅ Kernel systems online", "color:#4df2ff");
});