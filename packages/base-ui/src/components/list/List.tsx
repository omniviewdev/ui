import { forwardRef, useCallback, useId, useMemo, useRef, useSyncExternalStore, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { ListRootProps, ListViewportProps, ListItemProps, ListGroupProps } from './types';
import { useListState } from './hooks/useListState';
import { useListItem as useListItemHook } from './hooks/useListItem';
import { useListFocus } from './hooks/useListFocus';
import { useTypeahead } from './hooks/useTypeahead';
import {
  ListConfigContext,
  ListStoreContext,
  ListActionsContext,
  useListConfig,
  useListStoreContext,
  useListActions,
} from './context/ListContext';
import styles from './List.module.css';

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const ListRoot = forwardRef<HTMLDivElement, ListRootProps>(
  function ListRoot(
    {
      className,
      variant,
      color,
      size,
      children,
      loading,
      error,
      onKeyDown,
      // Strip list-specific props from DOM spread
      selectionMode: _selectionMode,
      selectionBehavior: _selectionBehavior,
      selectedKeys: _selectedKeys,
      defaultSelectedKeys: _defaultSelectedKeys,
      onSelectedKeysChange: _onSelectedKeysChange,
      activeKey: _activeKey,
      defaultActiveKey: _defaultActiveKey,
      onActiveKeyChange: _onActiveKeyChange,
      disabledKeys: _disabledKeys,
      orientation: _orientation,
      loopFocus: _loopFocus,
      typeahead: _typeahead,
      density: _density,
      virtualized: _virtualized,
      overscan: _overscan,
      estimatedItemSize: _estimatedItemSize,
      ...props
    },
    ref,
  ) {
    const { config, store, actions } = useListState({
      selectionMode: _selectionMode,
      selectionBehavior: _selectionBehavior,
      selectedKeys: _selectedKeys,
      defaultSelectedKeys: _defaultSelectedKeys,
      onSelectedKeysChange: _onSelectedKeysChange,
      activeKey: _activeKey,
      defaultActiveKey: _defaultActiveKey,
      onActiveKeyChange: _onActiveKeyChange,
      disabledKeys: _disabledKeys,
      orientation: _orientation,
      loopFocus: _loopFocus,
      typeahead: _typeahead,
      density: _density,
      virtualized: _virtualized,
      overscan: _overscan,
      estimatedItemSize: _estimatedItemSize,
      loading,
      children,
    });

    const listId = useId();
    const fullConfig = useMemo(
      () => ({ ...config, listId }),
      [config, listId],
    );
    const { handleKeyDown } = useListFocus({ config: fullConfig, actions, store });
    const { handleTypeahead } = useTypeahead({
      enabled: config.typeahead,
      actions,
      store,
    });

    // Derive the active descendant ID for aria-activedescendant
    const activeDescendantId = useSyncExternalStore(
      store.subscribe,
      () => {
        const snapshot = store.getSnapshot();
        return snapshot.activeKey != null ? `${listId}-item-${snapshot.activeKey}` : undefined;
      },
      () => undefined,
    );

    const combinedKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        handleKeyDown(event);
        handleTypeahead(event);
        onKeyDown?.(event);
      },
      [handleKeyDown, handleTypeahead, onKeyDown],
    );

    return (
      <ListConfigContext.Provider value={fullConfig}>
        <ListStoreContext.Provider value={store}>
          <ListActionsContext.Provider value={actions}>
            <div
              ref={ref}
              role="listbox"
              tabIndex={0}
              aria-multiselectable={fullConfig.selectionMode === 'multiple' ? true : undefined}
              aria-activedescendant={activeDescendantId}
              className={cn(styles.Root, className)}
              data-ov-density={fullConfig.density}
              data-ov-list-id={listId}
              onKeyDown={combinedKeyDown}
              {...styleDataAttributes({ variant, color, size })}
              {...props}
            >
              {error ? (
                <div className={styles.Empty}>{error}</div>
              ) : (
                children
              )}
            </div>
          </ListActionsContext.Provider>
        </ListStoreContext.Provider>
      </ListConfigContext.Provider>
    );
  },
);

// ---------------------------------------------------------------------------
// Viewport
// ---------------------------------------------------------------------------

const ListViewport = forwardRef<HTMLDivElement, ListViewportProps>(
  function ListViewport({ className, onReachEnd, children, ...props }, ref) {
    const config = useListConfig();
    const scrollRef = useRef<HTMLDivElement>(null);
    const hasReachedEndRef = useRef(false);

    const handleScroll = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;

      const atEnd = config.orientation === 'horizontal'
        ? el.scrollLeft + el.clientWidth >= el.scrollWidth - 1
        : el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

      if (atEnd && !hasReachedEndRef.current) {
        hasReachedEndRef.current = true;
        onReachEnd?.();
      } else if (!atEnd) {
        hasReachedEndRef.current = false;
      }
    }, [onReachEnd, config.orientation]);

    return (
      <div
        ref={(node) => {
          scrollRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        role="presentation"
        className={cn(styles.Viewport, className)}
        onScroll={handleScroll}
        {...props}
      >
        {children}
      </div>
    );
  },
);

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

