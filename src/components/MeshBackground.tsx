import React, { useEffect, useRef } from "react";

export const MeshBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let width = 0, height = 0;
    const POINTS = 180;
    let points: any[] = [];

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      points = Array.from({ length: POINTS }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(15,15,30,0.8)";
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(0,255,255,0.1)";
      points.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        points.slice(i).forEach(q => {
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 120) {
            ctx.globalAlpha = 1 - dist / 120;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        });
      });
      requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />;
};