import styles from './Typography.module.css';
import type { TruncationProps, TypographyBaseProps } from './types';
import { createTypographyPrimitive, type PolymorphicComponentProps } from './utils';

type StrongElement = 'strong' | 'span';

export type StrongProps<E extends StrongElement = StrongElement> = PolymorphicComponentProps<
  E,
  TypographyBaseProps & TruncationProps
>;

export const Strong = createTypographyPrimitive<'strong', StrongElement>({
  displayName: 'Strong',
  className: styles.Strong,
  defaultAs: 'strong',
});
