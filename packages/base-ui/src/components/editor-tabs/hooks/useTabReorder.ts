import { useCallback, useState } from 'react';
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { TabDescriptor, TabGroupDescriptor, TabId, ReorderMeta } from '../types';

function getTabLane(tab: TabDescriptor): string {
  if (tab.pinned) return 'pinned';
  if (tab.groupId) return tab.groupId;
  return 'ungrouped';
}

export interface UseTabReorderOptions {
  tabs: TabDescriptor[];
  groups?: TabGroupDescriptor[];
  onReorder?: (nextTabs: TabDescriptor[], meta: ReorderMeta) => void;
  allowReorderAcrossPinnedBoundary?: boolean;
  allowReorderAcrossGroups?: boolean;
}

export function useTabReorder({
  tabs,
  onReorder,
  allowReorderAcrossPinnedBoundary = false,
  allowReorderAcrossGroups = false,
}: UseTabReorderOptions) {
  const [dragActiveId, setDragActiveId] = useState<TabId | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDragActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDragActiveId(null);

      const { active, over } = event;
      if (!over || active.id === over.id || !onReorder) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      const activeTab = tabs.find((t) => t.id === activeId);
      const overTab = tabs.find((t) => t.id === overId);
      if (!activeTab || !overTab) return;

      const activeLane = getTabLane(activeTab);
      const overLane = getTabLane(overTab);

      // Constraint: pinned boundary
      if (activeLane !== overLane) {
        const crossesPinned = activeLane === 'pinned' || overLane === 'pinned';
        if (crossesPinned && !allowReorderAcrossPinnedBoundary) return;
        if (!crossesPinned && !allowReorderAcrossGroups) return;
      }

      const fromIndex = tabs.findIndex((t) => t.id === activeId);
      const toIndex = tabs.findIndex((t) => t.id === overId);
      if (fromIndex === -1 || toIndex === -1) return;

      const nextTabs = arrayMove(tabs, fromIndex, toIndex);
      onReorder(nextTabs, { id: activeId, from: fromIndex, to: toIndex });
    },
    [tabs, onReorder, allowReorderAcrossPinnedBoundary, allowReorderAcrossGroups],
  );

  const handleDragCancel = useCallback(() => {
    setDragActiveId(null);
  }, []);

  return { sensors, dragActiveId, handleDragStart, handleDragEnd, handleDragCancel };
}
