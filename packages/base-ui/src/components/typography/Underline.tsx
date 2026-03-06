import styles from './Typography.module.css';
import type { TruncationProps, TypographyBaseProps } from './types';
import { createTypographyPrimitive, type PolymorphicComponentProps } from './utils';

type UnderlineElement = 'u' | 'span';

export type UnderlineProps<E extends UnderlineElement = UnderlineElement> =
  PolymorphicComponentProps<E, TypographyBaseProps & TruncationProps>;

export const Underline = createTypographyPrimitive<'u', UnderlineElement>({
  displayName: 'Underline',
  className: styles.Underline,
  defaultAs: 'u',
});
