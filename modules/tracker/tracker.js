/* ============================================================
   SPAWNENGINE · TRACKER v3.3
   Wallet Activity & Mesh Stats Dashboard
   ============================================================ */

window.addEventListener("DOMContentLoaded", () => {
  const walletBtn = document.getElementById("walletBtn");
  const feed = document.getElementById("activityFeed");
  const trackWallet = document.getElementById("trackWallet");
  const input = document.getElementById("walletInput");
  const profile = document.getElementById("profilePanel");
  const walletAddr = document.getElementById("walletAddr");
  const xpStat = document.getElementById("xpStat");
  const spnStat = document.getElementById("spnStat");
  const txStat = document.getElementById("txStat");

  /* — Wallet Connect Mock — */
  walletBtn.addEventListener("click", () => {
    const mockAddr = "0x" + Math.random().toString(16).substring(2, 8) + "C0DE";
    walletAddr.textContent = mockAddr;
    walletBtn.textContent = "Connected";
    showToast("Wallet connected");
  });

  /* — Profile Panel — */
  document.getElementById("openProfile").onclick = () => profile.classList.remove("hidden");
  document.getElementById("closeProfile").onclick = () => profile.classList.add("hidden");

  /* — Tracker Feed — */
  trackWallet.addEventListener("click", () => {
    const addr = input.value.trim();
    if (!addr) return showToast("Enter wallet or ENS first");
    feed.innerHTML = "<p>Loading...</p>";

    setTimeout(() => {
      const mock = [
        `${addr.slice(0, 6)} swapped 0.3 ETH on Base`,
        `${addr.slice(0, 6)} minted pack #9`,
        `${addr.slice(0, 6)} earned +120 XP`,
      ];
      feed.innerHTML = mock.map((x) => `<p>${x}</p>`).join("");
      xpStat.textContent = (parseInt(xpStat.textContent) + 120).toString();
      spnStat.textContent = (Math.random() * 0.01).toFixed(3);
      txStat.textContent = (Math.floor(Math.random() * 50) + 1).toString();
      showToast("Tracker updated");
    }, 900);
  });

  /* — Theme Toggle — */
  document.getElementById("toggleTheme").addEventListener("click", () => {
    const dark = document.body.dataset.theme !== "light";
    document.body.dataset.theme = dark ? "light" : "dark";
    showToast(`Theme set to ${dark ? "light" : "dark"}`);
  });

  /* — Toast Helper — */
  function showToast(msg) {
    const toast = document.createElement("div");
    toast.textContent = msg;
    toast.style = `
      position: fixed;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: #4df2ff;
      color: #000;
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 600;
      font-family: system-ui, sans-serif;
      z-index: 9999;
      box-shadow: 0 0 12px rgba(77,242,255,0.5);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  console.log("📡 Tracker module loaded (v3.3)");
});