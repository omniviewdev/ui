import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import styles from './Badge.module.css';

export type BadgeVariant = 'standard' | 'dot';
export type BadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
export type BadgeColor = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeOverlap = 'rectangular' | 'circular';

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color' | 'content'> {
  content?: number | string;
  variant?: BadgeVariant;
  color?: BadgeColor;
  position?: BadgePosition;
  max?: number;
  invisible?: boolean;
  /** Pulsing animation for live indicators. */
  pulse?: boolean;
  /** Badge scale. */
  size?: BadgeSize;
  /** Adjusts positioning for circular children (e.g. avatars). */
  overlap?: BadgeOverlap;
  children: ReactNode;
}

function formatContent(content: number | string | undefined, max: number): string | undefined {
  if (content === undefined) return undefined;
  if (typeof content === 'number' && content > max) return `${max}+`;
  return String(content);
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    className,
    content,
    variant = 'standard',
    color = 'neutral',
    position = 'top-right',
    max = 99,
    invisible = false,
    pulse = false,
    size = 'md',
    overlap = 'rectangular',
    children,
    ...props
  },
  ref,
) {
  const displayContent = variant === 'standard' ? formatContent(content, max) : undefined;

  return (
    <span ref={ref} className={cn(styles.Root, className)} data-ov-component="badge" {...props}>
      {children}
      <span
        className={styles.Badge}
        data-ov-variant={variant}
        data-ov-color={color}
        data-ov-position={position}
        data-ov-size={size}
        data-ov-overlap={overlap}
        data-ov-invisible={invisible ? 'true' : 'false'}
        data-ov-pulse={pulse ? 'true' : 'false'}
      >
        {displayContent}
      </span>
    </span>
  );
});

Badge.displayName = 'Badge';
