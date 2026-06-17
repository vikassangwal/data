import type { ReactNode, HTMLAttributes } from 'react';

interface GradientTextProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  from?: string;
  via?: string;
  to?: string;
  animate?: boolean;
}

export default function GradientText({
  children,
  from = '#3B82F6',
  via = '#06B6D4',
  to = '#8B5CF6',
  animate = false,
  className = '',
  ...props
}: GradientTextProps) {
  return (
    <span
      className={`
        inline-block bg-clip-text text-transparent
        ${animate ? 'animate-gradient' : ''}
        ${className}
      `.trim()}
      style={{
        backgroundImage: `linear-gradient(135deg, ${from}, ${via}, ${to})`,
        backgroundSize: animate ? '200% 200%' : '100% 100%',
      }}
      {...props}
    >
      {children}
    </span>
  );
}
