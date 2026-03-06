import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import { DEFAULT_SIZE } from '../../system/types';
import styles from './Typography.module.css';
import type { TruncationProps, TypographyBaseProps, TypographyWeight } from './types';
import { truncationData, truncationStyle, typographyData } from './utils';

export interface TextProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>, TypographyBaseProps, TruncationProps {
  as?: 'span' | 'p' | 'div' | 'label';
  weight?: TypographyWeight;
  mono?: boolean;
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as: Element = 'span',
    className,
    size = DEFAULT_SIZE,
    tone = 'default',
    weight = 'regular',
    mono = false,
    truncate = false,
    style,
    ...props
  },
  ref,
) {
  return (
    <Element
      ref={ref as never}
      className={cn(styles.Text, className)}
      data-ov-weight={weight}
      data-ov-mono={mono ? 'true' : 'false'}
      style={truncationStyle(style, truncate)}
      {...typographyData({ size, tone })}
      {...truncationData(truncate)}
      {...props}
    />
  );
});

Text.displayName = 'Text';
