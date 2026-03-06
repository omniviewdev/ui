import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import { DEFAULT_SIZE } from '../../system/types';
import styles from './Typography.module.css';
import type { BlockquoteVariant, TruncationProps, TypographyBaseProps } from './types';
import { truncationData, truncationStyle, typographyData } from './utils';

export interface BlockquoteProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>, TypographyBaseProps, TruncationProps {
  as?: 'blockquote' | 'div';
  variant?: BlockquoteVariant;
}

export const Blockquote = forwardRef<HTMLElement, BlockquoteProps>(function Blockquote(
  {
    as: Element = 'blockquote',
    className,
    size = DEFAULT_SIZE,
    tone = 'default',
    variant = 'emphasis',
    truncate = false,
    style,
    ...props
  },
  ref,
) {
  return (
    <Element
      ref={ref as never}
      className={cn(styles.Blockquote, className)}
      data-ov-variant={variant}
      style={truncationStyle(style, truncate)}
      {...typographyData({ size, tone })}
      {...truncationData(truncate)}
      {...props}
    />
  );
});

Blockquote.displayName = 'Blockquote';
