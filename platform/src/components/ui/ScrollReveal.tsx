'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useAnimationControl } from '../providers/AnimationProvider';

type RevealVariant = 'fade' | 'slide-up' | 'slide-right' | 'slide-left' | 'scale';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: 'some' | 'all' | number;
}

const variants = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  'slide-up': {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  },
  'slide-right': {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 }
  },
  'slide-left': {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 }
  }
};

export default function ScrollReveal({
  children,
  className = '',
  variant = 'slide-up',
  delay = 0,
  duration = 0.5,
  once = true,
  amount = 'some'
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount });
  const { enabled } = useAnimationControl();

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      variants={variants[variant]}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98] // custom easeOutCubic
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
