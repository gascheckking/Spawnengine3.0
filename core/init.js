import { ForgeUI } from "./forge-ui.js";
import { ForgeAI } from "./forge-ai.js";

document.addEventListener("DOMContentLoaded", async () => {
  await MeshCore.init();
  MeshBridge.init();
  ForgeAI.init();
  ForgeUI.init();
  console.log("%c✅ SpawnVerse Forge System Active", "color:#4df2ff");
});

// ✦ Gör tillgängligt globalt
window.ForgeAI = ForgeAI;
window.ForgeUI = ForgeUI;