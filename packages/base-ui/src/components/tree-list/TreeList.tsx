import {
  forwardRef,
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  Fragment,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { ComponentColor } from '../../system/types';
import type {
  FlatNode,
  Key,
  TreeConfigContextValue,
  TreeItemState,
  TreeListItemDragHandleProps,
  TreeListItemProps,
  TreeListRootProps,
  TreeNodeMeta,
  TreeOrder,
} from './types';
import { useTreeState, type TreeStateReturn } from './hooks/useTreeState';
import { useTreeOrder } from './hooks/useTreeOrder';
import { useTreeFlattener } from './hooks/useTreeFlattener';
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
import { TreeItemActivatorContext, TreeReorderContext } from './context/TreeReorderContext';
import { TreeListReorder } from './TreeListReorder';
import { applySiblingOrder } from './order';
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

type TreeListRootContentProps<TItem> = TreeListRootProps<TItem> & {
  treeState: TreeStateReturn<TItem>;
  forwardedRef: React.ForwardedRef<HTMLDivElement>;
};

function TreeListRootContent<TItem>({
  treeState,
  forwardedRef,
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
  isItemSelectable: _isItemSelectable,
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
  indentGuide,
  filterText: filterTextProp,
  defaultFilterText,
  onFilterTextChange,
  filterFn,
  reorderable: _reorderable,
  order: _order,
  defaultOrder: _defaultOrder,
  onOrderChange: _onOrderChange,
  ...domProps
}: TreeListRootContentProps<TItem>) {
  const { config, store, actions } = treeState;
  // These props are intentionally removed from domProps above.
  void loading;
  void error;
  void items;
  void itemKey;
  void getChildren;
  void isBranchProp;
  void _isItemSelectable;
  void getTextValue;
  void renderItem;
  void loadChildren;
  void onLoadError;
  void selectionMode;
  void selectionBehavior;
  void selectedKeysProp;
  void defaultSelectedKeys;
  void onSelectedKeysChange;
  void activeKeyProp;
  void defaultActiveKey;
  void onActiveKeyChange;
  void disabledKeysProp;
  void expandedKeysProp;
  void defaultExpandedKeys;
  void onExpandedKeysChange;
  void loopFocus;
  void typeahead;
  void density;
  void virtualized;
  void overscan;
  void estimatedItemSize;
  void indentation;
  void indentGuide;
  void filterTextProp;
  void defaultFilterText;
  void onFilterTextChange;
  void filterFn;
  void _reorderable;
  void _order;
  void _defaultOrder;
  void _onOrderChange;

  const listId = useId();
  const fullConfig = useMemo(() => ({ ...config, listId }), [config, listId]);

  const { handleKeyDown } = useTreeFocus({ config: fullConfig, actions, store });

  // Adapt tree store to List-shaped store for typeahead reuse
  const typeaheadStore = useMemo(
    () => ({
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
    }),
    [store],
  );

  const typeaheadActions = useMemo(
    () => ({
      select: actions.select,
      deselect: actions.deselect,
      toggle: actions.toggle,
      selectRange: actions.selectRange,
      selectAll: actions.selectAll,
      clearSelection: actions.clearSelection,
      setActiveKey: actions.setActiveKey,
      registerItem: () => () => {},
    }),
    [actions],
  );

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
      if (event.target instanceof Element && event.target.closest('[data-ov-tree-drag-handle]')) {
        return;
      }
      handleKeyDown(event);
      handleTypeahead(event);
      onKeyDown?.(event);
    },
    [handleKeyDown, handleTypeahead, onKeyDown],
  );

  return (
    <TreeConfigContext.Provider value={fullConfig}>
      <TreeStoreContext.Provider value={store}>
        <TreeActionsContext.Provider value={actions}>
          <div
            ref={forwardedRef}
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
            {children}
          </div>
        </TreeActionsContext.Provider>
      </TreeStoreContext.Provider>
    </TreeConfigContext.Provider>
  );
}

type TreeListNodesProps<TItem> = TreeListRootProps<TItem> & {
  treeState: TreeStateReturn<TItem>;
  currentOrder?: TreeOrder;
  proposeMove?: React.ComponentProps<typeof TreeListReorder>['proposeMove'];
  getSiblingKeys?: React.ComponentProps<typeof TreeListReorder>['getSiblingKeys'];
};

