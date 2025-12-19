/* ============================================================
   SPAWNENGINE AI-PANEL v4.2
   ============================================================ */
import { XPPulse } from "./xp-pulse.js";

const input = document.getElementById("aiInput");
const sendBtn = document.getElementById("aiSend");
const output = document.getElementById("aiOutput");

sendBtn.addEventListener("click", () => {
  const msg = input.value.trim();
  if (!msg) return;
  const reply = generateResponse(msg);
  output.innerHTML += `<p><strong>You:</strong> ${msg}</p>`;
  setTimeout(() => {
    output.innerHTML += `<p><strong>AI:</strong> ${reply}</p>`;
    XPPulse.trigger(window.innerWidth / 2, window.innerHeight / 2, "#4df2ff");
    toast("AI Pulse triggered.");
  }, 600);
  input.value = "";
  output.scrollTop = output.scrollHeight;
});

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