import { createContext, forwardRef, useContext, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import { List } from '../list';
import type { ListRootProps, ListItemProps, ListGroupProps } from '../list';
import { useCollapsibleGroup } from './hooks/useCollapsibleGroup';
import styles from './NavList.module.css';

// Internal context for passing toggle from collapsible group to its header
const NavListGroupToggleContext = createContext<(() => void) | null>(null);

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface NavListRootProps extends Omit<ListRootProps, 'density'> {
  density?: ListRootProps['density'];
}

const NavListRoot = forwardRef<HTMLDivElement, NavListRootProps>(
  function NavListRoot({ className, variant = 'ghost', density = 'compact', ...props }, ref) {
    return (
      <List.Root
        ref={ref}
        className={cn(styles.Root, className)}
        variant={variant}
        density={density}
        {...props}
      />
    );
  },
);

// ---------------------------------------------------------------------------
// Item (with unread/dirty indicators)
// ---------------------------------------------------------------------------

export interface NavListItemProps extends ListItemProps {
  unread?: boolean;
  dirty?: boolean;
}

const NavListItem = forwardRef<HTMLDivElement, NavListItemProps>(
  function NavListItem({ className, unread = false, dirty = false, ...props }, ref) {
    return (
      <List.Item
        ref={ref}
        className={cn(styles.Item, className)}
        data-ov-unread={unread}
        data-ov-dirty={dirty}
        {...props}
      />
    );
  },
);

// ---------------------------------------------------------------------------
// Collapsible Group
// ---------------------------------------------------------------------------

export interface NavListGroupProps extends ListGroupProps {
  collapsible?: boolean;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

const NavListGroup = forwardRef<HTMLDivElement, NavListGroupProps>(
  function NavListGroup(
    {
      className,
      collapsible = false,
      defaultExpanded = true,
      expanded: expandedProp,
      onExpandedChange,
      children,
      ...props
    },
    ref,
  ) {
    const { expanded, toggle } = useCollapsibleGroup({
      expanded: expandedProp,
      defaultExpanded,
      onExpandedChange,
    });

    if (!collapsible) {
      return (
        <List.Group ref={ref} className={cn(styles.Group, className)} {...props}>
          {children}
        </List.Group>
      );
    }

    return (
      <NavListGroupToggleContext.Provider value={toggle}>
        <div
          ref={ref}
          role="group"
          className={cn(styles.Group, styles.collapsible, className)}
          data-ov-expanded={expanded}
          {...props}
        >
          {children}
        </div>
      </NavListGroupToggleContext.Provider>
    );
  },
);

// ---------------------------------------------------------------------------
// Collapsible Group Header
// ---------------------------------------------------------------------------

export interface NavListGroupHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const NavListGroupHeader = forwardRef<HTMLDivElement, NavListGroupHeaderProps>(
  function NavListGroupHeader({ className, onClick, children, ...props }, ref) {
    const toggle = useContext(NavListGroupToggleContext);

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      toggle?.();
      onClick?.(event);
    };

    return (
      <div
        ref={ref}
        role="presentation"
        className={cn(styles.GroupHeader, className)}
        onClick={handleClick}
        {...props}
      >
        {toggle && <span className={styles.GroupToggle} aria-hidden="true" />}
        <span className={styles.GroupHeaderLabel}>{children}</span>
      </div>
    );
  },
);

// ---------------------------------------------------------------------------
// Group Items (collapsible body)
// ---------------------------------------------------------------------------

export interface NavListGroupItemsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const NavListGroupItems = forwardRef<HTMLDivElement, NavListGroupItemsProps>(
  function NavListGroupItems({ className, ...props }, ref) {
    return (
      <div ref={ref} className={cn(styles.GroupItems, className)} {...props} />
    );
  },
);

// ---------------------------------------------------------------------------
// Display names
// ---------------------------------------------------------------------------

NavListRoot.displayName = 'NavList';
NavListItem.displayName = 'NavList.Item';
NavListGroup.displayName = 'NavList.Group';
NavListGroupHeader.displayName = 'NavList.GroupHeader';
NavListGroupItems.displayName = 'NavList.GroupItems';

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

type NavListCompound = typeof NavListRoot & {
  Root: typeof NavListRoot;
  Viewport: typeof List.Viewport;
  Item: typeof NavListItem;
  ItemIcon: typeof List.ItemIcon;
  ItemLabel: typeof List.ItemLabel;
  ItemDescription: typeof List.ItemDescription;
  ItemMeta: typeof List.ItemMeta;
  ItemActions: typeof List.ItemActions;
  Group: typeof NavListGroup;
  GroupHeader: typeof NavListGroupHeader;
  GroupItems: typeof NavListGroupItems;
  Separator: typeof List.Separator;
  Empty: typeof List.Empty;
  Loading: typeof List.Loading;
};

export const NavList = Object.assign(NavListRoot, {
  Root: NavListRoot,
  Viewport: List.Viewport,
  Item: NavListItem,
  ItemIcon: List.ItemIcon,
  ItemLabel: List.ItemLabel,
  ItemDescription: List.ItemDescription,
  ItemMeta: List.ItemMeta,
  ItemActions: List.ItemActions,
  Group: NavListGroup,
  GroupHeader: NavListGroupHeader,
  GroupItems: NavListGroupItems,
  Separator: List.Separator,
  Empty: List.Empty,
  Loading: List.Loading,
}) as NavListCompound;
