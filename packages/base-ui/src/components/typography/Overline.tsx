import styles from './Typography.module.css';
import type { TruncationProps, TypographyBaseProps } from './types';
import { createTypographyPrimitive, type PolymorphicComponentProps } from './utils';

type OverlineElement = 'span' | 'p' | 'div';

export type OverlineProps<E extends OverlineElement = OverlineElement> = PolymorphicComponentProps<
  E,
  TypographyBaseProps & TruncationProps
>;

export const Overline = createTypographyPrimitive<'span', OverlineElement>({
  displayName: 'Overline',
  className: styles.Overline,
  defaultAs: 'span',
  defaultTone: 'muted',
});
