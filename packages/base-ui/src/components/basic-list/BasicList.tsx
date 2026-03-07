import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import { List } from '../list';
import type { ListRootProps, ListItemProps } from '../list';
import styles from './BasicList.module.css';

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export type BasicListRootProps = ListRootProps;

const BasicListRoot = forwardRef<HTMLDivElement, BasicListRootProps>(
  function BasicListRoot({ className, variant = 'ghost', ...props }, ref) {
    return (
      <List.Root
        ref={ref}
        className={cn(styles.Root, className)}
        variant={variant}
        {...props}
      />
    );
  },
);

// ---------------------------------------------------------------------------
// Item (extends List.Item with optional secondaryAction)
// ---------------------------------------------------------------------------

export type BasicListItemProps = ListItemProps;

const BasicListItem = forwardRef<HTMLDivElement, BasicListItemProps>(
  function BasicListItem({ className, ...props }, ref) {
    return (
      <List.Item
        ref={ref}
        className={cn(styles.Item, className)}
        {...props}
      />
    );
  },
);

// ---------------------------------------------------------------------------
// ItemBadge (new slot)
// ---------------------------------------------------------------------------

export type BasicListItemBadgeProps = HTMLAttributes<HTMLSpanElement>;

const BasicListItemBadge = forwardRef<HTMLSpanElement, BasicListItemBadgeProps>(
  function BasicListItemBadge({ className, ...props }, ref) {
    return <span ref={ref} className={cn(styles.ItemBadge, className)} {...props} />;
  },
);

// ---------------------------------------------------------------------------
// ItemChevron (new slot)
// ---------------------------------------------------------------------------

export type BasicListItemChevronProps = HTMLAttributes<HTMLSpanElement>;

const BasicListItemChevron = forwardRef<HTMLSpanElement, BasicListItemChevronProps>(
  function BasicListItemChevron({ className, children, ...props }, ref) {
    return (
      <span ref={ref} className={cn(styles.ItemChevron, className)} aria-hidden="true" {...props}>
        {children ?? '\u203A'}
      </span>
    );
  },
);

// ---------------------------------------------------------------------------
// Display names
// ---------------------------------------------------------------------------

BasicListRoot.displayName = 'BasicList';
BasicListItem.displayName = 'BasicList.Item';
BasicListItemBadge.displayName = 'BasicList.ItemBadge';
BasicListItemChevron.displayName = 'BasicList.ItemChevron';

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

type BasicListCompound = typeof BasicListRoot & {
  Root: typeof BasicListRoot;
  Viewport: typeof List.Viewport;
  Item: typeof BasicListItem;
  ItemIcon: typeof List.ItemIcon;
  ItemLabel: typeof List.ItemLabel;
  ItemDescription: typeof List.ItemDescription;
  ItemMeta: typeof List.ItemMeta;
  ItemActions: typeof List.ItemActions;
  ItemBadge: typeof BasicListItemBadge;
  ItemChevron: typeof BasicListItemChevron;
  Group: typeof List.Group;
  GroupHeader: typeof List.GroupHeader;
  Separator: typeof List.Separator;
  Empty: typeof List.Empty;
  Loading: typeof List.Loading;
};

export const BasicList = Object.assign(BasicListRoot, {
  Root: BasicListRoot,
  Viewport: List.Viewport,
  Item: BasicListItem,
  ItemIcon: List.ItemIcon,
  ItemLabel: List.ItemLabel,
  ItemDescription: List.ItemDescription,
  ItemMeta: List.ItemMeta,
  ItemActions: List.ItemActions,
  ItemBadge: BasicListItemBadge,
  ItemChevron: BasicListItemChevron,
  Group: List.Group,
  GroupHeader: List.GroupHeader,
  Separator: List.Separator,
  Empty: List.Empty,
  Loading: List.Loading,
}) as BasicListCompound;
