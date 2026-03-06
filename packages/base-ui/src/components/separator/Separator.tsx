import { Separator as BaseSeparator } from '@base-ui/react/separator';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';
import { withBaseClassName } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps } from '../../system/types';
import styles from './Separator.module.css';

export type SeparatorOrientation = 'horizontal' | 'vertical';
export type SeparatorInset = 'none' | 'start' | 'end' | 'middle';
export type SeparatorLabelAlign = 'start' | 'center' | 'end';

export interface SeparatorProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseSeparator>, 'color'>, StyledComponentProps {
  orientation?: SeparatorOrientation;
  inset?: SeparatorInset;
  label?: ReactNode;
  labelAlign?: SeparatorLabelAlign;
  decorative?: boolean;
}

const SeparatorRoot = forwardRef<ElementRef<typeof BaseSeparator>, SeparatorProps>(
  function SeparatorRoot(
    {
      className,
      variant,
      color,
      size,
      orientation = 'horizontal',
      inset = 'none',
      label,
      labelAlign = 'center',
      decorative = false,
      'aria-hidden': ariaHidden,
      ...props
    },
    ref,
  ) {
    const hasLabel = label != null && label !== '' && orientation === 'horizontal';

    return (
      <BaseSeparator
        ref={ref}
        orientation={orientation}
        role={decorative ? 'presentation' : 'separator'}
        aria-orientation={decorative ? undefined : orientation}
        aria-hidden={decorative ? true : ariaHidden}
        className={withBaseClassName<BaseSeparator.State>(styles.Root, className)}
        data-ov-orientation={orientation}
        data-ov-inset={inset}
        data-ov-has-label={hasLabel ? 'true' : 'false'}
        data-ov-label-align={labelAlign}
        {...styleDataAttributes({ variant, color, size })}
        {...props}
      >
        {hasLabel ? <span className={styles.Label}>{label}</span> : null}
      </BaseSeparator>
    );
  },
);

SeparatorRoot.displayName = 'Separator';

type SeparatorCompound = typeof SeparatorRoot & {
  Root: typeof SeparatorRoot;
};

export const Separator = Object.assign(SeparatorRoot, {
  Root: SeparatorRoot,
}) as SeparatorCompound;
