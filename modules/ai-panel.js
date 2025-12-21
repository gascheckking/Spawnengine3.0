/* ============================================================
   SPAWNENGINE · AI PANEL v3.2
   Mesh AI Assistant — generative suggestions & live responses
   ============================================================ */

import { getInventory } from "../api/pack-actions.js";

/* —— Auto inject CSS (if missing) —— */
if (!document.querySelector('link[href="modules/ai-panel/ai-panel.css"]')) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "modules/ai-panel/ai-panel.css";
  document.head.appendChild(link);
}

/* —— Elements —— */
const panel = document.getElementById("aiPanel");
const logArea = document.getElementById("aiLog");
const input = document.getElementById("aiInput");
const sendBtn = document.getElementById("aiSend");

/* —— Internal State —— */
let aiActive = true;

/* —— Mock AI Core —— */
function meshAIResponse(prompt) {
  const inv = getInventory();
  const responses = [
    `Analyzing your Mesh... Found ${inv.fragments} fragments and ${inv.shards} shards.`,
    "Processing XP trends... Estimated boost: +120 XP if you open 3 packs.",
    "Simulating relic synthesis route... Optimal pattern found.",
    "All systems stable. Pulse Mesh activity is normal ⚡",
  ];
  const random = responses[Math.floor(Math.random() * responses.length)];
  return `${prompt} → ${random}`;
}

/* —— UI Helpers —— */
function addMessage(sender, text) {
  if (!logArea) return;
  const div = document.createElement("div");
  div.className = `msg msg-${sender}`;
  div.textContent = text;
  logArea.appendChild(div);
  logArea.scrollTop = logArea.scrollHeight;
}

/* —— Send Handler —— */
function sendMessage() {
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  addMessage("user", text);
  input.value = "";
  setTimeout(() => {
    const reply = meshAIResponse(text);
    addMessage("ai", reply);
  }, 800);
}

/* —— Toast Helper —— */
function showToast(msg) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.style = `
    position: fixed;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: #4df2ff;
    color: #000;
    padding: 8px 14px;
    border-radius: 8px;
    font-weight: 600;
    font-family: system-ui, sans-serif;
    z-index: 9999;
    box-shadow: 0 0 12px rgba(77,242,255,0.5);
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

/* —— Init —— */
window.addEventListener("DOMContentLoaded", () => {
  if (!panel) return console.warn("AI Panel not found — skipping init");
  addMessage("ai", "🤖 SpawnEngine Mesh AI ready. Type your command below.");
  sendBtn?.addEventListener("click", sendMessage);
  input?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
  console.log("✅ AI Panel initialized (v3.2)");
});