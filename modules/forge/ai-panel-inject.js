/* ============================================================
   SPAWNENGINE · AI PANEL INJECTOR v4.4 — Lazy-safe version
   ============================================================ */
import { initAIPanel } from "./ai-panel.js";
import "./xp-pulse.js";

export default async function injectAIPanel() {
  try {
    const panel = document.createElement("div");
    const res = await fetch("modules/forge/ai-panel.html");
    const html = await res.text();
    panel.innerHTML = html;
    document.body.appendChild(panel);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "modules/forge/ai-panel.css";
    document.head.appendChild(link);

    // 🧠 Init AFTER append
    requestAnimationFrame(() => {
      initAIPanel();
      console.log("🤖 AI Panel injected + initialized");
    });
  } catch (err) {
    console.error("❌ AI Panel injection failed:", err);
  }
}