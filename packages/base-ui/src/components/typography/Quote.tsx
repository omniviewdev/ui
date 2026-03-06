import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import { DEFAULT_SIZE } from '../../system/types';
import styles from './Typography.module.css';
import type { TruncationProps, TypographyBaseProps } from './types';
import { truncationData, truncationStyle, typographyData } from './utils';

export interface QuoteProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>, TypographyBaseProps, TruncationProps {
  as?: 'q' | 'span';
}

export const Quote = forwardRef<HTMLElement, QuoteProps>(function Quote(
  {
    as: Element = 'q',
    className,
    size = DEFAULT_SIZE,
    tone = 'default',
    truncate = false,
    style,
    ...props
  },
  ref,
) {
  return (
    <Element
      ref={ref as never}
      className={cn(styles.Quote, className)}
      style={truncationStyle(style, truncate)}
      {...typographyData({ size, tone })}
      {...truncationData(truncate)}
      {...props}
    />
  );
});

Quote.displayName = 'Quote';
