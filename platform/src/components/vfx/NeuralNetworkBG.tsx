'use client';

import { useEffect, useRef } from 'react';

interface NeuralNetworkBGProps {
  nodeCount?: number;
  color?: string;
  className?: string;
}

export default function NeuralNetworkBG({ nodeCount = 50, color = '59, 130, 246', className = '' }: NeuralNetworkBGProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Respect reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationId: number;
    let w: number, h: number;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    interface Node { x: number; y: number; vx: number; vy: number; r: number; }
    const nodes: Node[] = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };

    const init = () => {
      resize();
      nodes.length = 0;
      // Use fewer nodes on mobile
      const count = w < 768 ? Math.floor(nodeCount * 0.5) : nodeCount;
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.5 + 0.8,
        });
      }
    };

    // Throttle to ~30fps for performance
    let lastTime = 0;
    const targetFPS = 30;
    const frameDuration = 1000 / targetFPS;

    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0 });
    observer.observe(canvas);

    const draw = (timestamp: number) => {
      if (!isVisible) {
        animationId = requestAnimationFrame(draw);
        return;
      }
      if (timestamp - lastTime < frameDuration) {
        animationId = requestAnimationFrame(draw);
        return;
      }
      lastTime = timestamp;

      ctx.clearRect(0, 0, w, h);
      const maxDist = 130;

      // Batch draw connections
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxDist * maxDist) {
            const alpha = (1 - Math.sqrt(distSq) / maxDist) * 0.12;
            ctx.strokeStyle = `rgba(${color}, ${alpha})`;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
            ctx.beginPath();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, 0.35)`;
        ctx.fill();
      }

      // Update positions
      if (!prefersReduced) {
        for (const node of nodes) {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < 0 || node.x > w) node.vx *= -1;
          if (node.y < 0 || node.y > h) node.vy *= -1;
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    init();
    animationId = requestAnimationFrame(draw);

    const resizeHandler = () => { resize(); init(); };
    window.addEventListener('resize', resizeHandler);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeHandler);
      observer.disconnect();
    };
  }, [nodeCount, color]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.5, willChange: 'contents' }}
    />
  );
}
