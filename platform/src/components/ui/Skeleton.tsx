import type { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export default function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  };

  const defaultHeight = {
    text: '1rem',
    circular: '3rem',
    rectangular: '8rem',
    rounded: '8rem',
  };

  const defaultWidth = {
    text: '100%',
    circular: '3rem',
    rectangular: '100%',
    rounded: '100%',
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`flex flex-col gap-2 ${className}`} role="status" aria-label="Loading..." {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`skeleton ${variantClasses[variant]}`}
            style={{
              width: i === lines - 1 ? '75%' : (width ?? defaultWidth[variant]),
              height: height ?? defaultHeight[variant],
            }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div
      className={`skeleton ${variantClasses[variant]} ${className}`}
      style={{
        width: width ?? defaultWidth[variant],
        height: height ?? defaultHeight[variant],
      }}
      role="status"
      aria-label="Loading..."
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
