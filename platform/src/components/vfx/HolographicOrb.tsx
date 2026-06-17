'use client';

import { useRef, useEffect } from 'react';

interface HolographicOrbProps {
  size?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  className?: string;
}

export default function HolographicOrb({
  size = 300,
  color1 = '#3B82F6',
  color2 = '#06B6D4',
  color3 = '#8B5CF6',
  className = '',
}: HolographicOrbProps) {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const orb = orbRef.current;
    if (!orb) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let frame: number;
    let t = 0;
    let lastTime = 0;

    const animate = (timestamp: number) => {
      if (timestamp - lastTime < 33) { // ~30fps
        frame = requestAnimationFrame(animate);
        return;
      }
      lastTime = timestamp;
      t += 0.005;
      const scale = 1 + Math.sin(t * 2) * 0.02;
      const rotateX = Math.sin(t) * 10;
      const rotateY = Math.cos(t * 0.7) * 10;
      orb.style.transform = `scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size, perspective: '800px' }}>
      {/* Main orb sphere */}
      <div
        ref={orbRef}
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${color2}33, ${color1}22, ${color3}11, transparent 70%)`,
          boxShadow: `
            inset 0 0 ${size / 3}px ${color1}22,
            inset 0 0 ${size / 5}px ${color2}33,
            0 0 ${size / 2}px ${color1}15,
            0 0 ${size}px ${color1}08
          `,
          border: `1px solid ${color1}20`,
          transformStyle: 'preserve-3d',
        }}
      />

      {/* Inner ring */}
      <div
        className="absolute rounded-full animate-spin-slow"
        style={{
          inset: '15%',
          border: `1px solid ${color2}30`,
          borderTop: `2px solid ${color2}60`,
          borderRadius: '50%',
        }}
      />

      {/* Outer ring */}
      <div
        className="absolute rounded-full"
        style={{
          inset: '-10%',
          border: `1px dashed ${color3}15`,
          borderRadius: '50%',
          animation: 'spin 25s linear infinite reverse',
        }}
      />

      {/* Highlight dot */}
      <div
        className="absolute w-2 h-2 rounded-full animate-pulse-glow"
        style={{
          top: '25%',
          left: '35%',
          background: `radial-gradient(circle, white 0%, ${color2} 100%)`,
          boxShadow: `0 0 10px ${color2}`,
        }}
      />

      {/* Orbiting node */}
      <div
        className="absolute w-3 h-3 rounded-full animate-orbit"
        style={{
          top: '50%',
          left: '50%',
          marginTop: '-6px',
          marginLeft: '-6px',
          background: color1,
          boxShadow: `0 0 8px ${color1}`,
        }}
      />
    </div>
  );
}
