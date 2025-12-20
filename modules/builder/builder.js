/* ============================================================
   SPAWNENGINE · Builder Mode UI v1.0
   Deploy modules + manage apps
   ============================================================ */

import { FactoryEngine } from "../../core/factory/factory-engine.js";
import { MiniappRegistry } from "../../core/miniapps/miniapp-registry.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("%c[Builder] Module loaded", "color:#47f7ff");

  const typeInput = document.getElementById("moduleType");
  const configInput = document.getElementById("moduleConfig");
  const deployBtn = document.getElementById("deployModuleBtn");
  const appList = document.getElementById("appList");

  function renderApps() {
    const apps = MiniappRegistry.list();
    appList.innerHTML = apps.length
      ? apps
          .map(
            (app) => `
        <div class="app-card">
          <h4>${app.type}</h4>
          <small>ID: ${app.id}</small><br/>
          <small>Owner: ${app.owner}</small><br/>
          <small>XP: ${app.xp || 0}</small><br/>
          <small>Status: ${app.status}</small>
        </div>`
          )
          .join("")
      : "<p>No modules deployed yet.</p>";
  }

  if (deployBtn) {
    deployBtn.addEventListener("click", async () => {
      const type = typeInput.value.trim();
      const configText = configInput.value.trim();

      if (!type || !configText) return toast("⚠️ Fill all fields!");

      let config;
      try {
        config = JSON.parse(configText);
      } catch (e) {
        return toast("❌ Invalid JSON format");
      }

      try {
        const app = await FactoryEngine.deploy(type, config, "@spawnUser");
        MiniappRegistry.register(app);
        toast(`✅ Deployed ${type} successfully!`);
        renderApps();
      } catch (err) {
        console.error("[Builder] Deploy error:", err);
        toast("❌ Deployment failed");
      }
    });
  }

  renderApps();
});