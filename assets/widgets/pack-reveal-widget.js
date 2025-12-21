/* ============================================================
   SPAWNENGINE · Pack Reveal Controller v3.3
   Connects Reveal Widget ⇆ MeshCore ⇆ SpawnChain ⇆ Visualizer
   ============================================================ */

export const PackReveal = {
  init() {
    this.img = document.getElementById("packImage");
    this.btn = document.getElementById("packRevealBtn");
    this.status = document.getElementById("packStatus");
    this.title = document.getElementById("packTitle");
    this.overlay = document.querySelector(".pack-overlay");

    if (!this.btn) return console.warn("⚠️ PackReveal widget not found");
    this.bind();
    console.log("🎁 PackReveal initialized");
  },

  bind() {
    this.btn.addEventListener("click", () => this.reveal());
  },

  async reveal() {
    this.btn.disabled = true;
    this.status.textContent = "Opening pack...";
    this.overlay.style.opacity = "0.5";

    this.playSound("/assets/sounds/reveal.mp3");

    // Simulate reveal delay
    await new Promise((r) => setTimeout(r, 2200));

    const reward = this.getReward();
    this.status.textContent = `You found: ${reward.name}`;
    this.title.textContent = reward.title;
    this.img.classList.add("pack-revealed");

    this.playSound("/assets/sounds/success.mp3");

    if (window.MeshVisualizer) window.MeshVisualizer.trigger("mint");
    if (window.MeshCore?.gainXP) window.MeshCore.gainXP(50, "Pack Reveal");
    if (window.SpawnChain?.register) {
      window.SpawnChain.register({
        id: "PACK-" + Date.now(),
        name: reward.title,
        code: "PackRevealReward",
      });
    }

    console.log(`🎉 [PackReveal] ${reward.title} unlocked`);
  },

  getReward() {
    const rewards = [
      { name: "Relic Fragment", title: "⚡ Relic Fragment" },
      { name: "Mesh Upgrade", title: "🧠 Mesh Upgrade" },
      { name: "XP Boost", title: "💥 XP Surge" },
      { name: "Spawn Crystal", title: "💎 Spawn Crystal" },
      { name: "AI Core Part", title: "🔩 AI Core Part" },
    ];
    return rewards[Math.floor(Math.random() * rewards.length)];
  },

  playSound(path) {
    const audio = new Audio(path);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  },
};

/* —— Global Exposure —— */
if (typeof window !== "undefined") {
  window.PackReveal = PackReveal;
  setTimeout(() => PackReveal.init(), 800);
}