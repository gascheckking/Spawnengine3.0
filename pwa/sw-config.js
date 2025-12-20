/* ============================================================
   SPAWNENGINE PWA SERVICE WORKER REGISTER v3.1
   Offline-first Mesh Shell · XP-safe cache strategy
   ============================================================ */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js");

      console.log("🛰️ [SpawnEngine] Service Worker registered:", registration.scope);

      if (registration.waiting) showUpdatePrompt();

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller)
            showUpdatePrompt();
        });
      });
    } catch (error) {
      console.error("❌ [SpawnEngine] Service Worker registration failed:", error);
    }
  });
}

function showUpdatePrompt() {
  const bar = document.createElement("div");
  bar.innerHTML = `
    <div style="
      position: fixed;
      bottom: 15px;
      left: 50%;
      transform: translateX(-50%);
      background: #0a0e26;
      color: #d7e0ff;
      border: 1px solid #2b2f5c;
      padding: 10px 20px;
      border-radius: 8px;
      font-family: system-ui, sans-serif;
      z-index: 9999;
      box-shadow: 0 0 12px #1a1f45;">
      🔄 Mesh update available 
      <button id="updateApp" style="
        margin-left: 12px;
        padding: 6px 12px;
        background: #4df2ff;
        color: #000;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      ">Reload</button>
    </div>
  `;
  document.body.appendChild(bar);
  document.getElementById("updateApp").onclick = () => window.location.reload(true);
}

window.addEventListener("offline", () => {
  console.warn("📡 [SpawnEngine] Lost connection — switching to cached mode.");
});

window.addEventListener("online", () => {
  console.log("🌐 [SpawnEngine] Reconnected to Mesh Layer.");
});