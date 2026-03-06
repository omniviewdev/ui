import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import { DEFAULT_SIZE } from '../../system/types';
import styles from './Typography.module.css';
import type { TruncationProps, TypographyBaseProps } from './types';
import { truncationData, truncationStyle, typographyData } from './utils';

export interface OverlineProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>, TypographyBaseProps, TruncationProps {
  as?: 'span' | 'p' | 'div';
}

export const Overline = forwardRef<HTMLElement, OverlineProps>(function Overline(
  {
    as: Element = 'span',
    className,
    size = DEFAULT_SIZE,
    tone = 'muted',
    truncate = false,
    style,
    ...props
  },
  ref,
) {
  return (
    <Element
      ref={ref as never}
      className={cn(styles.Overline, className)}
      style={truncationStyle(style, truncate)}
      {...typographyData({ size, tone })}
      {...truncationData(truncate)}
      {...props}
    />
  );
});

Overline.displayName = 'Overline';
