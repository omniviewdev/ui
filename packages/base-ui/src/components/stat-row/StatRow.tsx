import {
  Children,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../system/classnames';
import type { ComponentColor, ComponentSize } from '../../system/types';
import styles from './StatRow.module.css';

// ---------------------------------------------------------------------------
// StatRow (root)
// ---------------------------------------------------------------------------

export interface StatRowProps extends HTMLAttributes<HTMLDivElement> {
  /** Size of the row. Default: 'sm'. */
  size?: ComponentSize;
  /**
   * Separator character rendered between items.
   * Default: '·' (middle dot). Set to `null` to disable automatic separators.
   */
  separator?: string | null;
}

const StatRowRoot = forwardRef<HTMLDivElement, StatRowProps>(function StatRow(
  { className, size = 'sm', separator = '\u00B7', children, ...props },
  ref,
) {
  // Auto-insert dividers between StatRow.Item children
  const items = Children.toArray(children).filter(isValidElement);
  const separated: ReactNode[] = [];

  items.forEach((child, i) => {
    separated.push(child);
    if (separator != null && i < items.length - 1) {
      separated.push(
        <span key={`div-${i}`} className={styles.Divider} aria-hidden>
          {separator}
        </span>,
      );
    }
  });

  return (
    <div
      ref={ref}
      className={cn(styles.Root, className)}
      data-ov-size={size}
      {...props}
    >
      {separated}
    </div>
  );
});

StatRowRoot.displayName = 'StatRow';

// ---------------------------------------------------------------------------
// StatRow.Item
// ---------------------------------------------------------------------------

export interface StatRowItemProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  /** Optional icon rendered before the label. */
  icon?: ReactNode;
  /** Semantic color for this item. */
  color?: ComponentColor;
}

const StatRowItem = forwardRef<HTMLSpanElement, StatRowItemProps>(function StatRowItem(
  { icon, color, className, children, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(styles.Item, className)}
      data-ov-color={color ?? undefined}
      {...props}
    >
      {icon != null && (
        <span className={styles.ItemIcon} aria-hidden>
          {icon}
        </span>
      )}
      {children}
    </span>
  );
});

StatRowItem.displayName = 'StatRow.Item';

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

type StatRowCompound = typeof StatRowRoot & {
  Item: typeof StatRowItem;
};

export const StatRow = Object.assign(StatRowRoot, {
  Item: StatRowItem,
}) as StatRowCompound;
