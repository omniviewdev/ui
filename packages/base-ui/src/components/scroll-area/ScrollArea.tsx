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
    { orientation = 'vertical', size = 'md', className, tabIndex = 0, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
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
