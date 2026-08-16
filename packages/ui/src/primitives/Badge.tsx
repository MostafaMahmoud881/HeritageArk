import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'accent' | 'gold' | 'navy' | 'muted' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  accent: 'bg-accent/10 text-accent border-accent/20',
  gold: 'bg-gold/10 text-[#B8953A] border-gold/20',
  navy: 'bg-navy/10 text-navy border-navy/20',
  muted: 'bg-muted/10 text-muted border-muted/20',
  success: 'bg-success/10 text-success border-success/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Badge({ children, variant = 'muted', size = 'md', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
