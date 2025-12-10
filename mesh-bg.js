// mesh-bg.js — soft animated mesh background för SpawnEngine · Mesh HUD

(function () {
  const canvas = document.getElementById("mesh-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let points = [];
  const POINT_ROWS = 9;
  const POINT_COLS = 14;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    initPoints();
  }

  function initPoints() {
    points = [];
    const xStep = width / (POINT_COLS - 1);
    const yStep = height / (POINT_ROWS - 1);

    for (let y = 0; y < POINT_ROWS; y++) {
      for (let x = 0; x < POINT_COLS; x++) {
        const px = x * xStep;
        const py = y * yStep;
        points.push({
          x: px,
          y: py,
          baseX: px,
          baseY: py,
          offsetX: (Math.random() - 0.5) * 18,
          offsetY: (Math.random() - 0.5) * 18,
          speed: 0.4 + Math.random() * 0.4,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  function update(dt) {
    const t = performance.now() / 1000;

    for (const p of points) {
      const wobble = Math.sin(t * p.speed + p.phase);
      const wobble2 = Math.cos(t * (p.speed * 0.7) + p.phase * 1.3);

      p.x = p.baseX + p.offsetX * wobble;
      p.y = p.baseY + p.offsetY * wobble2;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // bakgrundsglow
    const grad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.0,
      0,
      width * 0.5,
      height * 0.5,
      height * 1.1
    );
    grad.addColorStop(0, "rgba(45, 120, 255, 0.25)");
    grad.addColorStop(0.4, "rgba(10, 242, 255, 0.12)");
    grad.addColorStop(1, "rgba(2, 3, 12, 0.0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(120, 210, 255, 0.22)";
    ctx.beginPath();

    // rita horisontella linjer
    for (let row = 0; row < POINT_ROWS; row++) {
      for (let col = 0; col < POINT_COLS; col++) {
        const idx = row * POINT_COLS + col;
        const p = points[idx];
        if (col === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
    }

    // rita vertikala linjer
    for (let col = 0; col < POINT_COLS; col++) {
      for (let row = 0; row < POINT_ROWS; row++) {
        const idx = row * POINT_COLS + col;
        const p = points[idx];
        if (row === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
    }

    ctx.stroke();

    // små noder
    ctx.fillStyle = "rgba(160, 240, 255, 0.6)";
    for (const p of points) {
      const glow = 2 + Math.random() * 0.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, glow * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let lastTime = performance.now();
  function loop(now) {
    const dt = now - lastTime;
    lastTime = now;

    update(dt / 1000);
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(loop);
})();