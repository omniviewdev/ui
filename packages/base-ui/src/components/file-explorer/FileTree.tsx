import { useCallback, useMemo, useState } from 'react';
import { LuFile, LuFolder, LuFolderOpen, LuLink } from 'react-icons/lu';
import { TreeList } from '../tree-list';
import { Button } from '../button';
import type { Key, TreeNodeMeta } from '../tree-list/types';
import type { FileNode, FileTreeProps } from './types';
import styles from './FileExplorer.module.css';

const EMPTY_NODES: readonly never[] = [];

/** A flat, loaded-node view. Filtering never requests additional children. */
export function FileTree<TMetadata = unknown>({
  nodes,
  rootId = null,
  selectedKeys,
  defaultSelectedKeys,
  onSelectedKeysChange,
  expandedKeys,
  defaultExpandedKeys,
  onExpandedKeysChange,
  activeKey,
  onActiveKeyChange,
  selectionMode = 'single',
  onOpen,
  onNodeContextMenu,
  childrenState,
  onLoadChildren,
  onLoadMore,
  filterText = '',
  filter,
  showHidden = false,
  density = 'compact',
  size = 'sm',
  virtualized = true,
  overscan,
  estimatedItemSize,
  getIcon,
  renderMetadata,
  loading,
  error,
  empty = 'No files',
  className,
  ...props
}: FileTreeProps<TMetadata>) {
  const [localActive, setLocalActive] = useState<string | null>(null);
  const [localExpanded, setLocalExpanded] = useState<ReadonlySet<string>>(
    () => new Set(defaultExpandedKeys),
  );
  const currentActive = activeKey === undefined ? localActive : activeKey;
  const expansion = expandedKeys ?? localExpanded;
  const index = useMemo(() => {
    const byId = new Map<string, FileNode<TMetadata>>();
    for (const node of nodes) byId.set(node.id, node);
    const hiddenChain = new Map<string, boolean>();
    const eligible = new Set<string>();
    const retained = new Set<string>();
    // Resolve each parent chain once, iteratively, including malformed cycles.
    for (const node of nodes) {
      if (hiddenChain.has(node.id)) continue;
      const parentHidden =
        node.parentId === null || !byId.has(node.parentId) ? false : hiddenChain.get(node.parentId);
      if (parentHidden !== undefined) {
        hiddenChain.set(node.id, parentHidden || !!node.hidden);
        continue;
      }
      const chain: FileNode<TMetadata>[] = [];
      const visiting = new Set<string>();
      let cursor: FileNode<TMetadata> | undefined = node;
      while (cursor && !hiddenChain.has(cursor.id) && !visiting.has(cursor.id)) {
        visiting.add(cursor.id);
        chain.push(cursor);
        cursor = cursor.parentId === null ? undefined : byId.get(cursor.parentId);
      }
      let hidden = cursor
        ? (hiddenChain.get(cursor.id) ?? chain.some((item) => !!item.hidden))
        : false;
      while (chain.length) {
        const ancestor = chain.pop()!;
        hidden = hidden || !!ancestor.hidden;
        hiddenChain.set(ancestor.id, hidden);
      }
    }
    for (const node of nodes) {
      if ((!showHidden && hiddenChain.get(node.id)) || (filter && !filter(node))) continue;
      eligible.add(node.id);
      let cursor: FileNode<TMetadata> | undefined = node;
      while (cursor && !retained.has(cursor.id)) {
        retained.add(cursor.id);
        cursor = cursor.parentId === null ? undefined : byId.get(cursor.parentId);
      }
    }
    const children = new Map<string | null, FileNode<TMetadata>[]>();
    for (const node of nodes) {
      if (!retained.has(node.id)) continue;
      const siblings = children.get(node.parentId);
      if (siblings) siblings.push(node);
      else children.set(node.parentId, [node]);
    }
    return { children, eligible, byId };
  }, [nodes, showHidden, filter]);
  const roots = index.children.get(rootId) ?? EMPTY_NODES;
  const itemKey = useCallback((node: FileNode<TMetadata>) => node.id, []);
  const textValue = useCallback((node: FileNode<TMetadata>) => node.name, []);
  const isBranch = useCallback((node: FileNode<TMetadata>) => node.kind === 'directory', []);
  const getChildren = useCallback(
    (node: FileNode<TMetadata>) => {
      const children = index.children.get(node.id);
      if (children) return children;
      const state = childrenState?.get(node.id);
      return !filterText && !filter && (!state || state.status === 'unloaded') && onLoadChildren
        ? undefined
        : EMPTY_NODES;
    },
    [index, childrenState, filterText, filter, onLoadChildren],
  );
  const query = filterText.toLocaleLowerCase();
  const filterNode = useCallback(
    (node: FileNode<TMetadata>) =>
      index.eligible.has(node.id) &&
      (!query ||
        node.name.toLocaleLowerCase().includes(query) ||
        node.path.toLocaleLowerCase().includes(query)),
    [index, query],
  );
  const loadChildren = useCallback(
    (_key: Key, node: FileNode<TMetadata>) => onLoadChildren!(node),
    [onLoadChildren],
  );
  const renderItem = useCallback(
    (node: FileNode<TMetadata>, meta: TreeNodeMeta) => {
      const parentState = childrenState?.get(node.parentId);
      const setSize =
        parentState && (parentState.status !== 'loaded' || !parentState.complete)
          ? -1
          : (meta.setSize ?? -1);
      return (
        <TreeList.Item
          itemKey={node.id}
          textValue={node.name}
          aria-setsize={setSize}
          onDoubleClick={() => onOpen?.(node)}
          onContextMenu={(event) => onNodeContextMenu?.(node, event)}
        >
          <TreeList.ItemIndent
            depth={meta.depth}
            ancestorIsLast={meta.ancestorIsLast}
            isLastChild={meta.isLastChild}
          />
          <TreeList.ItemToggle itemKey={node.id} />
          <TreeList.ItemIcon>
            {getIcon ? (
              getIcon(node, meta.isExpanded)
            ) : node.kind === 'directory' ? (
              meta.isExpanded ? (
                <LuFolderOpen />
              ) : (
                <LuFolder />
              )
            ) : node.kind === 'symlink' ? (
              <LuLink />
            ) : (
              <LuFile />
            )}
          </TreeList.ItemIcon>
          <TreeList.ItemLabel>{node.name}</TreeList.ItemLabel>
          {node.change && node.change !== 'unchanged' && (
            <span className={styles.change} data-change={node.change} aria-label={node.change}>
              {node.change === 'added'
                ? 'A'
                : node.change === 'modified'
                  ? 'M'
                  : node.change === 'deleted'
                    ? 'D'
                    : '?'}
            </span>
          )}
          {renderMetadata && <span className={styles.metadata}>{renderMetadata(node)}</span>}
        </TreeList.Item>
      );
    },
    [getIcon, onOpen, onNodeContextMenu, renderMetadata, childrenState],
  );
  const hasPendingBranches = useMemo(() => {
    if (!childrenState) return false;
    for (const [id, state] of childrenState) {
      if (state.status === 'loading' && (id === rootId || (id !== null && expansion.has(id))))
        return true;
    }
    return false;
  }, [childrenState, rootId, expansion]);
  const branchStates = useMemo(() => {
    if (!childrenState) return [];
    const visibleExpanded = new Set<string>();
    const pending = [...(index.children.get(rootId) ?? EMPTY_NODES)];
    while (pending.length) {
      const node = pending.pop()!;
      if (!expansion.has(node.id) || visibleExpanded.has(node.id)) continue;
      visibleExpanded.add(node.id);
      const children = index.children.get(node.id);
      if (children) for (const child of children) pending.push(child);
    }
    return Array.from(childrenState).filter(
      ([id]) => id === rootId || (id !== null && visibleExpanded.has(id)),
    );
  }, [childrenState, rootId, expansion, index]);
  return (
    <div {...props} className={[styles.tree, className].filter(Boolean).join(' ')}>
      <TreeList.Root<FileNode<TMetadata>>
        aria-label={props['aria-label'] ?? 'Files'}
        items={roots}
        itemKey={itemKey}
        getChildren={getChildren}
        isBranch={isBranch}
        getTextValue={textValue}
        filterText={filterText}
        filterFn={filterNode}
        renderItem={renderItem}
        selectedKeys={selectedKeys}
        defaultSelectedKeys={defaultSelectedKeys}
        onSelectedKeysChange={
          onSelectedKeysChange &&
          ((keys) => onSelectedKeysChange(new Set(Array.from(keys, String))))
        }
        expandedKeys={expansion}
        onExpandedKeysChange={(keys) => {
          const next = new Set(Array.from(keys, String));
          if (expandedKeys === undefined) setLocalExpanded(next);
          onExpandedKeysChange?.(next);
        }}
        activeKey={currentActive}
        onActiveKeyChange={(key) => {
          const next = key === null ? null : String(key);
          if (activeKey === undefined) setLocalActive(next);
          onActiveKeyChange?.(next);
        }}
        onKeyDown={(event) => {
          if (
            event.key !== 'Enter' ||
            event.target !== event.currentTarget ||
            !onOpen ||
            currentActive === null
          )
            return;
          const node = index.byId.get(currentActive);
          if (node) onOpen(node);
        }}
        selectionMode={selectionMode}
        loadChildren={onLoadChildren ? loadChildren : undefined}
        density={density}
        size={size}
        virtualized={virtualized}
        overscan={overscan}
        estimatedItemSize={estimatedItemSize}
        loading={loading}
        error={error}
      >
        <TreeList.Viewport />
        {!hasPendingBranches && <TreeList.Empty>{empty}</TreeList.Empty>}
      </TreeList.Root>
      {branchStates.map(([id, state]) => {
        const node = id === rootId || id === null ? null : (index.byId.get(id) ?? null);
        const label = node?.name ?? 'Files';
        if (state.status === 'loading')
          return (
            <div key={id ?? 'root'} className={styles.branchStatus} role="status">
              {label}: Loading…
            </div>
          );
        if (state.status === 'error')
          return (
            <div key={id ?? 'root'} className={styles.branchStatus}>
              <span role="alert">
                {label}: {state.error.message}
              </span>
              {node && onLoadChildren ? (
                <Button size="sm" onClick={() => void onLoadChildren(node)}>
                  Retry
                </Button>
              ) : !node && onLoadMore ? (
                <Button size="sm" onClick={() => void onLoadMore(null)}>
                  Retry
                </Button>
              ) : null}
            </div>
          );
        if (state.status === 'loaded' && !state.complete)
          return (
            <div key={id ?? 'root'} className={styles.branchStatus}>
              <span>{label}: Partial listing</span>
              {onLoadMore && (
                <Button size="sm" onClick={() => void onLoadMore(node)}>
                  Load more
                </Button>
              )}
            </div>
          );
        return null;
      })}
    </div>
  );
}
