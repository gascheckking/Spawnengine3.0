/* ============================================================
   SPAWNENGINE AI-PANEL v4.3 — Async Fix
   ============================================================ */
import { XPPulse } from "./xp-pulse.js";

function initAIPanel() {
  const input = document.getElementById("aiInput");
  const sendBtn = document.getElementById("aiSend");
  const output = document.getElementById("aiOutput");

  if (!input || !sendBtn || !output) return; // still not loaded yet

  sendBtn.addEventListener("click", () => {
    const msg = input.value.trim();
    if (!msg) return;

    const reply = generateResponse(msg);

    output.innerHTML += `<p><strong>You:</strong> ${msg}</p>`;
    setTimeout(() => {
      output.innerHTML += `<p><strong>AI:</strong> ${reply}</p>`;
      XPPulse.trigger(window.innerWidth / 2, window.innerHeight / 2, "#4df2ff");
      if (window.toast) toast("AI Pulse triggered");
    }, 600);

    input.value = "";
    output.scrollTop = output.scrollHeight;
  });
}

function generateResponse(msg) {
  const responses = [
    "Processing your command in Mesh Core...",
    "Building sub-node...",
    "Forging XP pathways...",
    "Deploying data relay...",
    "Executing onchain mutation...",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

/* 🔁 Retry init until panel exists */
let retries = 0;
const interval = setInterval(() => {
  if (document.getElementById("aiPanel")) {
    clearInterval(interval);
    initAIPanel();
    console.log("🤖 AI Panel initialized");
  } else if (retries++ > 20) {
    clearInterval(interval);
    console.warn("⚠️ AI Panel not found after 20 attempts");
  }
}, 250);