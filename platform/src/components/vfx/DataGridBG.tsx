'use client';

import { useEffect, useRef } from 'react';

interface DataGridBGProps {
  className?: string;
}

export default function DataGridBG({ className = '' }: DataGridBGProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animId: number;
    let w: number, h: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    interface Packet { x: number; y: number; dx: number; dy: number; speed: number; life: number; maxLife: number; color: string; }
    const packets: Packet[] = [];
    const colors = ['59, 130, 246', '6, 182, 212', '139, 92, 246'];
    const gridSize = 60;

    const spawnPacket = () => {
      const col = colors[Math.floor(Math.random() * colors.length)];
      const horizontal = Math.random() > 0.5;
      packets.push({
        x: horizontal ? 0 : Math.floor(Math.random() * (w / gridSize)) * gridSize,
        y: horizontal ? Math.floor(Math.random() * (h / gridSize)) * gridSize : 0,
        dx: horizontal ? 1 : 0,
        dy: horizontal ? 0 : 1,
        speed: 1 + Math.random() * 1.5,
        life: 0,
        maxLife: 200 + Math.random() * 200,
        color: col,
      });
    };

    let t = 0;
    let lastTime = 0;
    
    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0 });
    observer.observe(canvas);

    const draw = (timestamp: number) => {
      if (!isVisible) {
        animId = requestAnimationFrame(draw);
        return;
      }
      // Throttle to ~24fps
      if (timestamp - lastTime < 42) {
        animId = requestAnimationFrame(draw);
        return;
      }
      lastTime = timestamp;

      ctx.clearRect(0, 0, w, h);
      t++;

      // Draw subtle grid
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.025)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= w; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y <= h; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Draw grid intersection dots (skip some for perf)
      for (let x = 0; x <= w; x += gridSize) {
        for (let y = 0; y <= h; y += gridSize) {
          const pulse = Math.sin(t * 0.015 + x * 0.008 + y * 0.008) * 0.5 + 0.5;
          ctx.beginPath();
          ctx.arc(x, y, 1 + pulse * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(59, 130, 246, ${0.04 + pulse * 0.06})`;
          ctx.fill();
        }
      }

      if (!prefersReduced) {
        // Spawn new packets
        if (t % 40 === 0 && packets.length < 10) spawnPacket();

        // Update & draw packets
        for (let i = packets.length - 1; i >= 0; i--) {
          const p = packets[i];
          p.x += p.dx * p.speed;
          p.y += p.dy * p.speed;
          p.life++;

          const alpha = Math.min(1, p.life / 20) * Math.max(0, 1 - p.life / p.maxLife);

          // Draw packet trail
          const trailLen = 25;
          const gradient = ctx.createLinearGradient(
            p.x - p.dx * trailLen, p.y - p.dy * trailLen, p.x, p.y
          );
          gradient.addColorStop(0, `rgba(${p.color}, 0)`);
          gradient.addColorStop(1, `rgba(${p.color}, ${alpha * 0.4})`);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x - p.dx * trailLen, p.y - p.dy * trailLen);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();

          // Draw packet head
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color}, ${alpha * 0.7})`;
          ctx.fill();

          if (p.life > p.maxLife || p.x > w + 50 || p.y > h + 50) {
            packets.splice(i, 1);
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{ willChange: 'contents' }}
    />
  );
}