function TreeListNodes<TItem>({
  treeState,
  items,
  itemKey,
  getChildren,
  getTextValue,
  isItemSelectable,
  renderItem,
  children,
  error,
  currentOrder,
  proposeMove,
  getSiblingKeys,
}: TreeListNodesProps<TItem>) {
  const { store, isBranch, expandedKeys, filterText, filterFn } = treeState;
  const flatNodes = useTreeFlattener(
    items,
    itemKey,
    getChildren,
    isBranch,
    expandedKeys,
    filterText,
    filterFn,
    currentOrder,
  );
  const sourceNonSelectableKeys = useMemo(() => {
    if (!isItemSelectable) return undefined;
    const keys = new Set<Key>();
    for (const node of flatNodes) {
      if (!isItemSelectable(node.item as TItem)) keys.add(node.key);
    }
    return keys;
  }, [flatNodes, isItemSelectable]);
  store.setSourceNonSelectableKeys(sourceNonSelectableKeys);
  const previousNodes = useRef<typeof flatNodes | null>(null);
  const needsNotify = useRef(false);
  if (previousNodes.current !== flatNodes) {
    previousNodes.current = flatNodes;
    store.setFlatNodes(flatNodes, true);
    needsNotify.current = true;
    if (getTextValue) {
      for (const node of flatNodes) {
        const text = getTextValue(node.item as TItem);
        if (text) store.registerTextValue(node.key, text);
      }
    }
  }
  useLayoutEffect(() => {
    if (needsNotify.current) {
      needsNotify.current = false;
      store.emit();
    }
  });

  const nodesByKey = useMemo(() => {
    const map = new Map<Key, FlatNode>();
    for (const node of flatNodes) map.set(node.key, node);
    return map;
  }, [flatNodes]);
  const renderNode: RenderNodeFn = useCallback(
    (key, node) => {
      const flat = nodesByKey.get(key);
      return flat ? renderItem(flat.item as TItem, node) : null;
    },
    [nodesByKey, renderItem],
  );
  // Keep the ordering owner mounted while hiding failed content and DnD.
  if (error) return <div className={styles.Empty}>{error}</div>;

  const content = (
    <RenderNodeContext.Provider value={renderNode}>{children}</RenderNodeContext.Provider>
  );
  return proposeMove && getSiblingKeys ? (
    <TreeListReorder
      store={store}
      flatNodes={flatNodes}
      nodesByKey={nodesByKey}
      proposeMove={proposeMove}
      getSiblingKeys={getSiblingKeys}
    >
      {content}
    </TreeListReorder>
  ) : (
    content
  );
}

function OrderedTreeListNodes<TItem>(props: TreeListNodesProps<TItem>) {
  const { currentOrder, proposeMove } = useTreeOrder(props);
  const { items, itemKey, getChildren } = props;
  const getSiblingKeys = useCallback(
    (parentKey: Key | null, parent: FlatNode | undefined): readonly Key[] => {
      // Resolve only the dropped group, using the existing visible-node index.
      const siblings =
        parentKey === null ? items : parent ? (getChildren(parent.item as TItem) ?? []) : [];
      return applySiblingOrder(siblings, parentKey, currentOrder, itemKey).map(itemKey);
    },
    [items, itemKey, getChildren, currentOrder],
  );
  return (
    <TreeListNodes
      {...props}
      currentOrder={currentOrder}
      proposeMove={props.reorderable ? proposeMove : undefined}
      getSiblingKeys={getSiblingKeys}
    />
  );
}

