/* ============================================================
   SPAWNENGINE CREATOR FORGE CORE v3.1
   ============================================================ */
(() => {
  const tabs = document.querySelectorAll(".forge-tab");
  const sections = document.querySelectorAll(".forge-section");
  const logEl = document.getElementById("forgeLog");
  const toastEl = document.getElementById("forgeToast");

  let currentTab = "token";
  let currentXP = 1575;

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 1500);
  }

  function log(message, color = "#9ef7ff") {
    if (!logEl) return;
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
    if (window.SpawnEngine?.Arena) console.log("[Forge→Arena] XP sync:", currentXP);
  }

  tabs.forEach((btn) =>
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentTab = btn.dataset.tab;
      sections.forEach((sec) => sec.classList.toggle("hidden", !sec.id.includes(currentTab)));
      log(`Switched to ${currentTab} creator`, "#b9ff7a");
    })
  );

  //——— TOKEN ——//
  const tokenForm = document.getElementById("forgeTokenForm");
  tokenForm?.addEventListener("submit", (e) => {
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

  //——— PACK ——//
  const packForm = document.getElementById("forgePackForm");
  packForm?.addEventListener("submit", (e) => {
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

  //——— UTILITY ——//
  const utilForm = document.getElementById("forgeUtilityForm");
  utilForm?.addEventListener("submit", (e) => {
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

  log("Creator Forge loaded (v3.1 Reforge)");
  showToast("Forge ready");

  window.SpawnEngine = window.SpawnEngine || {};
  window.SpawnEngine.Forge = { addXP, log };
})();