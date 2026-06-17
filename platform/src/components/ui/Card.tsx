import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: string;
}

export default function Card({ children, className = '', padding = 'p-6' }: CardProps) {
  return (
    <div className={`bg-card rounded-2xl border border-border ${padding} transition-all duration-300 hover:shadow-lg ${className}`}>
      {children}
    </div>
  );
}