function TreeListRootImpl<TItem>(
  props: TreeListRootProps<TItem>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  // State and the focus-owning tree DOM stay mounted when edit mode changes.
  // Ordering stays activated after its first use; only DnD follows edit mode.
  const treeState = useTreeState(props);
  const isOrdered =
    props.reorderable === true ||
    props.order !== undefined ||
    props.defaultOrder !== undefined ||
    props.onOrderChange !== undefined;
  const hasEnabledOrdering = useRef(false);
  if (isOrdered) hasEnabledOrdering.current = true;

  return (
    <TreeListRootContent {...props} treeState={treeState} forwardedRef={ref}>
      {hasEnabledOrdering.current ? (
        <OrderedTreeListNodes {...props} treeState={treeState} />
      ) : (
        <TreeListNodes {...props} treeState={treeState} />
      )}
    </TreeListRootContent>
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

function setRefValue<T>(ref: Ref<T> | null, node: T | null): void {
  if (typeof ref === 'function') ref(node);
  else if (ref) ref.current = node;
}

function mergeRefs<T>(
  localRef: RefObject<T | null>,
  forwardedRef: Ref<T> | null,
): (node: T | null) => void {
  return (node) => {
    setRefValue(localRef, node);
    setRefValue(forwardedRef, node);
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
      const virtualContentStyle: CSSProperties = {
        height: virtualizer.totalSize,
        position: 'relative',
      };
      return (
        <div
          ref={mergedRef}
          role="presentation"
          className={cn(styles.Viewport, className)}
          {...props}
        >
          <div style={virtualContentStyle}>
            {virtualizer.virtualItems.map((virtualItem) => {
              const node = flatNodes[virtualItem.index];
              if (!node) return null;
              const nodeMeta = store.getNodeMeta(node.key);
              if (!nodeMeta) return null;
              const virtualItemStyle: CSSProperties = {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              };
              return (
                <div
                  key={node.key}
                  ref={virtualizer.measureElement}
                  data-index={virtualItem.index}
                  style={virtualItemStyle}
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
          return <Fragment key={node.key}>{renderNode(node.key, nodeMeta)}</Fragment>;
        })}
        {children}
      </div>
    );
  },
);

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

interface TreeListItemBehavior {
  config: TreeConfigContextValue;
  itemState: TreeItemState;
  nodeMeta: TreeNodeMeta | undefined;
  isDisabled: boolean;
  handleClick: (event: MouseEvent<HTMLDivElement>) => void;
}

function useTreeListItemBehavior({
  itemKey,
  disabled = false,
  selectable = true,
  textValue,
  onClick,
}: TreeListItemProps): TreeListItemBehavior {
  const store = useTreeStoreContext();
  const actions = useTreeActions();
  const config = useTreeConfig();
  const itemState = useTreeItemHook(store, itemKey, textValue, selectable);
  const nodeMeta = store.getNodeMeta(itemKey);
  const isDisabled = disabled || itemState.isDisabled;

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (isDisabled) {
        onClick?.(event);
        return;
      }

      actions.setActiveKey(itemKey);

      if (selectable && store.isSelectable(itemKey) && config.selectionMode !== 'none') {
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
    [
      isDisabled,
      selectable,
      store,
      config.selectionMode,
      config.selectionBehavior,
      actions,
      itemKey,
      onClick,
    ],
  );

  return { config, itemState, nodeMeta, isDisabled, handleClick };
}

type TreeListItemImplementationProps = TreeListItemProps & {
  behavior: TreeListItemBehavior;
  sortableStyle?: CSSProperties;
  reorderable?: boolean;
  isDragging?: boolean;
};

const TreeListItemImplementation = forwardRef<HTMLDivElement, TreeListItemImplementationProps>(
  function TreeListItemImplementation(
    {
      behavior,
      className,
      itemKey,
      disabled: _disabled,
      selectable: _selectable,
      textValue: _textValue,
      children,
      onClick: _onClick,
      style,
      sortableStyle,
      reorderable,
      isDragging,
      ...props
    },
    ref,
  ) {
    const { config, itemState, nodeMeta, isDisabled, handleClick } = behavior;
    void _disabled;
    void _selectable;
    void _textValue;
    void _onClick;

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
        data-ov-reorderable={reorderable || undefined}
        data-ov-dragging={isDragging || undefined}
        onClick={handleClick}
        style={sortableStyle === undefined ? style : { ...style, ...sortableStyle }}
        {...props}
      >
        {children}
      </div>
    );
  },
);

const TreeListItem = forwardRef<HTMLDivElement, TreeListItemProps>(
  function TreeListItem(props, ref) {
    const behavior = useTreeListItemBehavior(props);
    return <TreeListItemImplementation ref={ref} behavior={behavior} {...props} />;
  },
);

const TreeListReorderableItem = forwardRef<HTMLDivElement, TreeListItemProps>(
  function TreeListReorderableItem(props, ref) {
    const { itemKey, onKeyDown } = props;
    const behavior = useTreeListItemBehavior(props);
    const reorderContext = useContext(TreeReorderContext);
    const sortableDisabled = reorderContext === null || behavior.isDisabled;
    const {
      attributes,
      listeners,
      setActivatorNodeRef,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: itemKey,
      data: { disabled: behavior.isDisabled },
      // Keep disabled rows measurable so collision resolves to the rejected target.
      disabled: { draggable: sortableDisabled, droppable: reorderContext === null },
    });
    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        setNodeRef(node);
        setRefValue(ref, node);
      },
      [ref, setNodeRef],
    );
    const sortableStyle = useMemo<CSSProperties>(
      () => ({
        transform: CSS.Transform.toString(transform),
        transition: transition ?? undefined,
      }),
      [transform, transition],
    );
    const activatorContext = useMemo(
      () =>
        reorderContext === null
          ? null
          : {
              attributes,
              listeners: sortableDisabled ? undefined : listeners,
              setActivatorNodeRef,
              disabled: sortableDisabled,
              isDragging,
            },
      [reorderContext, attributes, listeners, setActivatorNodeRef, sortableDisabled, isDragging],
    );
    const handleRowKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.target instanceof Element && event.target.closest('[data-ov-tree-drag-handle]'))
          return;
        // Do not stop propagation: the keyboard sensor listens on document.
        onKeyDown?.(event);
      },
      [onKeyDown],
    );

    return (
      <TreeItemActivatorContext.Provider value={activatorContext}>
        <TreeListItemImplementation
          ref={mergedRef}
          behavior={behavior}
          sortableStyle={sortableStyle}
          reorderable
          isDragging={isDragging}
          {...props}
          onKeyDown={handleRowKeyDown}
        />
      </TreeItemActivatorContext.Provider>
    );
  },
);

