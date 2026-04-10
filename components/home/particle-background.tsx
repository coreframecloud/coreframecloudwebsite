"use client";

import { useEffect, useRef } from "react";

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let scrollOffset = 0;

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 110 : 180;
    const maxDistance = isMobile ? 110 : 140;

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      a: number;
    }[] = [];

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resetParticles = () => {
      particles.length = 0;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (isMobile ? 0.12 : 0.16),
          vy: (Math.random() - 0.5) * (isMobile ? 0.12 : 0.16),
          r: Math.random() * 3.3 + 1.8, // ~50%+ larger than before
          a: Math.random() * 0.45 + 0.22,
        });
      }
    };

    const drawBackgroundGlow = () => {
      const grad1 = ctx.createRadialGradient(
        width * 0.52,
        height * 0.08,
        0,
        width * 0.52,
        height * 0.08,
        width * 0.34
      );
      grad1.addColorStop(0, "rgba(34,211,238,0.14)");
      grad1.addColorStop(1, "rgba(34,211,238,0)");

      const grad2 = ctx.createRadialGradient(
        width * 0.9,
        height * 0.2,
        0,
        width * 0.9,
        height * 0.2,
        width * 0.24
      );
      grad2.addColorStop(0, "rgba(59,130,246,0.10)");
      grad2.addColorStop(1, "rgba(59,130,246,0)");

      const grad3 = ctx.createRadialGradient(
        width * 0.15,
        height * 0.75,
        0,
        width * 0.15,
        height * 0.75,
        width * 0.22
      );
      grad3.addColorStop(0, "rgba(103,232,249,0.08)");
      grad3.addColorStop(1, "rgba(103,232,249,0)");

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, width, height);
    };

    const handleScroll = () => {
      scrollOffset = window.scrollY * 0.0008;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      drawBackgroundGlow();

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy + scrollOffset;

        if (p.x < -30) p.x = width + 30;
        if (p.x > width + 30) p.x = -30;
        if (p.y < -30) p.y = height + 30;
        if (p.y > height + 30) p.y = -30;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(103,232,249,${p.a})`;
        ctx.shadowBlur = 16;
        ctx.shadowColor = "rgba(103,232,249,0.35)";
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(103,232,249,${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      animationFrameId = window.requestAnimationFrame(draw);
    };

    resize();
    resetParticles();
    handleScroll();
    draw();

    const handleResize = () => {
      resize();
      resetParticles();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[2] overflow-hidden mix-blend-screen">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-90"
      />
    </div>
  );
}
