import { memo, useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TreeReorderContext, type TreeReorderContextValue } from './context/TreeReorderContext';
import type { FlatNode, Key, TreeNodeMeta, TreeStore } from './types';

interface TreeDragEndOptions {
  visibleKeys: readonly Key[];
  disabledKeys: ReadonlySet<Key>;
  getNodeMeta: (key: Key) => TreeNodeMeta | undefined;
  getSiblingKeys: (parentKey: Key | null) => readonly Key[];
  proposeMove: TreeReorderContextValue['proposeMove'];
}

export const handleTreeDragEnd = (
  event: Pick<DragEndEvent, 'active' | 'over'>,
  { visibleKeys, disabledKeys, getNodeMeta, getSiblingKeys, proposeMove }: TreeDragEndOptions,
): void => {
  const over = event.over;
  if (over === null) return;

  const activeKey = event.active.id;
  const overKey = over.id;
  if (activeKey === overKey || disabledKeys.has(activeKey) || disabledKeys.has(overKey)) return;
  // Also honor the drag sensor's current disabled state.
  if (event.active.data?.current?.disabled || over.data?.current?.disabled) return;

  const activeNode = getNodeMeta(activeKey);
  const overNode = getNodeMeta(overKey);
  if (!activeNode || !overNode || activeNode.parentKey !== overNode.parentKey) return;

  if (!visibleKeys.includes(activeKey) || !visibleKeys.includes(overKey)) return;
  const siblingKeys = getSiblingKeys(activeNode.parentKey);

  proposeMove(siblingKeys, activeNode.parentKey, activeKey, overKey);
};

interface TreeListReorderProps {
  children: ReactNode;
  store: TreeStore;
  flatNodes: readonly FlatNode[];
  nodesByKey: ReadonlyMap<Key, FlatNode>;
  proposeMove: TreeReorderContextValue['proposeMove'];
  getSiblingKeys: (parentKey: Key | null, parent: FlatNode | undefined) => readonly Key[];
}

function TreeListReorderImpl({
  children,
  store,
  flatNodes,
  nodesByKey,
  proposeMove,
  getSiblingKeys,
}: TreeListReorderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const sortableItems = useMemo(() => flatNodes.map((node) => node.key), [flatNodes]);
  const [draggedKey, setDraggedKey] = useState<Key | null>(null);
  const contextValue = useMemo(
    () => ({ store, proposeMove, draggedKey }),
    [store, proposeMove, draggedKey],
  );
  const onDragStart = useCallback((event: DragStartEvent) => setDraggedKey(event.active.id), []);
  const onDragCancel = useCallback(() => setDraggedKey(null), []);
  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDraggedKey(null);
      const snapshot = store.getSnapshot();
      handleTreeDragEnd(event, {
        visibleKeys: snapshot.flattenedKeys,
        disabledKeys: snapshot.disabledKeys,
        getNodeMeta: store.getNodeMeta,
        getSiblingKeys: (parentKey) =>
          getSiblingKeys(parentKey, parentKey === null ? undefined : nodesByKey.get(parentKey)),
        proposeMove,
      });
    },
    [store, proposeMove, getSiblingKeys, nodesByKey],
  );

  return (
    <TreeReorderContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragCancel={onDragCancel}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </DndContext>
    </TreeReorderContext.Provider>
  );
}

export const TreeListReorder = memo(TreeListReorderImpl);
