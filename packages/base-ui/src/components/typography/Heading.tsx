import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import { DEFAULT_SIZE } from '../../system/types';
import styles from './Typography.module.css';
import type { HeadingLevel, TruncationProps, TypographyBaseProps } from './types';
import { truncationData, truncationStyle, typographyData } from './utils';

export interface HeadingProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>, TypographyBaseProps, TruncationProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  level?: HeadingLevel;
}

export const Heading = forwardRef<HTMLElement, HeadingProps>(function Heading(
  {
    as,
    className,
    level = 2,
    size = DEFAULT_SIZE,
    tone = 'default',
    truncate = false,
    style,
    ...props
  },
  ref,
) {
  const Element = (as ?? (`h${level}` as const)) as NonNullable<HeadingProps['as']>;

  return (
    <Element
      ref={ref as never}
      className={cn(styles.Heading, className)}
      data-ov-level={String(level)}
      style={truncationStyle(style, truncate)}
      {...typographyData({ size, tone })}
      {...truncationData(truncate)}
      {...props}
    />
  );
});

Heading.displayName = 'Heading';
