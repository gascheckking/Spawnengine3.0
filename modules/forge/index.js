// ============================================================
// SPAWNENGINE · FORGE MODULE INDEX v4.6 — Stable ESM Version
// ============================================================

// 🧩 Core Forge systems
import "./forge.js";
import "./forge-terminal.js";
import "./forge-terminal.css";

// 🌌 Visual systems
import "./xp-pulse.js"; // Must load before AI uses it

// 🧠 Lazy-load AI panel only after HUD DOM is ready
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const { injectAIPanel } = await import("./ai-panel-inject.js");
    await injectAIPanel();
    console.log("🧠 AI Panel lazy-loaded after HUD render");
  } catch (err) {
    console.error("❌ Failed to lazy-load AI Panel:", err);
  }
});

console.log("⚙️ Forge System Loaded (AI + XP Pulse)");