const TreeListItemDragHandle = forwardRef<HTMLButtonElement, TreeListItemDragHandleProps>(
  function TreeListItemDragHandle(
    { className, disabled = false, onClick, onKeyDown, onPointerDown, children, ...props },
    ref,
  ) {
    const activator = useContext(TreeItemActivatorContext);
    const isEnabled = activator !== null && !activator.disabled && !disabled;
    const attributes = isEnabled ? activator.attributes : undefined;
    const listeners = isEnabled ? activator.listeners : undefined;
    const mergedRef = useCallback(
      (node: HTMLButtonElement | null) => {
        activator?.setActivatorNodeRef(isEnabled ? node : null);
        setRefValue(ref, node);
      },
      [activator, isEnabled, ref],
    );
    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onClick?.(event);
      },
      [onClick],
    );
    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) listeners?.onKeyDown?.(event);
      },
      [listeners, onKeyDown],
    );
    const handlePointerDown = useCallback(
      (event: PointerEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onPointerDown?.(event);
        if (!event.defaultPrevented) listeners?.onPointerDown?.(event);
      },
      [listeners, onPointerDown],
    );

    return (
      <button
        {...attributes}
        {...listeners}
        {...props}
        data-ov-tree-drag-handle=""
        ref={mergedRef}
        type="button"
        className={cn(styles.ItemDragHandle, className)}
        disabled={!isEnabled}
        data-ov-dragging={activator?.isDragging || undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
      >
        {children}
      </button>
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
  function TreeListItemIndent(
    { className, depth = 0, ancestorIsLast, isLastChild, style, ...props },
    ref,
  ) {
    const config = useTreeConfig();

    if (config.indentGuide !== 'none' && depth > 0) {
      return (
        <span
          ref={ref}
          className={cn(styles.ItemIndent, className)}
          data-ov-guides={config.indentGuide}
          aria-hidden="true"
          style={
            {
              ...style,
              '--_ov-tree-indent': `${config.indentation}px`,
            } as CSSProperties
          }
          {...props}
        >
          {Array.from({ length: depth }, (_, i) => {
            const isConnector = i === depth - 1;
            // Rails sit under ancestor icons: continuation depends on the next
            // branch in the path, not on the ancestor's own root-level siblings.
            // Preserve the existing column semantics for elbow connectors.
            const ancestorIndex = config.indentGuide === 'rail' ? i + 1 : i;
            const showLine = !isConnector && !(ancestorIsLast?.[ancestorIndex] ?? true);
            const segment = isConnector
              ? isLastChild
                ? 'last'
                : 'mid'
              : showLine
                ? 'pass'
                : undefined;

            return (
              <span
                key={i}
                className={styles.ItemGuide}
                style={{ '--_ov-tree-guide-level': i } as CSSProperties}
                data-ov-guide={config.indentGuide}
                data-ov-segment={segment}
                data-ov-connector={
                  config.indentGuide === 'connectors' && isConnector ? segment : undefined
                }
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
        style={
          {
            ...style,
            '--tree-depth': depth,
            '--_ov-tree-indent': `${config.indentation}px`,
          } as CSSProperties
        }
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
    const itemState = useTreeItemHook(store, itemKeyProp ?? '');

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
            <circle
              cx="6"
              cy="6"
              r="5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="20"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M4.5 2.5L8 6L4.5 9.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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

const TreeListEmpty = forwardRef<HTMLDivElement, TreeListEmptyProps>(function TreeListEmpty(
  { className, ...props },
  ref,
) {
  const store = useTreeStoreContext();
  const visibleCount = useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot().visibleCount,
    () => 0,
  );

  if (visibleCount > 0) return null;
  return <div ref={ref} className={cn(styles.Empty, className)} {...props} />;
});

interface TreeListLoadingProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const TreeListLoading = forwardRef<HTMLDivElement, TreeListLoadingProps>(function TreeListLoading(
  { className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn(styles.Loading, className)} {...props}>
      {children ?? 'Loading\u2026'}
    </div>
  );
});

// ---------------------------------------------------------------------------
// Display names
// ---------------------------------------------------------------------------

(TreeListRoot as { displayName?: string }).displayName = 'TreeList';
TreeListViewport.displayName = 'TreeList.Viewport';
TreeListItem.displayName = 'TreeList.Item';
TreeListReorderableItem.displayName = 'TreeList.ReorderableItem';
TreeListItemDragHandle.displayName = 'TreeList.ItemDragHandle';
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
  ReorderableItem: typeof TreeListReorderableItem;
  ItemDragHandle: typeof TreeListItemDragHandle;
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
  ReorderableItem: TreeListReorderableItem,
  ItemDragHandle: TreeListItemDragHandle,
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
