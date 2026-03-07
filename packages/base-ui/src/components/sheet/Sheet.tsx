import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps } from '../../system/types';
import styles from './Sheet.module.css';

export type SheetElevation = 0 | 1 | 2 | 3;
export type SheetSurface = 'base' | 'default' | 'raised' | 'overlay' | 'inset' | 'elevated';

export interface SheetProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>, StyledComponentProps {
  as?: 'div' | 'section' | 'article' | 'aside' | 'main' | 'nav' | 'header' | 'footer';
  elevation?: SheetElevation;
  surface?: SheetSurface;
}

const SheetRoot = forwardRef<HTMLElement, SheetProps>(function Sheet(
  { as: Element = 'div', className, variant, color, size, elevation = 0, surface = 'default', ...props },
  ref,
) {
  return (
    <Element
      ref={ref as never}
      className={cn(styles.Root, className)}
      data-ov-elevation={elevation}
      data-ov-surface={surface}
      {...styleDataAttributes({ variant, color, size })}
      {...props}
    />
  );
});

SheetRoot.displayName = 'Sheet';

export const Sheet = SheetRoot;

const PaperRoot = forwardRef<HTMLElement, SheetProps>(function Paper(
  { elevation = 1, ...props },
  ref,
) {
  return <SheetRoot ref={ref} elevation={elevation} {...props} />;
});

PaperRoot.displayName = 'Paper';

export const Paper = PaperRoot;
