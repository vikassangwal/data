'use client';

import { useEffect, useRef, useState, type ReactNode, type HTMLAttributes } from 'react';

interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  gradient?: boolean;
  badge?: ReactNode;
  as?: 'h1' | 'h2';
}

export default function SectionHeading({
  title,
  subtitle,
  align = 'center',
  gradient = true,
  badge,
  as = 'h2',
  className = '',
  ...props
}: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const el = ref.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const alignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  return (
    <div
      ref={ref}
      className={`
        flex flex-col gap-4 mb-12
        ${alignClasses[align]}
        transition-all duration-700
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        ${className}
      `.trim()}
      {...props}
    >
      {badge && <div>{badge}</div>}
      {as === 'h1' ? (
        <h1
          className={`
            text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight
            ${gradient ? 'gradient-text' : 'text-[var(--text-primary)]'}
          `}
        >
          {title}
        </h1>
      ) : (
        <h2
          className={`
            text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight
            ${gradient ? 'gradient-text' : 'text-[var(--text-primary)]'}
          `}
        >
          {title}
        </h2>
      )}
      {/* Gradient underline */}
      <div
        className="h-1 rounded-full transition-all duration-700 delay-200"
        style={{
          width: isVisible ? '4rem' : '0',
          background: 'linear-gradient(90deg, #3B82F6, #06B6D4)',
        }}
      />
      {subtitle && (
        <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
