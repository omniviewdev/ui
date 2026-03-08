import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './Skeleton.module.css';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  lines?: number;
  animation?: 'pulse' | 'wave' | 'none';
}

function toCss(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { variant = 'text', width, height, lines = 1, animation = 'pulse', className, style, ...props },
  ref,
) {
  const cssWidth = toCss(width);
  const cssHeight = toCss(height);

  if (variant === 'text' && lines > 1) {
    return (
      <div
        ref={ref}
        className={cn(styles.Wrapper, className)}
        data-ov-component="skeleton"
        data-ov-variant={variant}
        data-ov-animation={animation}
        style={style}
        {...props}
      >
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={styles.Root}
            data-ov-variant={variant}
            data-ov-animation={animation}
            style={{
              width: i === lines - 1 ? (cssWidth ? `calc(${cssWidth} * 0.8)` : '80%') : cssWidth,
              height: cssHeight,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(styles.Root, className)}
      data-ov-component="skeleton"
      data-ov-variant={variant}
      data-ov-animation={animation}
      style={{ width: cssWidth, height: cssHeight, ...style }}
      {...props}
    />
  );
});

Skeleton.displayName = 'Skeleton';
