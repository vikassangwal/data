'use client';

interface RadarPulseProps {
  size?: number;
  color?: string;
  rings?: number;
  className?: string;
}

export default function RadarPulse({ size = 200, color = '#3B82F6', rings = 3, className = '' }: RadarPulseProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Center dot */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full z-10"
        style={{
          width: 8,
          height: 8,
          background: color,
          boxShadow: `0 0 12px ${color}, 0 0 24px ${color}44`,
        }}
      />

      {/* Concentric rings */}
      {Array.from({ length: rings }).map((_, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-radar-ping"
          style={{
            width: size * 0.3,
            height: size * 0.3,
            border: `1px solid ${color}`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${2 + i * 0.3}s`,
          }}
        />
      ))}

      {/* Sweep line */}
      <div
        className="absolute top-1/2 left-1/2 origin-left animate-spin-slow"
        style={{
          width: size / 2 - 10,
          height: 1,
          background: `linear-gradient(90deg, ${color}80, transparent)`,
          animationDuration: '4s',
        }}
      />
    </div>
  );
}
