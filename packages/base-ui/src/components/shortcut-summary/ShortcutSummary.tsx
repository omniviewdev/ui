import {
  Fragment,
  forwardRef,
  useId,
  useSyncExternalStore,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../system/classnames';
import type { ComponentSize } from '../../system/types';
import styles from './ShortcutSummary.module.css';

export type ShortcutPlatform = 'mac' | 'windows' | 'linux' | 'auto';

export interface KeyChordProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  readonly keys: readonly string[];
  readonly platform?: ShortcutPlatform;
}

export interface ShortcutSummaryItem {
  readonly id: string;
  readonly keys: readonly string[];
  readonly description: ReactNode;
  readonly alternatives?: readonly (readonly string[])[];
}

export interface ShortcutSummaryProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'children'
> {
  readonly items: readonly ShortcutSummaryItem[];
  readonly title?: ReactNode;
  readonly platform?: ShortcutPlatform;
  readonly size?: ComponentSize;
}

const subscribe = () => () => {};
const serverPlatform = (): ShortcutPlatform => 'auto';
function browserPlatform(): ShortcutPlatform {
  if (typeof navigator === 'undefined') return 'auto';
  const platform = navigator.platform || navigator.userAgent;
  if (/mac|iphone|ipad|ipod/i.test(platform)) return 'mac';
  if (/win/i.test(platform)) return 'windows';
  if (/linux|android/i.test(platform)) return 'linux';
  return 'auto';
}

const keyLabels: Readonly<Record<string, readonly [string, string]>> = {
  control: ['Ctrl', 'Control'],
  ctrl: ['Ctrl', 'Control'],
  command: ['⌘', 'Command'],
  cmd: ['⌘', 'Command'],
  meta: ['⌘', 'Command'],
  '⌘': ['⌘', 'Command'],
  shift: ['Shift', 'Shift'],
  '⇧': ['⇧', 'Shift'],
  alt: ['Alt', 'Alt'],
  option: ['⌥', 'Option'],
  '⌥': ['⌥', 'Option'],
  arrowup: ['↑', 'Up arrow'],
  '↑': ['↑', 'Up arrow'],
  arrowdown: ['↓', 'Down arrow'],
  '↓': ['↓', 'Down arrow'],
  arrowleft: ['←', 'Left arrow'],
  '←': ['←', 'Left arrow'],
  arrowright: ['→', 'Right arrow'],
  '→': ['→', 'Right arrow'],
  enter: ['Enter', 'Enter'],
  return: ['↵', 'Return'],
  '↵': ['↵', 'Return'],
  escape: ['Esc', 'Escape'],
  esc: ['Esc', 'Escape'],
  space: ['Space', 'Space'],
  ' ': ['Space', 'Space'],
  backspace: ['⌫', 'Backspace'],
  '⌫': ['⌫', 'Backspace'],
  tab: ['Tab', 'Tab'],
  click: ['Click', 'Click'],
  'right-click': ['Right-click', 'Right click'],
  'double-click': ['Double-click', 'Double click'],
};

function keyLabel(key: string, platform: ShortcutPlatform): readonly [string, string] {
  if (key.toLowerCase() === 'mod') {
    if (platform === 'mac') return ['⌘', 'Command'];
    if (platform === 'auto') return ['Mod', 'Primary modifier'];
    return ['Ctrl', 'Control'];
  }
  const normalized = key.toLowerCase();
  return Object.prototype.hasOwnProperty.call(keyLabels, normalized)
    ? keyLabels[normalized]!
    : [key, key];
}

/** Display-only chord. Each key is a sibling keycap, never a nested kbd. */
export const KeyChord = forwardRef<HTMLSpanElement, KeyChordProps>(function KeyChord(
  { keys, platform = 'auto', className, 'aria-label': ariaLabel, ...props },
  ref,
) {
  // The server snapshot also seeds hydration; browser labels appear only afterward.
  const detectedPlatform = useSyncExternalStore(subscribe, browserPlatform, serverPlatform);
  const resolvedPlatform = platform === 'auto' ? detectedPlatform : platform;
  const labels = keys.map((key) => keyLabel(key, resolvedPlatform));
  return (
    <span
      {...props}
      ref={ref}
      className={cn(styles.Chord, className)}
      role={props.role ?? 'group'}
      aria-label={ariaLabel ?? labels.map(([, spoken]) => spoken).join(' plus ')}
    >
      {labels.map(([visual], index) => (
        <Fragment key={index}>
          {index > 0 && (
            <span className={styles.Join} aria-hidden="true">
              +
            </span>
          )}
          <kbd className={styles.Key} aria-hidden="true">
            {visual}
          </kbd>
        </Fragment>
      ))}
    </span>
  );
});

export const ShortcutSummary = forwardRef<HTMLDivElement, ShortcutSummaryProps>(
  function ShortcutSummary(
    {
      items,
      title,
      platform = 'auto',
      size = 'sm',
      className,
      'aria-labelledby': labelledBy,
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    return (
      <div
        {...props}
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-size={size}
        aria-labelledby={labelledBy ?? (title != null ? titleId : undefined)}
      >
        {title != null && (
          <h3 id={titleId} className={styles.Title}>
            {title}
          </h3>
        )}
        <dl className={styles.List}>
          {items.map((item) => (
            <div key={item.id} className={styles.Item}>
              <dt className={styles.Keys}>
                <KeyChord keys={item.keys} platform={platform} />
                {item.alternatives?.map((keys, index) => (
                  <Fragment key={index}>
                    <span className={styles.Or}>or</span>
                    <KeyChord keys={keys} platform={platform} />
                  </Fragment>
                ))}
              </dt>
              <dd className={styles.Description}>{item.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  },
);
