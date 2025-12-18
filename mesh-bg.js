/**
 * SPAWNENGINE MESH v3
 * — Levande nätverksbakgrund med glow, parallax och event-pulse system.
 * — Optimerad för Onchain UI (Base/Zora/Farcaster-ekosystemet)
 * — Vanilla JS, hiDPI, low CPU
 */

class SpawnMesh {
  constructor() {
    this.canvas = document.getElementById('mesh-bg') || this.createCanvas();
    this.ctx = this.canvas.getContext('2d');

    // Konfiguration
    this.config = {
      particleCount: 120,
      connectionDistance: 120,
      mouseRadius: 100,
      baseVelocity: 0.4,
      parallaxIntensity: 0.05,
      colors: ['#14b8a6', '#6366f1'], // Teal / Indigo
    };

    this.particles = [];
    this.mouse = { x: -9999, y: -9999, active: false };
    this.scrollOffset = 0;
    this.isPaused = false;

    this.init();
  }

  createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'mesh-bg';
    Object.assign(canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: '0',
      pointerEvents: 'none',
      background: '#0f172a'
    });
    document.body.prepend(canvas);
    return canvas;
  }

  init() {
    this.resize();
    this.generateParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    const scale = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * scale;
    this.canvas.height = window.innerHeight * scale;
    this.ctx.scale(scale, scale);
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length) {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
        this.mouse.active = true;
      }
    }, { passive: true });

    window.addEventListener('scroll', () => {
      this.scrollOffset = window.scrollY;
    });

    document.addEventListener('visibilitychange', () => {
      this.isPaused = document.hidden;
    });

    // Klick = puls
    window.addEventListener('click', (e) => this.pulse(this.randomColor(), e.clientX, e.clientY));
  }

  generateParticles() {
    this.particles = [];
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * this.config.baseVelocity,
      vy: (Math.random() - 0.5) * this.config.baseVelocity,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.5,
      color: this.lerpColor(this.config.colors[0], this.config.colors[1], Math.random())
    };
  }

  lerpColor(a, b, t) {
    const ah = parseInt(a.replace('#', '0x'), 16);
    const bh = parseInt(b.replace('#', '0x'), 16);
    const ar = ah >> 16, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
    const br = bh >> 16, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
    const rr = ar + t * (br - ar);
    const rg = ag + t * (bg - ag);
    const rb = ab + t * (bb - ab);
    return `rgb(${rr|0},${rg|0},${rb|0})`;
  }

  updateParticles() {
    const mouse = this.mouse;

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Musdragningskraft
      if (mouse.active) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.config.mouseRadius && dist > 0) {
          const force = (1 - dist / this.config.mouseRadius) * 0.01;
          p.vx += dx * force;
          p.vy += dy * force;
        }
      }

      // Wrap runt kanterna
      if (p.x < 0) p.x = window.innerWidth;
      if (p.x > window.innerWidth) p.x = 0;
      if (p.y < 0) p.y = window.innerHeight;
      if (p.y > window.innerHeight) p.y = 0;

      // Pulse-decay
      if (p.life !== undefined) {
        p.life--;
        p.opacity -= 0.015;
        p.size += 0.05;
        if (p.life <= 0) p.dead = true;
      }
    }

    // Ta bort döda partiklar
    this.particles = this.particles.filter(p => !p.dead);
  }

  drawConnections() {
    const ctx = this.ctx;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.config.connectionDistance) {
          const alpha = (1 - dist / this.config.connectionDistance) * 0.4;
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = a.color;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  drawParticles() {
    const ctx = this.ctx;
    const parallaxY = this.scrollOffset * this.config.parallaxIntensity;

    for (const p of this.particles) {
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y - parallaxY, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  clear() {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  animate() {
    if (!this.isPaused) {
      this.clear();
      this.updateParticles();
      this.drawConnections();
      this.drawParticles();
    }
    requestAnimationFrame(() => this.animate());
  }

  pulse(color = '#14b8a6', x = window.innerWidth / 2, y = window.innerHeight / 2) {
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2,
        size: 2,
        opacity: 1,
        color,
        life: 80
      });
    }
  }

  randomColor() {
    const c = this.config.colors;
    return this.lerpColor(c[0], c[1], Math.random());
  }
}

// Initiera
window.addEventListener('DOMContentLoaded', () => {
  window.spawnMeshInstance = new SpawnMesh();

  // Global pulse-funktion (kan anropas från onchain events)
  window.spawnMeshPulse = (color = '#14b8a6', x, y) => {
    if (window.spawnMeshInstance) {
      window.spawnMeshInstance.pulse(color, x, y);
    }
  };
});