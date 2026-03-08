import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './Box.module.css';

export interface BoxProps extends HTMLAttributes<HTMLElement> {
  as?:
    | 'div'
    | 'span'
    | 'section'
    | 'article'
    | 'aside'
    | 'main'
    | 'nav'
    | 'header'
    | 'footer'
    | 'ul'
    | 'ol'
    | 'li';
}

const BoxRoot = forwardRef<HTMLElement, BoxProps>(function Box(
  { as: Element = 'div', className, ...props },
  ref,
) {
  return <Element ref={ref as never} className={cn(styles.Root, className)} {...props} />;
});

BoxRoot.displayName = 'Box';

export const Box = BoxRoot;
