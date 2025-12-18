// ======================================================
// 🌌 SPAWNENGINE MESH BACKGROUND v3.1 — Reforge (Final)
// ------------------------------------------------------
// Dynamisk interaktiv mesh-bakgrund för SpawnEngine UI.
// Parallax, glow, touch-stöd och pulse-anrop.
// ------------------------------------------------------
// Optimerad för PWA + låg CPU vid idle
// ======================================================

class MeshBackground {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    this.particles = [];
    this.mouse = { x: null, y: null };
    this.scrollOffset = 0;
    this.animationId = null;
    this.isVisible = true;
    this.lastFrameTime = 0;

    this.particleCount = 120;
    this.maxDistance = 120;
    this.attractionRadius = 100;
    this.attractionStrength = 0.008;

    this.init();
  }

  //——— INIT ——//
  init() {
    this.createCanvas();
    this.generateParticles();
    this.bindEvents();
    this.animate();
    console.log("%c[MeshBG] Initialized", "color:#3cf6ff");
  }

  //——— CANVAS SETUP ——//
  createCanvas() {
    this.canvas = document.getElementById("mesh-bg") || document.createElement("canvas");
    this.canvas.id = "mesh-bg";
    Object.assign(this.canvas.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "0",
      background: "radial-gradient(circle at 30% 20%, rgba(20,25,55,0.6), #03040d)"
    });
    if (!document.getElementById("mesh-bg")) document.body.prepend(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.resize();
  }

  resize() {
    const ratio = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * ratio;
    this.canvas.height = this.height * ratio;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  //——— PARTICLES ——//
  generateParticles() {
    this.particles = [];
    const colors = ["#14b8a6", "#6366f1"];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.4 + 0.5,
        color: this.lerpColor(colors[0], colors[1], Math.random())
      });
    }
  }

  lerpColor(a, b, t) {
    const ah = parseInt(a.replace("#", "0x"), 16);
    const bh = parseInt(b.replace("#", "0x"), 16);
    const ar = ah >> 16, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
    const br = bh >> 16, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
    const rr = ar + t * (br - ar);
    const rg = ag + t * (bg - ag);
    const rb = ab + t * (bb - ab);
    return `#${((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1)}`;
  }

  //——— UPDATE ——//
  updateParticles() {
    const mouseInfluence = this.mouse.x !== null && this.mouse.y !== null;
    this.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (mouseInfluence) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < this.attractionRadius && dist > 0) {
          const force = this.attractionStrength * (1 - dist / this.attractionRadius);
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;
    });
  }

  drawConnections() {
    this.ctx.lineWidth = 0.8;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < this.maxDistance) {
          const opacity = (1 - dist / this.maxDistance) * 0.4;
          this.ctx.globalAlpha = opacity;
          this.ctx.strokeStyle = a.color;
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.stroke();
        }
      }
    }
    this.ctx.globalAlpha = 1;
  }

  drawParticles() {
    this.particles.forEach((p) => {
      const parallaxX = p.x + this.scrollOffset / 50;
      const parallaxY = p.y + this.scrollOffset / 70;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = `${p.color}40`;
      this.ctx.beginPath();
      this.ctx.arc(parallaxX, parallaxY, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  //——— ANIMATE ——//
  animate(timestamp = 0) {
    if (!this.isVisible) return;
    const delta = timestamp - this.lastFrameTime;
    if (delta < 1000 / 60) {
      this.animationId = requestAnimationFrame((t) => this.animate(t));
      return;
    }
    this.lastFrameTime = timestamp;

    this.clear();
    this.updateParticles();
    this.drawConnections();
    this.drawParticles();
    this.animationId = requestAnimationFrame((t) => this.animate(t));
  }

  //——— EVENTS ——//
  bindEvents() {
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length > 0) {
          this.mouse.x = e.touches[0].clientX;
          this.mouse.y = e.touches[0].clientY;
        }
      },
      { passive: true }
    );
    window.addEventListener("scroll", () => {
      this.scrollOffset = window.scrollY;
    });
    document.addEventListener("visibilitychange", () => {
      this.isVisible = !document.hidden;
      if (this.isVisible && !this.animationId) this.animate();
      else if (!this.isVisible && this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    });
  }

  //——— BONUS: ON-CHAIN PULSE ——//
  pulse(color = "#14b8a6", originX = this.width / 2, originY = this.height / 2) {
    const pulseParticles = 14;
    const speed = 2.5;
    for (let i = 0; i < pulseParticles; i++) {
      const angle = (Math.PI * 2 * i) / pulseParticles;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      this.particles.push({
        x: originX,
        y: originY,
        vx,
        vy,
        radius: 2,
        opacity: 1,
        color,
        life: 60
      });
    }

    const originalUpdate = this.updateParticles.bind(this);
    this.updateParticles = () => {
      originalUpdate();
      this.particles = this.particles.filter((p) => {
        if (p.life !== undefined) {
          p.opacity -= 0.016;
          p.radius += 0.1;
          p.life--;
          return p.life > 0;
        }
        return true;
      });
    };
  }
}

//——— INIT ——//
const meshBgInstance = new MeshBackground();
window.meshBgInstance = meshBgInstance;

//——— GLOBAL HELPER ——//
window.spawnMeshPulse = (color = "#14b8a6", x, y) => {
  meshBgInstance.pulse(color, x ?? window.innerWidth / 2, y ?? window.innerHeight / 2);
};