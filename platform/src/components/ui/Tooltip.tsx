'use client';

import { useState, useRef, useEffect, type ReactNode, type HTMLAttributes } from 'react';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
  position?: TooltipPosition;
  delay?: number;
  children: ReactNode;
}

const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowClasses: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--tooltip-bg)] border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--tooltip-bg)] border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--tooltip-bg)] border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--tooltip-bg)] border-y-transparent border-l-transparent',
};

export default function Tooltip({
  content,
  position = 'top',
  delay = 200,
  children,
  className = '',
  ...props
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      {...props}
    >
      {children}

      {isVisible && (
        <div
          className={`
            absolute z-50 ${positionClasses[position]}
            pointer-events-none
          `}
          role="tooltip"
          style={{ animation: 'fade-in 0.15s ease forwards' }}
        >
          <div
            className="
              px-2.5 py-1.5 rounded-lg text-xs font-medium
              bg-[var(--tooltip-bg)] text-[var(--tooltip-text)]
              shadow-lg whitespace-nowrap
              border border-[var(--border-color)]
            "
          >
            {content}
          </div>
          {/* Arrow */}
          <div
            className={`absolute border-4 ${arrowClasses[position]}`}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
