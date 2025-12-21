import "./forge-terminal.js";
import "./forge-terminal.css";
// modules/forge/index.js
import "./forge.js";
import "./xp-pulse.js"; // XPPulse always first

// 🧩 Delay-load AI panel only after DOM is ready
window.addEventListener("DOMContentLoaded", async () => {
  const { default: injectAIPanel } = await import("./ai-panel-inject.js");
  injectAIPanel();
  console.log("🧠 AI Panel lazy-loaded after HUD render");
});

console.log("⚙️ Forge System Loaded (AI + XP Pulse)");
