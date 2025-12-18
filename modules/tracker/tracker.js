document.addEventListener("DOMContentLoaded", () => {
  const walletBtn = document.getElementById("walletBtn");
  const feed = document.getElementById("activityFeed");
  const trackWallet = document.getElementById("trackWallet");
  const input = document.getElementById("walletInput");
  const profile = document.getElementById("profilePanel");

  walletBtn.addEventListener("click", () => alert("Wallet connect coming soon"));

  document.getElementById("openProfile").onclick = () => profile.classList.remove("hidden");
  document.getElementById("closeProfile").onclick = () => profile.classList.add("hidden");

  trackWallet.addEventListener("click", () => {
    const addr = input.value.trim();
    if (!addr) return alert("Enter wallet or ENS");
    feed.innerHTML = "<p>Loading...</p>";
    setTimeout(() => {
      const mock = [
        `${addr.slice(0,6)} swapped 0.3 ETH on Base`,
        `${addr.slice(0,6)} minted pack #9`,
        `${addr.slice(0,6)} earned +120 XP`,
      ];
      feed.innerHTML = mock.map(x => `<p>${x}</p>`).join("");
    }, 800);
  });
});