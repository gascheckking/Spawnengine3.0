/* ============================================================
   SPAWNENGINE AI BRIDGE v4.0
   Connects local AI worker + Gemini Cloud
   ============================================================ */
export const AIBridge = {
  worker: null,

  init() {
    this.worker = new Worker("/ai/ai-worker.js");
    this.worker.onmessage = (e) => {
      console.log("🤖 [AI] Response:", e.data);
    };
  },

  ask(query) {
    if (this.worker) this.worker.postMessage(query);
  }
};