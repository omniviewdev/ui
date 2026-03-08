import {
  forwardRef,
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useSyncExternalStore,
  Fragment,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  type CSSProperties,
} from 'react';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { ComponentColor } from '../../system/types';
import type { TreeListRootProps, TreeListItemProps, TreeNodeMeta, FlatNode, Key } from './types';
import { useTreeState } from './hooks/useTreeState';
import { useTreeItem as useTreeItemHook } from './hooks/useTreeItem';
import { useTreeFocus } from './hooks/useTreeFocus';
import { useListVirtualizer } from '../list/hooks/useListVirtualizer';
import { useTypeahead } from '../list/hooks/useTypeahead';
import {
  TreeConfigContext,
  TreeStoreContext,
  TreeActionsContext,
  useTreeConfig,
  useTreeStoreContext,
  useTreeActions,
} from './context/TreeContext';
import styles from './TreeList.module.css';

// ---------------------------------------------------------------------------
// RenderNode context — typed without TItem. Root closes over the generic;
// Viewport only sees (key, node) → ReactNode.
// ---------------------------------------------------------------------------

type RenderNodeFn = (key: Key, node: TreeNodeMeta) => ReactNode;

const RenderNodeContext = createContext<RenderNodeFn | null>(null);

function useRenderNode(): RenderNodeFn {
  const ctx = useContext(RenderNodeContext);
  if (!ctx) {
    throw new Error('TreeList.Viewport must be used within <TreeList.Root>');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

function TreeListRootImpl<TItem>(
  {
    className,
    variant,
    color,
    size,
    children,
    loading,
    error,
    onKeyDown,
    // Extract tree-specific props so they don't spread to DOM
    items,
    itemKey,
    getChildren,
    isBranch: isBranchProp,
    getTextValue,
    renderItem,
    loadChildren,
    onLoadError,
    selectionMode,
    selectionBehavior,
    selectedKeys: selectedKeysProp,
    defaultSelectedKeys,
    onSelectedKeysChange,
    activeKey: activeKeyProp,
    defaultActiveKey,
    onActiveKeyChange,
    disabledKeys: disabledKeysProp,
    expandedKeys: expandedKeysProp,
    defaultExpandedKeys,
    onExpandedKeysChange,
    loopFocus,
    typeahead,
    density,
    virtualized,
    overscan,
    estimatedItemSize,
    indentation,
    showBranchConnectors,
    filterText: filterTextProp,
    defaultFilterText,
    onFilterTextChange,
    filterFn,
    ...domProps
  }: TreeListRootProps<TItem>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { config, store, actions } = useTreeState<TItem>({
    items,
    itemKey,
    getChildren,
    isBranch: isBranchProp,
    getTextValue,
    renderItem,
    loadChildren,
    onLoadError,
    selectionMode,
    selectionBehavior,
    selectedKeys: selectedKeysProp,
    defaultSelectedKeys,
    onSelectedKeysChange,
    activeKey: activeKeyProp,
    defaultActiveKey,
    onActiveKeyChange,
    disabledKeys: disabledKeysProp,
    expandedKeys: expandedKeysProp,
    defaultExpandedKeys,
    onExpandedKeysChange,
    loopFocus,
    typeahead,
    density,
    virtualized,
    overscan,
    estimatedItemSize,
    indentation,
    showBranchConnectors,
    filterText: filterTextProp,
    defaultFilterText,
    onFilterTextChange,
    filterFn,
    loading,
    children,
  });

  const listId = useId();
  const fullConfig = useMemo(
    () => ({ ...config, listId }),
    [config, listId],
  );

  // Build an O(1) lookup map from flat nodes so renderNode avoids O(n) scans
  const flatNodesMapRef = useRef<Map<Key, FlatNode>>(new Map());
  const currentFlatNodes = store.getFlatNodes();
  // Rebuild map each render from the latest store state
  const map = new Map<Key, FlatNode>();
  for (const node of currentFlatNodes) map.set(node.key, node);
  flatNodesMapRef.current = map;

  const renderNode: RenderNodeFn = useCallback(
    (key: Key, node: TreeNodeMeta) => {
      const flat = flatNodesMapRef.current.get(key);
      if (!flat) return null;
      return renderItem(flat.item as TItem, node);
    },
    [renderItem],
  );

  const { handleKeyDown } = useTreeFocus({ config: fullConfig, actions, store });

  // Adapt tree store to List-shaped store for typeahead reuse
  const typeaheadStore = useMemo(() => ({
    getRegisteredKeys: store.getRegisteredKeys,
    getSnapshot: () => {
      const snap = store.getSnapshot();
      return {
        selectedKeys: snap.selectedKeys,
        activeKey: snap.activeKey,
        disabledKeys: snap.disabledKeys,
        registeredKeys: [...snap.flattenedKeys],
      };
    },
    getTextValue: store.getTextValue,
    subscribe: store.subscribe,
    getItemState: store.getItemState,
    setSelectedKeys: store.setSelectedKeys,
    setActiveKey: store.setActiveKey,
    registerItem: () => () => {},
  }), [store]);

  const typeaheadActions = useMemo(() => ({
    select: actions.select,
    deselect: actions.deselect,
    toggle: actions.toggle,
    selectRange: actions.selectRange,
    selectAll: actions.selectAll,
    clearSelection: actions.clearSelection,
    setActiveKey: actions.setActiveKey,
    registerItem: () => () => {},
  }), [actions]);

  const { handleTypeahead } = useTypeahead({
    enabled: config.typeahead,
    actions: typeaheadActions,
    store: typeaheadStore,
  });

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
    <RenderNodeContext.Provider value={renderNode}>
      <TreeConfigContext.Provider value={fullConfig}>
        <TreeStoreContext.Provider value={store}>
          <TreeActionsContext.Provider value={actions}>
            <div
              ref={ref}
              role="tree"
              tabIndex={0}
              aria-multiselectable={fullConfig.selectionMode === 'multiple' ? true : undefined}
              aria-activedescendant={activeDescendantId}
              className={cn(styles.Root, className)}
              data-ov-density={fullConfig.density}
              data-ov-list-id={listId}
              onKeyDown={combinedKeyDown}
              {...styleDataAttributes({ variant, color, size })}
              {...domProps}
            >
              {error ? (
                <div className={styles.Empty}>{error}</div>
              ) : (
                children
              )}
            </div>
          </TreeActionsContext.Provider>
        </TreeStoreContext.Provider>
      </TreeConfigContext.Provider>
    </RenderNodeContext.Provider>
  );
}

// Generic forwardRef via type assertion — the standard React pattern
const TreeListRoot = forwardRef(TreeListRootImpl) as <TItem>(
  props: TreeListRootProps<TItem> & { ref?: Ref<HTMLDivElement> },
) => ReactNode;

// ---------------------------------------------------------------------------
// Viewport
// ---------------------------------------------------------------------------

type TreeListViewportProps = HTMLAttributes<HTMLDivElement>;

function mergeRefs<T>(
  localRef: RefObject<T | null>,
  forwardedRef: Ref<T> | null,
): (node: T | null) => void {
  return (node) => {
    (localRef as { current: T | null }).current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) (forwardedRef as { current: T | null }).current = node;
  };
}

