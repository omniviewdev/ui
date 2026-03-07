import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import type { ComponentSize } from '../../system/types';
import styles from './ScrollArea.module.css';

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: ScrollAreaOrientation;
  size?: ComponentSize;
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  function ScrollArea(
    { orientation = 'vertical', size = 'md', className, tabIndex = 0, role, ...props },
    ref,
  ) {
    // Only apply role="region" when an accessible name is provided to avoid unnamed landmarks
    const hasAccessibleName = !!(props['aria-label'] || props['aria-labelledby']);
    const resolvedRole = role ?? (hasAccessibleName ? 'region' : undefined);

    return (
      <div
        ref={ref}
        role={resolvedRole}
        tabIndex={tabIndex}
        className={cn(styles.Root, className)}
        data-ov-orientation={orientation}
        data-ov-size={size}
        {...props}
      />
    );
  },
);

ScrollArea.displayName = 'ScrollArea';
