import { memo, useCallback, useMemo, type ReactNode } from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  TreeReorderContext,
  type TreeReorderContextValue,
} from './context/TreeReorderContext';
import type { FlatNode, Key, TreeNodeMeta, TreeStore } from './types';

interface TreeDragEndOptions {
  visibleKeys: readonly Key[];
  disabledKeys: ReadonlySet<Key>;
  getNodeMeta: (key: Key) => TreeNodeMeta | undefined;
  proposeMove: TreeReorderContextValue['proposeMove'];
}

export const handleTreeDragEnd = (
  event: Pick<DragEndEvent, 'active' | 'over'>,
  { visibleKeys, disabledKeys, getNodeMeta, proposeMove }: TreeDragEndOptions,
): void => {
  const over = event.over;
  if (over === null) return;

  const activeKey = event.active.id;
  const overKey = over.id;
  if (activeKey === overKey || disabledKeys.has(activeKey) || disabledKeys.has(overKey)) return;
  // Item-local disabled props are not part of the root store's disabledKeys.
  if (event.active.data?.current?.disabled || over.data?.current?.disabled) return;

  const activeNode = getNodeMeta(activeKey);
  const overNode = getNodeMeta(overKey);
  if (!activeNode || !overNode || activeNode.parentKey !== overNode.parentKey) return;

  const siblingKeys: Key[] = [];
  let includesActive = false;
  let includesOver = false;
  for (const key of visibleKeys) {
    if (getNodeMeta(key)?.parentKey !== activeNode.parentKey) continue;
    siblingKeys.push(key);
    if (key === activeKey) includesActive = true;
    if (key === overKey) includesOver = true;
  }
  if (!includesActive || !includesOver) return;

  proposeMove(siblingKeys, activeNode.parentKey, activeKey, overKey);
};

interface TreeListReorderProps {
  children: ReactNode;
  store: TreeStore;
  flatNodes: readonly FlatNode[];
  proposeMove: TreeReorderContextValue['proposeMove'];
}

function TreeListReorderImpl({ children, store, flatNodes, proposeMove }: TreeListReorderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const sortableItems = useMemo(() => flatNodes.map((node) => node.key), [flatNodes]);
  const contextValue = useMemo(
    () => ({ store, proposeMove }),
    [store, proposeMove],
  );
  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const snapshot = store.getSnapshot();
      handleTreeDragEnd(event, {
        visibleKeys: snapshot.flattenedKeys,
        disabledKeys: snapshot.disabledKeys,
        getNodeMeta: store.getNodeMeta,
        proposeMove,
      });
    },
    [store, proposeMove],
  );

  return (
    <TreeReorderContext.Provider value={contextValue}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </DndContext>
    </TreeReorderContext.Provider>
  );
}

export const TreeListReorder = memo(TreeListReorderImpl);
