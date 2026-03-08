import { Children, forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import { Separator } from '../separator';
import styles from './Stack.module.css';

export type StackSpacing = 0 | 1 | 2 | 3 | 4;
export type StackDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export interface StackProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'nav' | 'ul' | 'ol';
  direction?: StackDirection;
  spacing?: StackSpacing;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  divider?: boolean;
}

const StackRoot = forwardRef<HTMLElement, StackProps>(function Stack(
  {
    as: Element = 'div',
    className,
    direction = 'column',
    spacing = 2,
    align,
    justify,
    wrap,
    divider,
    children,
    ...props
  },
  ref,
) {
  const isHorizontal = direction === 'row' || direction === 'row-reverse';

  const isList = Element === 'ul' || Element === 'ol';

  let content: ReactNode = children;
  if (divider && !isList) {
    const items = Children.toArray(children);
    const interleaved: ReactNode[] = [];
    items.forEach((child, index) => {
      if (index > 0) {
        interleaved.push(
          <Separator
            key={`divider-${index}`}
            orientation={isHorizontal ? 'vertical' : 'horizontal'}
            decorative
          />,
        );
      }
      interleaved.push(child);
    });
    content = interleaved;
  }

  return (
    <Element
      ref={ref as never}
      className={cn(styles.Root, className)}
      data-ov-direction={direction}
      data-ov-spacing={String(spacing)}
      data-ov-align={align || undefined}
      data-ov-justify={justify || undefined}
      data-ov-wrap={wrap ? 'true' : undefined}
      data-ov-divider={divider ? 'true' : undefined}
      {...props}
    >
      {content}
    </Element>
  );
});

StackRoot.displayName = 'Stack';

export const Stack = StackRoot;