const TreeListViewport = forwardRef<HTMLDivElement, TreeListViewportProps>(
  function TreeListViewport({ className, children, ...props }, ref) {
    const config = useTreeConfig();
    const store = useTreeStoreContext();
    const scrollRef = useRef<HTMLDivElement>(null);
    const renderNode = useRenderNode();

    // Subscribe to the full snapshot so the Viewport re-renders when any
    // store state changes (loading, expanded, selection) — not only when
    // flatNodes changes. This ensures renderItem sees live nodeMeta flags.
    const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    const flatNodes = store.getFlatNodes();
    // Reference snapshot to prevent tree-shaking / unused-var lint
    void snapshot;

    const virtualizer = useListVirtualizer({
      count: flatNodes.length,
      scrollRef,
      enabled: config.virtualized,
      estimatedItemSize: 36,
    });

    const mergedRef = mergeRefs(scrollRef, ref);

    if (config.virtualized) {
      return (
        <div
          ref={mergedRef}
          role="presentation"
          className={cn(styles.Viewport, className)}
          {...props}
        >
          <div style={{ height: virtualizer.totalSize, position: 'relative' }}>
            {virtualizer.virtualItems.map((virtualItem) => {
              const node = flatNodes[virtualItem.index];
              if (!node) return null;
              const nodeMeta = store.getNodeMeta(node.key);
              if (!nodeMeta) return null;
              return (
                <div
                  key={node.key}
                  ref={virtualizer.measureElement}
                  data-index={virtualItem.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  {renderNode(node.key, nodeMeta)}
                </div>
              );
            })}
          </div>
          {children}
        </div>
      );
    }

    // Non-virtualized: render all flat nodes
    return (
      <div
        ref={mergedRef}
        role="presentation"
        className={cn(styles.Viewport, className)}
        {...props}
      >
        {flatNodes.map((node) => {
          const nodeMeta = store.getNodeMeta(node.key);
          if (!nodeMeta) return null;
          return (
            <Fragment key={node.key}>
              {renderNode(node.key, nodeMeta)}
            </Fragment>
          );
        })}
        {children}
      </div>
    );
  },
);

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

const TreeListItem = forwardRef<HTMLDivElement, TreeListItemProps>(
  function TreeListItem(
    { className, itemKey, disabled = false, textValue, children, onClick, ...props },
    ref,
  ) {
    const store = useTreeStoreContext();
    const actions = useTreeActions();
    const config = useTreeConfig();
    const itemState = useTreeItemHook(store, itemKey, textValue);
    const nodeMeta = store.getNodeMeta(itemKey);

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
        role="treeitem"
        aria-selected={itemState.isSelected || undefined}
        aria-disabled={isDisabled || undefined}
        aria-expanded={itemState.isBranch ? itemState.isExpanded : undefined}
        aria-level={nodeMeta ? nodeMeta.depth + 1 : undefined}
        className={cn(styles.Item, className)}
        data-ov-selected={itemState.isSelected}
        data-ov-active={itemState.isActive}
        data-ov-disabled={isDisabled}
        data-ov-expanded={itemState.isBranch ? itemState.isExpanded : undefined}
        data-ov-branch={itemState.isBranch || undefined}
        data-ov-depth={nodeMeta?.depth}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    );
  },
);

