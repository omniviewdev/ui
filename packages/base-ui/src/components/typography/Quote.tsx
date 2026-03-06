import styles from './Typography.module.css';
import type { TruncationProps, TypographyBaseProps } from './types';
import { createTypographyPrimitive, type PolymorphicComponentProps } from './utils';

type QuoteElement = 'q' | 'span';

export type QuoteProps<E extends QuoteElement = QuoteElement> = PolymorphicComponentProps<
  E,
  TypographyBaseProps & TruncationProps
>;

export const Quote = createTypographyPrimitive<'q', QuoteElement>({
  displayName: 'Quote',
  className: styles.Quote,
  defaultAs: 'q',
});
