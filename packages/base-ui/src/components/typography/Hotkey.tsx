import { Fragment } from 'react';
import { LuCommand, LuPlus } from 'react-icons/lu';
import styles from './Typography.module.css';
import type { TruncationProps, TypographyBaseProps } from './types';
import {
  createTypographyPrimitive,
  type PolymorphicComponentProps,
  type PolymorphicRef,
} from './utils';

type HotkeyElement = 'kbd' | 'span';

export type HotkeyProps<E extends HotkeyElement = HotkeyElement> = PolymorphicComponentProps<
  E,
  TypographyBaseProps &
    TruncationProps & {
      /** Keys pressed together, rendered with a plus separator by default. */
      keys?: readonly string[];
    }
>;

const HotkeyPrimitive = createTypographyPrimitive<'kbd', HotkeyElement>({
  displayName: 'Hotkey',
  className: styles.Hotkey,
  defaultAs: 'kbd',
});

export function Hotkey<E extends HotkeyElement = 'kbd'>({
  keys,
  children,
  ...props
}: HotkeyProps<E> & { ref?: PolymorphicRef<E> }) {
  const chord = keys?.map((key) => ({
    key,
    label: key === 'Meta' || key === '⌘' ? 'Command' : key === 'Control' ? 'Ctrl' : key,
  }));
  return (
    <HotkeyPrimitive aria-label={chord?.map(({ label }) => label).join(' + ')} {...props}>
      {chord
        ? chord.map(({ key, label }, index) => (
            <Fragment key={`${index}:${key}`}>
              {index > 0 && (
                <span className={styles.HotkeySeparator} aria-hidden="true">
                  <LuPlus />
                </span>
              )}
              <span className={styles.HotkeyKey} aria-hidden="true">
                {key === 'Meta' || key === '⌘' ? <LuCommand /> : label}
              </span>
            </Fragment>
          ))
        : children}
    </HotkeyPrimitive>
  );
}