// ---------------------------------------------------------------------------
// ItemIndent
// ---------------------------------------------------------------------------

interface TreeListItemIndentProps extends HTMLAttributes<HTMLSpanElement> {
  depth?: number;
  ancestorIsLast?: boolean[];
  isLastChild?: boolean;
}

const TreeListItemIndent = forwardRef<HTMLSpanElement, TreeListItemIndentProps>(
  function TreeListItemIndent({ className, depth = 0, ancestorIsLast, isLastChild, style, ...props }, ref) {
    const config = useTreeConfig();

    // When branch connectors are enabled, render individual guide segments
    if (config.showBranchConnectors && depth > 0) {
      return (
        <span
          ref={ref}
          className={cn(styles.ItemIndent, className)}
          data-ov-guides=""
          style={{
            ...style,
            '--_ov-tree-indent': `${config.indentation}px`,
          } as CSSProperties}
          {...props}
        >
          {Array.from({ length: depth }, (_, i) => {
            const isConnector = i === depth - 1;
            // Pass-through: show vertical line if ancestor at this depth is NOT last
            const showLine = !isConnector && !(ancestorIsLast?.[i] ?? true);

            return (
              <span
                key={i}
                className={styles.ItemGuide}
                data-ov-line={showLine ? '' : undefined}
                data-ov-connector={isConnector ? (isLastChild ? 'last' : 'mid') : undefined}
              />
            );
          })}
        </span>
      );
    }

    return (
      <span
        ref={ref}
        className={cn(styles.ItemIndent, className)}
        style={{
          ...style,
          '--tree-depth': depth,
          '--_ov-tree-indent': `${config.indentation}px`,
        } as CSSProperties}
        {...props}
      />
    );
  },
);

// ---------------------------------------------------------------------------
// ItemToggle
// ---------------------------------------------------------------------------

interface TreeListItemToggleProps extends HTMLAttributes<HTMLButtonElement> {
  itemKey?: Key;
}

const TreeListItemToggle = forwardRef<HTMLButtonElement, TreeListItemToggleProps>(
  function TreeListItemToggle({ className, itemKey: itemKeyProp, onClick, ...props }, ref) {
    const actions = useTreeActions();
    const store = useTreeStoreContext();

    // Subscribe reactively so loading/expanded state triggers re-render
    const itemState = useTreeItemHook(
      store,
      itemKeyProp ?? '',
    );

    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (itemKeyProp != null) {
          actions.toggleExpanded(itemKeyProp);
        }
        onClick?.(event);
      },
      [actions, itemKeyProp, onClick],
    );

    const isBranch = itemKeyProp != null ? itemState.isBranch : false;
    const isExpanded = itemKeyProp != null ? itemState.isExpanded : false;
    const isLoading = itemKeyProp != null ? itemState.isLoading : false;

    return (
      <button
        ref={ref}
        type="button"
        tabIndex={-1}
        className={cn(styles.ItemToggle, className)}
        data-ov-expanded={isExpanded}
        data-ov-leaf={!isBranch || undefined}
        data-ov-loading={isLoading || undefined}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
        }}
        aria-label={isExpanded ? 'Collapse' : 'Expand'}
        {...props}
      >
        {isLoading ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    );
  },
);

