'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useAnimationControl } from '../providers/AnimationProvider';

export default function CursorSpotlight() {
  const { enabled, intensity } = useAnimationControl();
  const [isDesktop, setIsDesktop] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Smooth springs for cursor tracking
  const cursorX = useSpring(-100, { stiffness: 200, damping: 25 });
  const cursorY = useSpring(-100, { stiffness: 200, damping: 25 });

  useEffect(() => {
    // Only run on desktop devices to save mobile battery/performance
    const matchMedia = window.matchMedia('(pointer: fine)');
    setIsDesktop(matchMedia.matches);

    if (!enabled || !matchMedia.matches || intensity === 'low') return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 150); // 150 is half the spotlight width
      cursorY.set(e.clientY - 150);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveCursor);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [enabled, intensity, cursorX, cursorY, isVisible]);

  if (!enabled || !isDesktop || intensity === 'low') return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none z-50 mix-blend-screen"
      style={{
        x: cursorX,
        y: cursorY,
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
        opacity: isVisible ? 1 : 0,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      aria-hidden="true"
    />
  );
}
