/* ============================================================
   SPAWNENGINE · BOOT SEQUENCE v1.0
   ============================================================ */

export const BootSequence = {
  active: true,

  async init() {
    if (!this.active) return;
    console.log("🚀 Boot sequence initialized...");

    // Create overlay
    const overlay = document.createElement("div");
    overlay.id = "bootOverlay";
    overlay.innerHTML = `
      <div class="boot-center">
<img src="assets/logo.png" class="boot-logo" alt="SpawnEngine Logo" />
        <div class="boot-text">SPAWNENGINE INITIALIZING</div>
        <div class="boot-bar"><div class="boot-bar-fill"></div></div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Play boot sound if exists
    const audio = new Audio("/assets/sounds/reveal.mp3");
    audio.volume = 0.4;
    audio.play().catch(() => {});

    // Animate progress bar
    let fill = overlay.querySelector(".boot-bar-fill");
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      fill.style.width = `${progress}%`;
      if (progress >= 100) {
        clearInterval(interval);
        this.finish();
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
      console.log("✅ SpawnEngine boot complete.");
      // Trigger MeshCore init manually
      if (window.MeshKernel?.init) window.MeshKernel.init();
    }, 1200);
  },
};

/* Auto-start when DOM ready */
if (typeof window !== "undefined") {
  window.BootSequence = BootSequence;
  document.addEventListener("DOMContentLoaded", () => BootSequence.init());
}