document.addEventListener("DOMContentLoaded", () => {
  const trackBtn = document.getElementById("trackBtn");
  const walletInput = document.getElementById("walletSearch");
  const feed = document.getElementById("activityFeed");

  trackBtn.addEventListener("click", () => {
    const addr = walletInput.value.trim();
    if (!addr) return alert("Enter wallet address or ENS");

    feed.innerHTML = "<li>Loading data...</li>";

    // Mock: simulera on-chain data
    setTimeout(() => {
      document.getElementById("xpStat").textContent = Math.floor(Math.random() * 2000);
      document.getElementById("gasStat").textContent = (Math.random() * 50).toFixed(2) + " Gwei";
      document.getElementById("txCount").textContent = Math.floor(Math.random() * 500);
      document.getElementById("tokenCount").textContent = Math.floor(Math.random() * 30);

      const mock = [
        "Minted pack #12 on Zora",
        "Swapped 0.3 ETH for $SPWN",
        "Claimed 20 XP bonus",
        "Opened rare pack (Mythic Tier)"
      ];
      feed.innerHTML = mock.map(e => `<li>${e}</li>`).join("");
    }, 800);
  });
});