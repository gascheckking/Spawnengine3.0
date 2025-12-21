/* ============================================================
   SPAWNENGINE · AI Config v1.0
   Holds endpoints, modes & tokens for AI Bridge (mock)
   ============================================================ */

export const AIConfig = {
  mode: "local", // "local" | "gemini"
  geminiEndpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
  apiKey: "YOUR_GEMINI_API_KEY_HERE",

  getActiveMode() {
    console.log(`⚙️ [AIConfig] Active mode: ${this.mode}`);
    return this.mode;
  }
};

if (typeof window !== "undefined") window.AIConfig = AIConfig;