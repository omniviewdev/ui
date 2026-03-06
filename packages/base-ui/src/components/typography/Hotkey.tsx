import styles from './Typography.module.css';
import type { TruncationProps, TypographyBaseProps } from './types';
import { createTypographyPrimitive, type PolymorphicComponentProps } from './utils';

type HotkeyElement = 'kbd' | 'span';

export type HotkeyProps<E extends HotkeyElement = HotkeyElement> = PolymorphicComponentProps<
  E,
  TypographyBaseProps & TruncationProps
>;

export const Hotkey = createTypographyPrimitive<'kbd', HotkeyElement>({
  displayName: 'Hotkey',
  className: styles.Hotkey,
  defaultAs: 'kbd',
});
