import styles from './Typography.module.css';
import type { TruncationProps, TypographyBaseProps } from './types';
import { createTypographyPrimitive, type PolymorphicComponentProps } from './utils';

type CodeElement = 'code' | 'span';

export type CodeProps<E extends CodeElement = CodeElement> = PolymorphicComponentProps<
  E,
  TypographyBaseProps & TruncationProps
>;

export const Code = createTypographyPrimitive<'code', CodeElement>({
  displayName: 'Code',
  className: styles.Code,
  defaultAs: 'code',
});
