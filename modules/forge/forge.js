// /modules/forge/forge.js
//——— CREATOR FORGE CORE ——//
//  Handles deploys, XP flow, and Mesh log integration.

(function () {
  const tabs = document.querySelectorAll(".forge-tab");
  const sections = document.querySelectorAll(".forge-section");
  const logEl = document.getElementById("forgeLog");
  const toastEl = document.getElementById("forgeToast");

  //——— STATE ——//
  let currentTab = "token";
  let currentXP = 1575;

  //——— HELPERS ——//
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 1500);
  }

  function log(message, color = "#9ef7ff") {
    const li = document.createElement("li");
    li.innerHTML = `<span style="color:${color}">${new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}</span> · ${message}`;
    logEl.prepend(li);
    while (logEl.children.length > 40) logEl.removeChild(logEl.lastChild);
  }

  function addXP(amount) {
    currentXP += amount;
    log(`+${amount} XP added (total ${currentXP})`, "#79ffb6");
    if (window.SpawnEngine?.Arena) {
      // sync leaderboard if Arena active
      console.log("[Forge→Arena] XP sync:", currentXP);
    }
  }

  //——— TAB SWITCH ——//
  tabs.forEach((btn) =>
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentTab = btn.dataset.tab;
      sections.forEach((sec) => {
        sec.classList.toggle("hidden", !sec.id.includes(currentTab));
      });
      log(`Switched to ${currentTab} creator`, "#b9ff7a");
    })
  );

  //——— TOKEN DEPLOY ——//
  const tokenForm = document.getElementById("forgeTokenForm");
  if (tokenForm) {
    tokenForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = tokenForm.querySelector("#tokenName").value.trim();
      const sym = tokenForm.querySelector("#tokenSymbol").value.trim();
      const supply = tokenForm.querySelector("#tokenSupply").value.trim();
      if (!name || !sym) return showToast("Fill all fields!");
      showToast("Deploying token …");
      log(`🪙 Deploying ${name} (${sym}) with supply ${supply}`);
      setTimeout(() => {
        log(`✅ Token ${name} deployed to Mesh Protocol`, "#79ffb6");
        addXP(100);
        showToast(`${name} token live!`);
      }, 1200);
    });
  }

  //——— PACK DEPLOY ——//
  const packForm = document.getElementById("forgePackForm");
  if (packForm) {
    packForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = packForm.querySelector("#packName").value.trim();
      const rarity = packForm.querySelector("#packRarity").value.trim() || "70,20,8,2";
      const price = packForm.querySelector("#packPrice").value.trim();
      if (!name || !price) return showToast("Missing name or price");
      showToast("Building pack mesh …");
      log(`🎴 Deploying pack "${name}" [rates ${rarity}] @ ${price} ETH`);
      setTimeout(() => {
        log(`✅ Pack "${name}" registered in Mesh`, "#b9ff7a");
        addXP(150);
        showToast(`Pack "${name}" deployed`);
      }, 1500);
    });
  }

  //——— UTILITY DEPLOY ——//
  const utilForm = document.getElementById("forgeUtilityForm");
  if (utilForm) {
    utilForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const type = utilForm.querySelector("#utilityType").value;
      const desc = utilForm.querySelector("#utilityDesc").value.trim();
      showToast("Creating module …");
      log(`⚙️ Deploying ${type} module: ${desc || "No description"}`);
      setTimeout(() => {
        log(`✅ ${type} module live and linked to Mesh`, "#b9ff7a");
        addXP(200);
        showToast(`${type} module deployed`);
      }, 1700);
    });
  }

  //——— INIT ——//
  log("Creator Forge loaded (v3.1 Reforge)");
  showToast("Forge ready");

  //——— EXPORT ——//
  window.SpawnEngine = window.SpawnEngine || {};
  window.SpawnEngine.Forge = { addXP, log };
})();