const ListItem = forwardRef<HTMLDivElement, ListItemProps>(
  function ListItem(
    { className, itemKey, disabled = false, textValue, children, onClick, ...props },
    ref,
  ) {
    const store = useListStoreContext();
    const actions = useListActions();
    const config = useListConfig();
    const itemState = useListItemHook(store, itemKey, textValue);

    const isDisabled = disabled || itemState.isDisabled;

    const handleClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        if (isDisabled) {
          onClick?.(event);
          return;
        }

        actions.setActiveKey(itemKey);

        if (config.selectionMode !== 'none') {
          if (event.shiftKey && config.selectionMode === 'multiple') {
            actions.selectRange(itemKey);
          } else if ((event.metaKey || event.ctrlKey) && config.selectionMode === 'multiple') {
            actions.toggle(itemKey);
          } else if (config.selectionBehavior === 'toggle') {
            actions.toggle(itemKey);
          } else {
            actions.select(itemKey);
          }
        }

        onClick?.(event);
      },
      [isDisabled, config.selectionMode, config.selectionBehavior, actions, itemKey, onClick],
    );

    return (
      <div
        ref={ref}
        id={`${config.listId}-item-${itemKey}`}
        role="option"
        aria-selected={itemState.isSelected || undefined}
        aria-disabled={isDisabled || undefined}
        className={cn(styles.Item, className)}
        data-ov-selected={itemState.isSelected}
        data-ov-active={itemState.isActive}
        data-ov-disabled={isDisabled}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    );
  },
);

// ---------------------------------------------------------------------------
// Presentational slots (no state subscription)
// ---------------------------------------------------------------------------

const ListItemIcon = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function ListItemIcon({ className, ...props }, ref) {
    return <span ref={ref} className={cn(styles.ItemIcon, className)} {...props} />;
  },
);

const ListItemLabel = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function ListItemLabel({ className, ...props }, ref) {
    return <span ref={ref} className={cn(styles.ItemLabel, className)} {...props} />;
  },
);

const ListItemDescription = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function ListItemDescription({ className, ...props }, ref) {
    return <span ref={ref} className={cn(styles.ItemDescription, className)} {...props} />;
  },
);

const ListItemMeta = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function ListItemMeta({ className, ...props }, ref) {
    return <span ref={ref} className={cn(styles.ItemMeta, className)} {...props} />;
  },
);

const ListItemActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ListItemActions({ className, ...props }, ref) {
    return <div ref={ref} className={cn(styles.ItemActions, className)} {...props} />;
  },
);

// ---------------------------------------------------------------------------
// Structural
// ---------------------------------------------------------------------------

const ListGroup = forwardRef<HTMLDivElement, ListGroupProps>(
  function ListGroup({ className, ...props }, ref) {
    return (
      <div ref={ref} role="group" className={cn(styles.Group, className)} {...props} />
    );
  },
);

const ListGroupHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ListGroupHeader({ className, ...props }, ref) {
    return (
      <div ref={ref} role="presentation" className={cn(styles.GroupHeader, className)} {...props} />
    );
  },
);

const ListSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ListSeparator({ className, ...props }, ref) {
    return (
      <div ref={ref} role="separator" className={cn(styles.Separator, className)} {...props} />
    );
  },
);

export interface ListEmptyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const ListEmpty = forwardRef<HTMLDivElement, ListEmptyProps>(
  function ListEmpty({ className, ...props }, ref) {
    return <div ref={ref} className={cn(styles.Empty, className)} {...props} />;
  },
);

export interface ListLoadingProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const ListLoading = forwardRef<HTMLDivElement, ListLoadingProps>(
  function ListLoading({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={cn(styles.Loading, className)} {...props}>
        {children ?? 'Loading\u2026'}
      </div>
    );
  },
);

// ---------------------------------------------------------------------------
// Display names
// ---------------------------------------------------------------------------

ListRoot.displayName = 'List';
ListViewport.displayName = 'List.Viewport';
ListItem.displayName = 'List.Item';
ListItemIcon.displayName = 'List.ItemIcon';
ListItemLabel.displayName = 'List.ItemLabel';
ListItemDescription.displayName = 'List.ItemDescription';
ListItemMeta.displayName = 'List.ItemMeta';
ListItemActions.displayName = 'List.ItemActions';
ListGroup.displayName = 'List.Group';
ListGroupHeader.displayName = 'List.GroupHeader';
ListSeparator.displayName = 'List.Separator';
ListEmpty.displayName = 'List.Empty';
ListLoading.displayName = 'List.Loading';

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

type ListCompound = typeof ListRoot & {
  Root: typeof ListRoot;
  Viewport: typeof ListViewport;
  Item: typeof ListItem;
  ItemIcon: typeof ListItemIcon;
  ItemLabel: typeof ListItemLabel;
  ItemDescription: typeof ListItemDescription;
  ItemMeta: typeof ListItemMeta;
  ItemActions: typeof ListItemActions;
  Group: typeof ListGroup;
  GroupHeader: typeof ListGroupHeader;
  Separator: typeof ListSeparator;
  Empty: typeof ListEmpty;
  Loading: typeof ListLoading;
};

export const List = Object.assign(ListRoot, {
  Root: ListRoot,
  Viewport: ListViewport,
  Item: ListItem,
  ItemIcon: ListItemIcon,
  ItemLabel: ListItemLabel,
  ItemDescription: ListItemDescription,
  ItemMeta: ListItemMeta,
  ItemActions: ListItemActions,
  Group: ListGroup,
  GroupHeader: ListGroupHeader,
  Separator: ListSeparator,
  Empty: ListEmpty,
  Loading: ListLoading,
}) as ListCompound;
