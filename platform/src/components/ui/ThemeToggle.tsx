'use client';

import { useState, useEffect, useCallback, type HTMLAttributes } from 'react';

interface ThemeToggleProps extends HTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { button: 'w-8 h-8', icon: 'w-4 h-4' },
  md: { button: 'w-10 h-10', icon: 'w-5 h-5' },
  lg: { button: 'w-12 h-12', icon: 'w-6 h-6' },
};

export default function ThemeToggle({
  size = 'md',
  className = '',
  ...props
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  // Hydration-safe initialization
  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const initial = stored || 'dark';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }, [theme]);

  const sizes = sizeMap[size];

  // Prevent flash of wrong icon
  if (!mounted) {
    return (
      <button
        className={`${sizes.button} rounded-xl bg-[var(--bg-surface)] ${className}`}
        aria-label="Toggle theme"
        disabled
        {...props}
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizes.button} rounded-xl
        flex items-center justify-center
        bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)]/80
        text-[var(--text-secondary)] hover:text-[var(--text-primary)]
        border border-[var(--border-color)]
        transition-all duration-300
        cursor-pointer
        focus-visible:outline-2 focus-visible:outline-primary
        ${className}
      `.trim()}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      {...props}
    >
      {/* Sun icon */}
      <svg
        className={`
          ${sizes.icon} absolute transition-all duration-500
          ${theme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
        `}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      {/* Moon icon */}
      <svg
        className={`
          ${sizes.icon} absolute transition-all duration-500
          ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
        `}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </button>
  );
}
