import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import { ClipboardText } from '../clipboard-text';
import styles from './DescriptionList.module.css';

export type DescriptionListLayout = 'horizontal' | 'vertical' | 'grid';
export type DescriptionListColumns = 1 | 2 | 3;

export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {
  layout?: DescriptionListLayout;
  columns?: DescriptionListColumns;
  size?: 'sm' | 'md' | 'lg';
}

export interface DescriptionListItemProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  copyable?: boolean;
  children?: ReactNode;
}

const DescriptionListRoot = forwardRef<HTMLDListElement, DescriptionListProps>(
  function DescriptionListRoot(
    { className, layout = 'horizontal', columns = 1, size = 'md', children, ...props },
    ref,
  ) {
    return (
      <dl
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-layout={layout}
        data-ov-size={size}
        data-ov-columns={columns}
        {...props}
      >
        {children}
      </dl>
    );
  },
);

const DescriptionListItem = forwardRef<HTMLDivElement, DescriptionListItemProps>(
  function DescriptionListItem({ className, label, copyable = false, children, ...props }, ref) {
    let value: ReactNode = children;

    if (copyable && (typeof children === 'string' || typeof children === 'number')) {
      const text = String(children);
      value = <ClipboardText value={text}>{text}</ClipboardText>;
    }

    return (
      <div ref={ref} className={cn(styles.Item, className)} {...props}>
        <dt className={styles.Label}>{label}</dt>
        <dd className={styles.Value}>{value}</dd>
      </div>
    );
  },
);

DescriptionListRoot.displayName = 'DescriptionList';
DescriptionListItem.displayName = 'DescriptionList.Item';

type DescriptionListCompound = typeof DescriptionListRoot & {
  Item: typeof DescriptionListItem;
};

export const DescriptionList = Object.assign(DescriptionListRoot, {
  Item: DescriptionListItem,
}) as DescriptionListCompound;
