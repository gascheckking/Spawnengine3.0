/* ============================================================
   SPAWNENGINE SDK v1.1 — Drop-In Widget Kit (Final Build)
   "Roblox for Onchain" · Widget Module (Pack Reveal + Forge)
   ============================================================ */

import { ForgeAI } from "./core/forge/forge-ai.js";
import { ForgeUI } from "./core/forge/forge-ui.js";
import { ForgeTerminal } from "./core/forge/forge-terminal.js";
import { MeshSync } from "./core/kernel/mesh-sync.js";
import { SpawnEngine } from "./core/spawn-engine.js";

/* —— CORE SDK SELF-INJECT —— */
(function () {
  if (window.SpawnEngine?.__sdkLoaded) return;
  window.SpawnEngine = window.SpawnEngine || {};
  window.SpawnEngine.__sdkLoaded = true;

  /* —— STYLE INJECTION —— */
  const css = `
  .se-reveal-backdrop{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:18px}
  .se-reveal{width:min(520px,92vw);border-radius:18px;background:linear-gradient(180deg,rgba(10,12,26,.98),rgba(5,6,14,.98));border:1px solid rgba(140,184,255,.55);box-shadow:0 30px 70px rgba(0,0,0,.75);overflow:hidden;animation:seFadeIn .25s ease}
  .se-reveal-top{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(120,150,255,.18)}
  .se-reveal-title{font-size:13px;font-weight:700;letter-spacing:.02em}
  .se-reveal-close{width:32px;height:32px;border-radius:999px;border:1px solid rgba(160,210,255,.45);background:rgba(8,12,32,.92);color:#f3f6ff;cursor:pointer}
  .se-reveal-stage{padding:14px}
  .se-track{position:relative;height:92px;border-radius:14px;background:rgba(10,14,38,.75);border:1px solid rgba(124,166,254,.35);overflow:hidden}
  .se-pointer{position:absolute;top:0;bottom:0;left:50%;width:0;transform:translateX(-50%);border-left:2px solid rgba(0,255,192,.9);filter:drop-shadow(0 0 10px rgba(0,255,192,.6))}
  .se-items{position:absolute;top:10px;left:0;display:flex;gap:10px;will-change:transform}
  .se-item{width:82px;height:72px;border-radius:12px;flex:0 0 auto;display:flex;flex-direction:column;justify-content:center;align-items:center;border:1px solid rgba(120,150,255,.22);background:linear-gradient(135deg,rgba(16,20,46,.92),rgba(6,8,18,.92));transition:transform .2s ease}
  .se-item b{font-size:11px}
  .se-item small{font-size:10px;opacity:.72}
  .se-item:hover{transform:scale(1.05)}
  .se-rarity-common{border-color:rgba(160,180,255,.25)}
  .se-rarity-rare{border-color:rgba(0,255,192,.55);box-shadow:0 0 18px rgba(0,255,192,.18) inset}
  .se-rarity-epic{border-color:rgba(179,107,255,.65);box-shadow:0 0 18px rgba(179,107,255,.18) inset}
  .se-rarity-legendary{border-color:rgba(255,200,87,.75);box-shadow:0 0 22px rgba(255,200,87,.18) inset}
  .se-reveal-actions{display:flex;gap:10px;padding:12px 14px;border-top:1px solid rgba(120,150,255,.18)}
  .se-btn{flex:1;border-radius:999px;padding:10px 12px;font-size:12px;font-weight:700;cursor:pointer}
  .se-btn-primary{background:linear-gradient(135deg,#3cf6ff,#b9ff7a);color:#050510}
  .se-btn-ghost{background:rgba(8,12,32,.92);border:1px solid rgba(136,176,255,.6);color:#d3deff}
  .se-result{margin-top:10px;padding:10px 12px;border-radius:14px;background:rgba(9,12,34,.92);border:1px solid rgba(124,168,250,.5)}
  .se-result h3{margin:0 0 6px;font-size:12px}
  .se-chip{display:inline-flex;gap:6px;align-items:center;border-radius:999px;padding:4px 10px;font-size:11px;border:1px solid rgba(0,255,192,.35);background:linear-gradient(120deg,rgba(0,255,192,.14),rgba(0,163,255,.08));color:#b9fffb}
  @keyframes seFadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  `;

  function injectCSS() {
    if (document.getElementById("se-sdk-css")) return;
    const s = document.createElement("style");
    s.id = "se-sdk-css";
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* —— POOL / RARITY —— */
  const defaultPool = [
    { name: "Fragment", rarity: "Common" },
    { name: "Chip", rarity: "Common" },
    { name: "Boost", rarity: "Rare" },
    { name: "Relic", rarity: "Epic" },
    { name: "Mythic", rarity: "Legendary" },
  ];

  function rarityClass(r) {
    const x = String(r || "").toLowerCase();
    if (x.includes("legend")) return "se-rarity-legendary";
    if (x.includes("epic")) return "se-rarity-epic";
    if (x.includes("rare")) return "se-rarity-rare";
    return "se-rarity-common";
  }

  function weightedPick(pool) {
    const weights = pool.map((p) => {
      const r = String(p.rarity || "").toLowerCase();
      if (r.includes("legend")) return 2;
      if (r.includes("epic")) return 8;
      if (r.includes("rare")) return 20;
      return 70;
    });
    const total = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return pool[i];
    }
    return pool[0];
  }

  /* —— REVEAL MODAL —— */
  function openReveal(opts = {}) {
    injectCSS();
    if (document.querySelector(".se-reveal-backdrop")) return;
    const pool = Array.isArray(opts.pool) && opts.pool.length ? opts.pool : defaultPool;
    const title = opts.title || "SpawnEngine Reveal";
    const onReveal = typeof opts.onReveal === "function" ? opts.onReveal : () => {};

    const backdrop = document.createElement("div");
    backdrop.className = "se-reveal-backdrop";

    const modal = document.createElement("div");
    modal.className = "se-reveal";
    modal.innerHTML = `
      <div class="se-reveal-top">
        <div class="se-reveal-title">${title}</div>
        <button class="se-reveal-close" aria-label="Close">✕</button>
      </div>
      <div class="se-reveal-stage">
        <div class="se-track">
          <div class="se-pointer"></div>
          <div class="se-items" id="seItems"></div>
        </div>
        <div class="se-result" id="seResult" style="display:none"></div>
      </div>
      <div class="se-reveal-actions">
        <button class="se-btn se-btn-ghost" id="seReroll">Reroll</button>
        <button class="se-btn se-btn-primary" id="seSpin">Open</button>
      </div>
    `;
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const close = () => backdrop.remove();
    backdrop.addEventListener("click", (e) => e.target === backdrop && close());
    modal.querySelector(".se-reveal-close").addEventListener("click", close);
    document.addEventListener("keydown", (e) => e.key === "Escape" && close(), { once: true });

    const itemsEl = modal.querySelector("#seItems");
    const resultEl = modal.querySelector("#seResult");

    function buildStrip() {
      itemsEl.innerHTML = "";
      for (let i = 0; i < 30; i++) {
        const p = pool[i % pool.length];
        const d = document.createElement("div");
        d.className = `se-item ${rarityClass(p.rarity)}`;
        d.innerHTML = `<b>${p.name}</b><small>${p.rarity}</small>`;
        itemsEl.appendChild(d);
      }
      itemsEl.style.transform = "translateX(0px)";
      resultEl.style.display = "none";
    }

    buildStrip();
    let spinning = false;

    function spin() {
      if (spinning) return;
      spinning = true;
      resultEl.style.display = "none";
      const win = weightedPick(pool);
      const winIndex = 24 + Math.floor(Math.random() * 4);
      const nodes = Array.from(itemsEl.children);
      nodes[winIndex].querySelector("b").textContent = win.name;
      nodes[winIndex].querySelector("small").textContent = win.rarity;
      nodes[winIndex].className = `se-item ${rarityClass(win.rarity)}`;
      const itemW = 82, gap = 10, totalW = itemW + gap;
      const targetX = (winIndex * totalW) - (modal.clientWidth / 2) + (itemW / 2) - 18;
      itemsEl.style.transition = "transform 2.4s cubic-bezier(.08,.9,.08,1)";
      itemsEl.style.transform = `translateX(${-targetX}px)`;
      setTimeout(() => {
        resultEl.style.display = "block";
        resultEl.innerHTML = `
          <h3>Reveal complete</h3>
          <div class="se-chip">✅ <b>${win.name}</b> · <span>${win.rarity}</span></div>
        `;
        spinning = false;
        onReveal(win);
      }, 2800);
    }

    modal.querySelector("#seSpin").addEventListener("click", spin);
    modal.querySelector("#seReroll").addEventListener("click", () => {
      if (!spinning) buildStrip();
    });

    if (opts.autoOpen) setTimeout(spin, 250);
  }

  /* —— PUBLIC API —— */
  window.SpawnEngine.reveal = openReveal;
  window.SpawnEngine.api = {
    gas: async () => ({ gwei: 0.05, source: "mock" }),
    xp: async () => ({ xp: 1280, streak: 7, source: "mock" }),
  };
  window.SpawnEngine.ready = true;

  console.log("%cSpawnEngine SDK v1.1 loaded", "color:#3cf6ff");
})();

/* ============================================================
   FORGE & CORE INIT SEQUENCE
   ============================================================ */
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