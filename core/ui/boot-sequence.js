// ============================================================
// 🧠 SPAWNENGINE BOOT SEQUENCE v1.3 — Dark Mythic Edition
// ============================================================

const BootSequence = {
  active: false,

  async init() {
    if (this.active || document.getElementById("bootOverlay")) return;
    this.active = true;

    console.log("%c🚀 SpawnEngine BootSequence v1.3 — Engaging Mythic Mode", "color:#4df2ff; font-weight:bold");

    const overlay = document.createElement("div");
    overlay.id = "bootOverlay";
    overlay.innerHTML = `
      <div class="boot-center">
        <img src="assets/logo.png" class="boot-logo pulse" alt="SpawnEngine Logo"/>
        <div class="boot-text">SPAWNENGINE INITIALIZING</div>
        <div class="boot-subtitle">Mesh Kernel · Nebula Forge · Dark Mythic Protocol</div>
        <div class="boot-bar"><div class="boot-bar-fill"></div></div>
      </div>`;
    document.body.appendChild(overlay);

    try {
      const audio = new Audio("assets/sounds/reveal.mp3");
      audio.volume = 0.35;
      audio.play().catch(() => console.log("🔇 Boot sound blocked – waiting for interaction"));
    } catch (err) {
      console.warn("Boot sound failed:", err);
    }

    const fill = overlay.querySelector(".boot-bar-fill");
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 8 + 6;
      if (progress > 100) progress = 100;
      fill.style.width = `${progress}%`;
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => this.finish(), 800);
      }
    }, 200);
  },

  finish() {
    const overlay = document.getElementById("bootOverlay");
    if (!overlay) return;
    overlay.classList.add("fade-out");

    setTimeout(() => {
      overlay.remove();
      this.active = false;
      console.log("%c✅ Mesh Online · Dark Mythic Engaged", "color:#b9ff7a; font-weight:bold");

      if (window.spawnMeshPulse) {
        spawnMeshPulse("#4df2ff");
        setTimeout(() => spawnMeshPulse("#b9ff7a"), 300);
        setTimeout(() => spawnMeshPulse("#6ee2ff"), 600);
      }
    }, 800);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => BootSequence.init(), 150);
});

window.BootSequence = BootSequence;