// ---------------------------------------------------------------------------
// Presentational slots
// ---------------------------------------------------------------------------

const TreeListItemIcon = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function TreeListItemIcon({ className, ...props }, ref) {
    return <span ref={ref} className={cn(styles.ItemIcon, className)} {...props} />;
  },
);

const TreeListItemLabel = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function TreeListItemLabel({ className, ...props }, ref) {
    return <span ref={ref} className={cn(styles.ItemLabel, className)} {...props} />;
  },
);

const TreeListItemDescription = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function TreeListItemDescription({ className, ...props }, ref) {
    return <span ref={ref} className={cn(styles.ItemDescription, className)} {...props} />;
  },
);

const TreeListItemMeta = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function TreeListItemMeta({ className, ...props }, ref) {
    return <span ref={ref} className={cn(styles.ItemMeta, className)} {...props} />;
  },
);

interface TreeListItemBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: ComponentColor;
}

const TreeListItemBadge = forwardRef<HTMLSpanElement, TreeListItemBadgeProps>(
  function TreeListItemBadge({ className, color = 'neutral', ...props }, ref) {
    return (
      <span
        ref={ref}
        className={cn(styles.ItemBadge, className)}
        data-ov-color={color}
        {...props}
      />
    );
  },
);

const TreeListItemActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function TreeListItemActions({ className, ...props }, ref) {
    return <div ref={ref} className={cn(styles.ItemActions, className)} {...props} />;
  },
);

// ---------------------------------------------------------------------------
// Structural
// ---------------------------------------------------------------------------

interface TreeListEmptyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const TreeListEmpty = forwardRef<HTMLDivElement, TreeListEmptyProps>(
  function TreeListEmpty({ className, ...props }, ref) {
    const store = useTreeStoreContext();
    const visibleCount = useSyncExternalStore(
      store.subscribe,
      () => store.getSnapshot().visibleCount,
      () => 0,
    );

    if (visibleCount > 0) return null;
    return <div ref={ref} className={cn(styles.Empty, className)} {...props} />;
  },
);

interface TreeListLoadingProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const TreeListLoading = forwardRef<HTMLDivElement, TreeListLoadingProps>(
  function TreeListLoading({ className, children, ...props }, ref) {
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

(TreeListRoot as { displayName?: string }).displayName = 'TreeList';
TreeListViewport.displayName = 'TreeList.Viewport';
TreeListItem.displayName = 'TreeList.Item';
TreeListItemIndent.displayName = 'TreeList.ItemIndent';
TreeListItemToggle.displayName = 'TreeList.ItemToggle';
TreeListItemIcon.displayName = 'TreeList.ItemIcon';
TreeListItemLabel.displayName = 'TreeList.ItemLabel';
TreeListItemDescription.displayName = 'TreeList.ItemDescription';
TreeListItemMeta.displayName = 'TreeList.ItemMeta';
TreeListItemBadge.displayName = 'TreeList.ItemBadge';
TreeListItemActions.displayName = 'TreeList.ItemActions';
TreeListEmpty.displayName = 'TreeList.Empty';
TreeListLoading.displayName = 'TreeList.Loading';

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

type TreeListCompound = typeof TreeListRoot & {
  Root: typeof TreeListRoot;
  Viewport: typeof TreeListViewport;
  Item: typeof TreeListItem;
  ItemIndent: typeof TreeListItemIndent;
  ItemToggle: typeof TreeListItemToggle;
  ItemIcon: typeof TreeListItemIcon;
  ItemLabel: typeof TreeListItemLabel;
  ItemDescription: typeof TreeListItemDescription;
  ItemMeta: typeof TreeListItemMeta;
  ItemBadge: typeof TreeListItemBadge;
  ItemActions: typeof TreeListItemActions;
  Empty: typeof TreeListEmpty;
  Loading: typeof TreeListLoading;
};

export const TreeList = Object.assign(TreeListRoot, {
  Root: TreeListRoot,
  Viewport: TreeListViewport,
  Item: TreeListItem,
  ItemIndent: TreeListItemIndent,
  ItemToggle: TreeListItemToggle,
  ItemIcon: TreeListItemIcon,
  ItemLabel: TreeListItemLabel,
  ItemDescription: TreeListItemDescription,
  ItemMeta: TreeListItemMeta,
  ItemBadge: TreeListItemBadge,
  ItemActions: TreeListItemActions,
  Empty: TreeListEmpty,
  Loading: TreeListLoading,
}) as TreeListCompound;
