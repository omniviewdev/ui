import { forwardRef, useCallback, useMemo, useState } from 'react';
import { DndContext, closestCenter, type Modifier } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps } from '../../system/types';
import { EditorTabsContext } from './context/EditorTabsContext';
import { useTabScroll } from './hooks/useTabScroll';
import { useTabReorder } from './hooks/useTabReorder';
import { computeTabSegments } from './utils/computeTabSegments';
import { EditorTabItem } from './EditorTabItem';
import { EditorTabsSegment } from './EditorTabsSegment';
import { EditorTabsViewport } from './EditorTabsViewport';
import { EditorTabScrollButton } from './EditorTabScrollButton';
import { EditorTabScrollShadow } from './EditorTabScrollShadow';
import { EditorTabCloseButton } from './EditorTabCloseButton';
import { EditorTabGroupChip } from './EditorTabGroupChip';
import type { TabDescriptor, TabGroupDescriptor, TabGroupId, TabId, ReorderMeta } from './types';
import styles from './EditorTabs.module.css';

/**
 * Custom modifier that clamps the drag transform to the *visible* bounds of
 * the first scrollable ancestor. Unlike `restrictToFirstScrollableAncestor`
 * (which uses full scroll width), this uses the client rect so tabs can't
 * be dragged beyond the visible viewport area.
 */
const restrictToVisibleScrollArea: Modifier = ({
  transform,
  draggingNodeRect,
  scrollableAncestorRects,
}) => {
  const ancestor = scrollableAncestorRects[0];
  if (!draggingNodeRect || !ancestor) return transform;

  return {
    ...transform,
    x: Math.min(
      Math.max(transform.x, ancestor.left - draggingNodeRect.left),
      ancestor.right - draggingNodeRect.right,
    ),
  };
};

const dndModifiers = [restrictToHorizontalAxis, restrictToVisibleScrollArea];

export interface EditorTabsProps extends StyledComponentProps {
  tabs: TabDescriptor[];
  groups?: TabGroupDescriptor[];
  activeId?: TabId;
  defaultActiveId?: TabId;
  onActiveChange?: (id: TabId) => void;
  onCloseTab?: (id: TabId) => void;
  onContextMenuTab?: (id: TabId, ev: React.MouseEvent) => void;
  onToggleGroupCollapsed?: (groupId: TabGroupId) => void;
  onGroupContextMenu?: (groupId: TabGroupId, ev: React.MouseEvent) => void;
  onReorder?: (nextTabs: TabDescriptor[], meta: ReorderMeta) => void;
  allowReorderAcrossPinnedBoundary?: boolean;
  allowReorderAcrossGroups?: boolean;
  className?: string;
}

const EditorTabsRoot = forwardRef<HTMLDivElement, EditorTabsProps>(function EditorTabsRoot(
  {
    tabs,
    groups,
    activeId: controlledActiveId,
    defaultActiveId,
    onActiveChange: controlledOnActiveChange,
    onCloseTab,
    onContextMenuTab,
    onToggleGroupCollapsed,
    onGroupContextMenu,
    onReorder,
    allowReorderAcrossPinnedBoundary,
    allowReorderAcrossGroups,
    variant,
    color,
    size,
    className,
  },
  ref,
) {
  const [uncontrolledActiveId, setUncontrolledActiveId] = useState(
    () => defaultActiveId ?? tabs[0]?.id ?? '',
  );

  const isControlled = controlledActiveId !== undefined;
  const activeId = isControlled ? controlledActiveId : uncontrolledActiveId;

  const onActiveChange = useCallback(
    (id: TabId) => {
      if (!isControlled) {
        setUncontrolledActiveId(id);
      }
      controlledOnActiveChange?.(id);
    },
    [isControlled, controlledOnActiveChange],
  );

  const { scrollState, scrollTo, viewportRef } = useTabScroll();
  const {
    sensors,
    dragActiveId,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useTabReorder({
    tabs,
    groups,
    onReorder,
    allowReorderAcrossPinnedBoundary,
    allowReorderAcrossGroups,
  });

  const segments = useMemo(() => computeTabSegments(tabs, groups), [tabs, groups]);

  const pinnedIds = useMemo(() => segments.pinned.map((t) => t.id), [segments.pinned]);
  const ungroupedIds = useMemo(() => segments.ungrouped.map((t) => t.id), [segments.ungrouped]);

  const tabIds = useMemo(() => tabs.filter((t) => !t.disabled).map((t) => t.id), [tabs]);

  const contextValue = useMemo(
    () => ({
      activeId,
      onActiveChange,
      onCloseTab,
      onContextMenuTab,
      onToggleGroupCollapsed,
      onGroupContextMenu,
      scrollState,
      scrollTo,
      viewportRef,
      tabs: tabIds,
      dragActiveId,
    }),
    [activeId, onActiveChange, onCloseTab, onContextMenuTab, onToggleGroupCollapsed, onGroupContextMenu, scrollState, scrollTo, viewportRef, tabIds, dragActiveId],
  );

  return (
    <EditorTabsContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={dndModifiers}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          ref={ref}
          className={cn(styles.Root, className)}
          role="tablist"
          aria-orientation="horizontal"
          {...styleDataAttributes({ variant, color, size })}
        >
          <EditorTabScrollButton direction="left" />
          <EditorTabScrollShadow side="left" />
          <EditorTabsViewport>
            {segments.pinned.length > 0 && (
              <EditorTabsSegment type="pinned" items={pinnedIds}>
                {segments.pinned.map((tab) => (
                  <EditorTabItem key={tab.id} tab={tab} />
                ))}
              </EditorTabsSegment>
            )}
            {segments.groups.map(({ group, tabs: groupTabs }) => {
              const groupItemIds = groupTabs.map((t) => t.id);
              return (
                <EditorTabsSegment key={group.id} type="group" group={group} tabCount={groupTabs.length} items={groupItemIds}>
                  {groupTabs.map((tab) => (
                    <EditorTabItem key={tab.id} tab={tab} />
                  ))}
                </EditorTabsSegment>
              );
            })}
            {segments.ungrouped.length > 0 && (
              <EditorTabsSegment type="ungrouped" items={ungroupedIds}>
                {segments.ungrouped.map((tab) => (
                  <EditorTabItem key={tab.id} tab={tab} />
                ))}
              </EditorTabsSegment>
            )}
          </EditorTabsViewport>
          <EditorTabScrollShadow side="right" />
          <EditorTabScrollButton direction="right" />
        </div>
      </DndContext>
    </EditorTabsContext.Provider>
  );
});

type EditorTabsCompound = typeof EditorTabsRoot & {
  Root: typeof EditorTabsRoot;
  Viewport: typeof EditorTabsViewport;
  Segment: typeof EditorTabsSegment;
  Item: typeof EditorTabItem;
  CloseButton: typeof EditorTabCloseButton;
  ScrollButton: typeof EditorTabScrollButton;
  ScrollShadow: typeof EditorTabScrollShadow;
  GroupChip: typeof EditorTabGroupChip;
};

export const EditorTabs = Object.assign(EditorTabsRoot, {
  Root: EditorTabsRoot,
  Viewport: EditorTabsViewport,
  Segment: EditorTabsSegment,
  Item: EditorTabItem,
  CloseButton: EditorTabCloseButton,
  ScrollButton: EditorTabScrollButton,
  ScrollShadow: EditorTabScrollShadow,
  GroupChip: EditorTabGroupChip,
}) as EditorTabsCompound;
