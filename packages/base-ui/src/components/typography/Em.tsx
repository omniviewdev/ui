import styles from './Typography.module.css';
import type { TruncationProps, TypographyBaseProps } from './types';
import { createTypographyPrimitive, type PolymorphicComponentProps } from './utils';

type EmElement = 'em' | 'span';

export type EmProps<E extends EmElement = EmElement> = PolymorphicComponentProps<
  E,
  TypographyBaseProps & TruncationProps
>;

export const Em = createTypographyPrimitive<'em', EmElement>({
  displayName: 'Em',
  className: styles.Em,
  defaultAs: 'em',
});
