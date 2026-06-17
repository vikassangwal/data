'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';

interface AnimationContextType {
  enabled: boolean;
  intensity: 'low' | 'medium' | 'high';
  setEnabled: (val: boolean) => void;
  setIntensity: (val: 'low' | 'medium' | 'high') => void;
  reduceMotion: boolean;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('high');
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Check OS level preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);
    
    if (mediaQuery.matches) {
      setEnabled(false);
      setIntensity('low');
    }

    const listener = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches);
      if (e.matches) {
        setEnabled(false);
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // For Admin toggle, we would fetch/persist these to localStorage or Database here
  useEffect(() => {
    const savedAnim = localStorage.getItem('site_animations');
    if (savedAnim === 'disabled') setEnabled(false);
  }, []);

  const value = {
    enabled,
    intensity,
    setEnabled: (val: boolean) => {
      setEnabled(val);
      localStorage.setItem('site_animations', val ? 'enabled' : 'disabled');
    },
    setIntensity,
    reduceMotion
  };

  return (
    <AnimationContext.Provider value={value}>
      <MotionConfig reducedMotion={!enabled || reduceMotion ? "always" : "user"}>
        {children}
      </MotionConfig>
    </AnimationContext.Provider>
  );
}

export function useAnimationControl() {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimationControl must be used within an AnimationProvider');
  }
  return context;
}
