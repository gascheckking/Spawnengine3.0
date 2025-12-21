/* ============================================================
   SPAWNENGINE · Mesh Visualizer v3.2
   Connects MeshCore Events → Background Pulse / Glow Effects
   ------------------------------------------------------------
   Handles live event-based color pulses & glow transitions.
   Integrated with MeshCore, XP Engine, and Forge Systems.
   ============================================================ */

export const MeshVisualizer = {
  /* —— COLOR MAP —— */
  eventColors: {
    pack_open: "#b9ff7a",
    burn: "#ff7070",
    swap: "#3cf6ff",
    deploy: "#ffea70",
    quest_complete: "#9d7aff",
    mint: "#00ffa6",
    xp_gain: "#14b8a6",
    relic_forge: "#4df2ff",
    arena_win: "#f2b84d",
    default: "#ffffff",
  },

  /* —— PULSE TRIGGER —— */
  trigger(eventType, intensity = 1.0) {
    const color = this.eventColors[eventType] || this.eventColors.default;
    if (window.spawnMeshPulse) {
      window.spawnMeshPulse(color, intensity);
      console.log(`✨ [Visualizer] Pulse for event: ${eventType}`);
    } else {
      // Fallback: subtle background flash
      const body = document.body;
      const original = body.style.backgroundColor;
      body.style.transition = "background-color 0.4s ease";
      body.style.backgroundColor = color + "33";
      setTimeout(() => (body.style.backgroundColor = original || ""), 600);
    }
  },

  /* —— GRADIENT FLASH —— */
  gradientPulse(from = "#4df2ff", to = "#b9ff7a", duration = 800) {
    const canvas = document.querySelector("#mesh-canvas");
    if (!canvas) return;

    canvas.style.transition = `background ${duration}ms ease`;
    canvas.style.background = `radial-gradient(circle at center, ${from}, ${to} 80%)`;

    setTimeout(() => {
      canvas.style.background = "transparent";
    }, duration);
  },

  /* —— AUTO-BIND TO MESHCORE —— */
  bindToMeshCore() {
    if (!window.MeshCore || !MeshCore.onEvent) {
      console.warn("⚠️ MeshCore not ready for visualizer binding.");
      return;
    }

    MeshCore.onEvent((evt) => {
      if (!evt || !evt.type) return;
      this.trigger(evt.type);
    });

    console.log("%c🔮 MeshVisualizer bound to MeshCore events", "color:#4df2ff");
  },

  /* —— INIT —— */
  init() {
    console.log("%c🌀 MeshVisualizer active (v3.2)", "color:#3cf6ff");
    this.bindToMeshCore?.();
  },
};

/* —— GLOBAL ACCESS —— */
if (typeof window !== "undefined") {
  window.MeshVisualizer = MeshVisualizer;
  setTimeout(() => MeshVisualizer.init(), 400);
}