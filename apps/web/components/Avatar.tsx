'use client';

import { clsx } from 'clsx';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
type RingVariant = 'none' | 'accent' | 'gold';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  online?: boolean;
  showIndicator?: boolean;
  ring?: RingVariant;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; indicator: string }> = {
  sm: { container: 'w-8 h-8', text: 'text-xs', indicator: 'w-2.5 h-2.5 border-2' },
  md: { container: 'w-10 h-10', text: 'text-sm', indicator: 'w-3 h-3 border-2' },
  lg: { container: 'w-14 h-14', text: 'text-xl', indicator: 'w-3.5 h-3.5 border-[3px]' },
  xl: { container: 'w-20 h-20', text: 'text-3xl', indicator: 'w-4 h-4 border-[3px]' },
};

const ringStyles: Record<RingVariant, string> = {
  none: '',
  accent: 'ring-2 ring-accent/40',
  gold: 'ring-2 ring-gold/40',
};

export function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  online = false,
  showIndicator = false,
  ring = 'none',
  className,
}: AvatarProps) {
  const styles = sizeStyles[size];
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={clsx('relative inline-flex shrink-0', className)}>
      <div
        className={clsx(
          'rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-accent to-gold text-white font-semibold',
          styles.container,
          styles.text,
          ringStyles[ring],
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials || '?'}</span>
        )}
      </div>
      {showIndicator && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 rounded-full border-white',
            styles.indicator,
            online ? 'bg-success' : 'bg-muted',
          )}
        />
      )}
    </div>
  );
}
