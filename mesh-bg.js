/* ============================================================
   SPAWNENGINE MESH-BG v1.0 — Background Universe System
   Visual Nervsystem för SpawnEngine v3.1 Reforge
   ============================================================ */

/* —— init —— */
(function () {
  const canvas = document.getElementById("meshCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, particles = [];
  let pulseAlpha = 0;
  let shockwaves = [];

  /* —— resize —— */
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  /* —— particle-setup —— */
  for (let i = 0; i < 48; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.6,
      c: "rgba(60,246,255,0.6)"
    });
  }

  /* —— draw-loop —— */
  function draw() {
    ctx.clearRect(0, 0, w, h);

    // background fade
    ctx.fillStyle = "rgba(2,3,10,0.45)";
    ctx.fillRect(0, 0, w, h);

    // particles
    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.fill();
    }

    // connection lines
    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const opacity = 1 - dist / 120;
          ctx.strokeStyle = `rgba(60,246,255,${opacity * 0.15})`;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // pulse effect
    if (pulseAlpha > 0) {
      ctx.fillStyle = `rgba(60,246,255,${pulseAlpha * 0.25})`;
      ctx.fillRect(0, 0, w, h);
      pulseAlpha *= 0.9;
    }

    // shockwaves
    for (let s of shockwaves) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${s.color},${s.alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      s.radius += 3;
      s.alpha -= 0.02;
    }
    shockwaves = shockwaves.filter(s => s.alpha > 0);

    requestAnimationFrame(draw);
  }
  draw();

  /* —— mesh-actions —— */
  function pulse(color = "60,246,255") {
    pulseAlpha = 0.8;
    particles.forEach(p => {
      p.c = `rgba(${color},${Math.random() * 0.8})`;
      setTimeout(() => (p.c = "rgba(60,246,255,0.6)"), 400);
    });
  }

  function event(type) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    let color = "60,246,255";
    if (type === "xp") color = "0,255,200";
    if (type === "pack") color = "255,214,102";
    if (type === "legendary") color = "255,70,70";
    shockwaves.push({ x, y, radius: 10, color, alpha: 0.5 });
    pulse(color);
  }

  /* —— public-api —— */
  window.SpawnMesh = {
    pulse,
    event,
  };

  console.log("🕸️ SpawnMesh initialized.");

})();