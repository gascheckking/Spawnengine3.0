// SPAWNENGINE SDK v1.1 — Drop-In Widget Kit
import { ForgeAI } from "./core/forge/forge-ai.js";
import { ForgeUI } from "./core/forge/forge-ui.js";
import { ForgeTerminal } from "./core/forge/forge-terminal.js";
import { MeshSync } from "./core/kernel/mesh-sync.js";
import { SpawnEngine } from "./core/spawn-engine.js";

(function () {
  if (window.SpawnEngine?.__sdkLoaded) return;
  window.SpawnEngine = window.SpawnEngine || {};
  window.SpawnEngine.__sdkLoaded = true;

  const css = `/* SDK styles — klistrade in tidigare */`;
  
  function injectCSS() {
    if (document.getElementById("se-sdk-css")) return;
    const s = document.createElement("style");
    s.id = "se-sdk-css";
    s.textContent = css;
    document.head.appendChild(s);
  }

  // Pool, pick, reveal etc. (du hade full implementation – inget ändrat)
  // ...

  window.SpawnEngine.reveal = openReveal;
  window.SpawnEngine.api = {
    gas: async () => ({ gwei: 0.05, source: "mock" }),
    xp: async () => ({ xp: 1280, streak: 7, source: "mock" }),
  };
  window.SpawnEngine.ready = true;

  console.log("%cSpawnEngine SDK v1.1 loaded", "color:#3cf6ff");
})();

document.addEventListener("DOMContentLoaded", async () => {
  console.log("⚙️ Booting SpawnEngine SDK sequence...");
  await SpawnEngine.init();

  setTimeout(() => {
    ForgeAI.init();
    ForgeUI.init();
    ForgeAI.renderForgePanel("meshFeed");
  }, 4000);

  setTimeout(() => {
    ForgeTerminal.init("forgeTerminal");
    MeshSync.init();
  }, 6000);

  console.log("%c✅ SpawnEngine SDK Fully Online", "color:#3cf6ff;font-weight:bold;");
});