/* ============================================================
   SPAWNENGINE · Mesh Pulse Core v3.0
   Background Glow & Pulse Effect Engine
   ------------------------------------------------------------
   Provides real-time visual feedback to MeshVisualizer events.
   ============================================================ */

export function spawnMeshPulse(color = "#4df2ff", intensity = 1.0) {
  // Skapa ett overlay-element om det inte redan finns
  let pulseLayer = document.getElementById("mesh-pulse-layer");
  if (!pulseLayer) {
    pulseLayer = document.createElement("div");
    pulseLayer.id = "mesh-pulse-layer";
    Object.assign(pulseLayer.style, {
      position: "fixed",
      inset: 0,
      zIndex: 0,
      background: "transparent",
      pointerEvents: "none",
      transition: "background 0.8s ease, opacity 0.6s ease",
    });
    document.body.appendChild(pulseLayer);
  }

  // Starta själva pulsen
  pulseLayer.style.background = `${color}`;
  pulseLayer.style.opacity = 0.4 * intensity;

  // Fade ut effekten
  setTimeout(() => {
    pulseLayer.style.opacity = "0";
  }, 150);

  // Återställ till transparent
  setTimeout(() => {
    pulseLayer.style.background = "transparent";
  }, 800);
}

/* —— GLOBAL ACCESS —— */
if (typeof window !== "undefined") {
  window.spawnMeshPulse = spawnMeshPulse;
  console.log("%c✨ Mesh Pulse Engine ready (v3.0)", "color:#4df2ff");
}
