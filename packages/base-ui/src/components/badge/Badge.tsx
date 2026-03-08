import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import styles from './Badge.module.css';

export type BadgeVariant = 'standard' | 'dot';
export type BadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  content?: number | string;
  variant?: BadgeVariant;
  color?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
  position?: BadgePosition;
  max?: number;
  invisible?: boolean;
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
        data-ov-invisible={invisible ? 'true' : 'false'}
      >
        {displayContent}
      </span>
    </span>
  );
});

Badge.displayName = 'Badge';
