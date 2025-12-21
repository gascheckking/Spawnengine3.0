/* ============================================================
   SPAWNENGINE AI-PANEL v4.4 — Safe External Init
   ============================================================ */
import { XPPulse } from "./xp-pulse.js";

export function initAIPanel() {
  const input = document.getElementById("aiInput");
  const sendBtn = document.getElementById("aiSend");
  const output = document.getElementById("aiOutput");

  if (!input || !sendBtn || !output) {
    console.warn("⚠️ AI Panel elements missing at init");
    return;
  }

  function sendMessage() {
    const msg = input.value.trim();
    if (!msg) return;

    const reply = generateResponse(msg);
    output.insertAdjacentHTML("beforeend", `<p><strong>You:</strong> ${msg}</p>`);

    setTimeout(() => {
      output.insertAdjacentHTML("beforeend", `<p><strong>AI:</strong> ${reply}</p>`);
      XPPulse.trigger(window.innerWidth / 2, window.innerHeight / 2, "#4df2ff");
      window.toast?.("AI Pulse triggered");
      output.scrollTop = output.scrollHeight;
    }, 600);

    input.value = "";
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  console.log("✅ AI Panel initialized successfully");
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