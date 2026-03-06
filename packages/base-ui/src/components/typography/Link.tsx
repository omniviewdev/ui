import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import { DEFAULT_SIZE } from '../../system/types';
import styles from './Typography.module.css';
import type { TruncationProps, TypographyBaseProps } from './types';
import { truncationData, truncationStyle, typographyData } from './utils';

export type LinkUnderline = 'always' | 'hover' | 'none';

export interface LinkProps
  extends
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'color'>,
    TypographyBaseProps,
    TruncationProps {
  underline?: LinkUnderline;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    className,
    size = DEFAULT_SIZE,
    tone = 'brand',
    truncate = false,
    underline = 'hover',
    style,
    ...props
  },
  ref,
) {
  return (
    <a
      ref={ref}
      className={cn(styles.Link, className)}
      data-ov-underline={underline}
      style={truncationStyle(style, truncate)}
      {...typographyData({ size, tone })}
      {...truncationData(truncate)}
      {...props}
    />
  );
});

Link.displayName = 'Link';
