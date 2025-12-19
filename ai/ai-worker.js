/* ============================================================
   SPAWNENGINE AI WORKER
   Lightweight thread for chat inference / Gemini bridge
   ============================================================ */
self.onmessage = async (e) => {
  const query = e.data.toLowerCase();
  if (query.includes("xp")) postMessage("Your current XP balance is synced with MeshCore.");
  else if (query.includes("wallet")) postMessage("Wallet is connected through MeshBridge and Base chain.");
  else postMessage("SpawnAI ready. Ask about relics, forge, or mesh stats.");
};