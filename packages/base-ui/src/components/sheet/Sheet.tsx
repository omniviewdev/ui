import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps, SurfaceElevation, SurfaceType } from '../../system/types';
import styles from './Sheet.module.css';

/** @deprecated Use `SurfaceElevation` from `system/types` instead. */
export type SheetElevation = SurfaceElevation;
/** @deprecated Use `SurfaceType` from `system/types` instead. */
export type SheetSurface = SurfaceType;

export interface SheetProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>, StyledComponentProps {
  as?: 'div' | 'section' | 'article' | 'aside' | 'main' | 'nav' | 'header' | 'footer';
  elevation?: SurfaceElevation;
  surface?: SurfaceType;
}

const SheetRoot = forwardRef<HTMLElement, SheetProps>(function Sheet(
  {
    as: Element = 'div',
    className,
    variant,
    color,
    size,
    elevation = 0,
    surface = 'default',
    ...props
  },
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
