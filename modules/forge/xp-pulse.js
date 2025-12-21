/* ============================================================
   SPAWNENGINE XP-PULSE VISUALIZER v4.2
   ============================================================ */
const canvas = document.createElement("canvas");
canvas.id = "xpPulseCanvas";
canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.width = "100vw";
canvas.style.height = "100vh";
canvas.style.pointerEvents = "none";
canvas.style.zIndex = "999";
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");
let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);
let pulses = [];

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

function addPulse(x, y, color = "#4df2ff") {
  pulses.push({ x, y, r: 0, a: 1, color });
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  for (let i = 0; i < pulses.length; i++) {
    const p = pulses[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${hexToRgb(p.color)},${p.a})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    p.r += 3;
    p.a -= 0.02;
    if (p.a <= 0) pulses.splice(i, 1);
  }
  requestAnimationFrame(animate);
}
animate();

function hexToRgb(hex) {
  const c = parseInt(hex.slice(1), 16);
  return `${(c >> 16) & 255}, ${(c >> 8) & 255}, ${c & 255}`;
}

export const XPPulse = {
  trigger(x, y, color = "#4df2ff") {
    addPulse(x, y, color);
  },
};