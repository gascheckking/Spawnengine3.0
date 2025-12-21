/* ============================================================
   SPAWNENGINE AI PANEL INJECTOR v4.2
   ============================================================ */
import "./ai-panel.js";
import "./xp-pulse.js";

const panel = document.createElement("div");
fetch("modules/forge/ai-panel.html")
  .then((r) => r.text())
  .then((html) => {
    panel.innerHTML = html;
    document.body.appendChild(panel);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "modules/forge/ai-panel.css";
    document.head.appendChild(link);
  });