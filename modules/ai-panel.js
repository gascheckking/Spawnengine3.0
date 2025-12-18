/* ============================================================
   SpawnEngine AI Panel v3.1
   Mesh AI Assistant – handles generative suggestions & actions
   ============================================================ */

import { getInventory } from "../api/pack-actions.js";

/* —— Elements —— */
const panel = document.getElementById("aiPanel");
const logArea = document.getElementById("aiLog");
const input = document.getElementById("aiInput");
const sendBtn = document.getElementById("aiSend");

/* —— Internal State —— */
let aiActive = true;

/* —— Mock AI Core —— */
function meshAIResponse(prompt) {
  const responses = [
    `Analyzing your Mesh... Found ${getInventory().fragments} fragments and ${getInventory().shards} shards.`,
    "Processing XP trends... Estimated boost: +120 XP if you open 3 packs.",
    "Simulating relic synthesis route... Optimal pattern found.",
    "All systems stable. Pulse Mesh activity is normal ⚡",
  ];
  const random = responses[Math.floor(Math.random() * responses.length)];
  return `${prompt} → ${random}`;
}

/* —— UI Rendering —— */
function addMessage(sender, text) {
  const div = document.createElement("div");
  div.className = `msg msg-${sender}`;
  div.textContent = text;
  logArea.appendChild(div);
  logArea.scrollTop = logArea.scrollHeight;
}

/* —— Send Handler —— */
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  addMessage("user", text);
  input.value = "";
  setTimeout(() => {
    const reply = meshAIResponse(text);
    addMessage("ai", reply);
  }, 800);
}

/* —— Init —— */
window.addEventListener("DOMContentLoaded", () => {
  if (!panel) return;
  addMessage("ai", "SpawnEngine Mesh AI ready. Type your command below.");
  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
});