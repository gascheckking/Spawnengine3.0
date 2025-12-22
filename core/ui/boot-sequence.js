/* ============================================================
   SPAWNENGINE · BOOT SEQUENCE v1.1
   ------------------------------------------------------------
   Handles startup overlay, logo animation, and boot sounds
   before MeshKernel + Forge systems initialize.
   ============================================================ */

export const BootSequence = {
  active: true,
  soundEnabled: true,

  async init() {
    if (!this.active) return;
    console.log("🚀 Boot sequence initialized...");

    // ✅ Create boot overlay
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

    // ✅ Attempt boot sound (non-blocking)
    if (this.soundEnabled) {
      try {
        const audio = new Audio("assets/sounds/reveal.mp3");
        audio.volume = 0.4;
        await audio.play();
      } catch {
        console.warn("🔇 Boot sound muted or not available");
      }
    }

    // ✅ Animate loading progress bar
    let fill = overlay.querySelector(".boot-bar-fill");
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 12;
      fill.style.width = `${progress}%`;
      if (progress >= 100) {
        clearInterval(interval);
        this.finish();
      }
    }, 180);

    // Optional: trigger background pulse while loading
    if (window.spawnMeshPulse) window.spawnMeshPulse("#4df2ff", 0.6);
  },

  finish() {
    const overlay = document.getElementById("bootOverlay");
    if (!overlay) return;

    overlay.classList.add("fade-out");
    setTimeout(() => {
      overlay.remove();
      this.active = false;
      console.log("✅ SpawnEngine boot complete.");

      // ✅ Trigger MeshKernel startup sequence
      if (window.MeshKernel?.init) {
        window.MeshKernel.init();
        console.log("🧠 MeshKernel initialized from BootSequence.");
      }

      // ✅ Optional visual confirmation
      if (window.spawnMeshPulse) window.spawnMeshPulse("#b9ff7a", 1.0);
    }, 1000);
  },
};

/* ============================================================
   AUTO-START
   ============================================================ */
if (typeof window !== "undefined") {
  window.BootSequence = BootSequence;
  document.addEventListener("DOMContentLoaded", () => BootSequence.init());
}