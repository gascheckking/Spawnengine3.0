/* ============================================================
   SPAWNENGINE · AI PANEL INJECTOR v4.6 — Universal ESM Safe
   ============================================================ */
import { initAIPanel } from "./ai-panel.js";
import "./xp-pulse.js";

export async function injectAIPanel() {
  // Säkerställ att DOM är redo
  if (document.readyState === "loading") {
    await new Promise((res) => document.addEventListener("DOMContentLoaded", res));
  }

  try {
    const panel = document.createElement("div");

    // Ladda HTML
    const res = await fetch("modules/forge/ai-panel.html");
    const html = await res.text();
    panel.innerHTML = html;
    document.body.appendChild(panel);

    // Ladda CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "modules/forge/ai-panel.css";
    document.head.appendChild(link);

    // Initiera efter att panelen lagts till
    requestAnimationFrame(() => {
      initAIPanel();
      console.log("🤖 AI Panel injected + initialized");
    });
  } catch (err) {
    console.error("❌ AI Panel injection failed:", err);
  }
}