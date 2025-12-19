/* ============================================================
   SPAWNENGINE · Mesh Visualizer v3.1
   Connects Mesh Events → Background Pulse Effects
   ============================================================ */

export const MeshVisualizer = {
  eventColors: {
    pack_open: "#b9ff7a",
    burn: "#ff7070",
    swap: "#3cf6ff",
    deploy: "#ffea70",
    quest_complete: "#9d7aff",
    mint: "#00ffa6",
    xp_gain: "#14b8a6",
    default: "#ffffff",
  },

  trigger(eventType) {
    const color = this.eventColors[eventType] || this.eventColors.default;
    if (window.spawnMeshPulse) {
      window.spawnMeshPulse(color);
      console.log(`✨ [Visualizer] Pulse for event: ${eventType}`);
    }
  },
};

window.MeshVisualizer = MeshVisualizer;