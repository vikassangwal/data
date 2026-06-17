import type { HTMLAttributes } from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const sizeClasses: Record<AvatarSize, { container: string; text: string; status: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', status: 'w-1.5 h-1.5 border' },
  sm: { container: 'w-8 h-8', text: 'text-xs', status: 'w-2 h-2 border-[1.5px]' },
  md: { container: 'w-10 h-10', text: 'text-sm', status: 'w-2.5 h-2.5 border-2' },
  lg: { container: 'w-12 h-12', text: 'text-base', status: 'w-3 h-3 border-2' },
  xl: { container: 'w-16 h-16', text: 'text-lg', status: 'w-3.5 h-3.5 border-2' },
};

const statusColors = {
  online: 'bg-success',
  offline: 'bg-[var(--text-muted)]',
  away: 'bg-warning',
  busy: 'bg-error',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Avatar({
  src,
  alt,
  name,
  size = 'md',
  status,
  className = '',
  ...props
}: AvatarProps) {
  const sizes = sizeClasses[size];
  const initials = name ? getInitials(name) : '?';

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`} {...props}>
      <div
        className={`
          ${sizes.container} rounded-full overflow-hidden
          flex items-center justify-center
          bg-gradient-to-br from-primary to-secondary
          text-white font-semibold ${sizes.text}
          ring-2 ring-[var(--border-color)]
          transition-all duration-200
        `}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials on image load error
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={`
            absolute bottom-0 right-0
            ${sizes.status} rounded-full
            ${statusColors[status]}
            border-[var(--bg-primary)]
          `}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}
