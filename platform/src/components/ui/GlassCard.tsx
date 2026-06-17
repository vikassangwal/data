'use client';

import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: string;
}

export default function GlassCard({
  children,
  className = '',
  hover = true,
  glow = false,
  padding = 'p-6',
}: GlassCardProps) {
  return (
    <div
      className={`glass-card ${hover ? 'hover-glow' : ''} ${glow ? 'gradient-border' : ''} ${padding} ${className}`}
    >
      {children}
    </div>
  );
}
