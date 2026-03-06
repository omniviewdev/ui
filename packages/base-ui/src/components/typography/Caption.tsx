import styles from './Typography.module.css';
import type { TruncationProps, TypographyBaseProps } from './types';
import { createTypographyPrimitive, type PolymorphicComponentProps } from './utils';

type CaptionElement = 'span' | 'p' | 'div';

export type CaptionProps<E extends CaptionElement = CaptionElement> = PolymorphicComponentProps<
  E,
  TypographyBaseProps & TruncationProps
>;

export const Caption = createTypographyPrimitive<'span', CaptionElement>({
  displayName: 'Caption',
  className: styles.Caption,
  defaultAs: 'span',
  defaultTone: 'muted',
});
