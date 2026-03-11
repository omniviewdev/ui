import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './AspectRatio.module.css';

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  ratio?: number;
}

export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { ratio = 16 / 9, className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(styles.Root, className)}
      style={{ '--_aspect-ratio': ratio, ...style } as CSSProperties}
      {...props}
    />
  );
});

AspectRatio.displayName = 'AspectRatio';
