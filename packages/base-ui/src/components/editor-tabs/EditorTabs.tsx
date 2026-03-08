import { forwardRef, useCallback, useId, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps } from '../../system/types';
import { EditorTabsContext } from './context/EditorTabsContext';
import { useTabDragBroker } from './context/TabDragBroker';
import { useTabScroll } from './hooks/useTabScroll';
import { useTabReorder } from './hooks/useTabReorder';
import { useTabDetach } from './hooks/useTabDetach';
import { useTabAttach } from './hooks/useTabAttach';
import { createDetachAwareModifier } from './modifiers/createDetachAwareModifier';
import { computeTabSegments } from './utils/computeTabSegments';
import { EditorTabItem } from './EditorTabItem';
import { EditorTabsSegment } from './EditorTabsSegment';
import { EditorTabsViewport } from './EditorTabsViewport';
import { EditorTabScrollButton } from './EditorTabScrollButton';
import { EditorTabScrollShadow } from './EditorTabScrollShadow';
import { EditorTabCloseButton } from './EditorTabCloseButton';
import { EditorTabGroupChip } from './EditorTabGroupChip';
import { DetachGhostTab } from './DetachGhostTab';
import type {
  TabDescriptor,
  TabGroupDescriptor,
  TabGroupId,
  TabId,
  ReorderMeta,
  DetachCommit,
  AttachCommit,
} from './types';
import styles from './EditorTabs.module.css';

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
  detachable?: boolean;
  detachThresholdPx?: number;
  onDetachCommit?: (commit: DetachCommit) => void;
  instanceId?: string;
  onAttachTab?: (commit: AttachCommit) => void;
  /** When true and a TabDragBrokerProvider is present, vertical detach starts a
   *  broker session instead of the default Phase 3 flow. */
  detachToBroker?: boolean;
  className?: string;
}

/** CSS custom properties scoped to .Root that need snapshotting for DragOverlay portal. */
const CSS_VAR_SNAPSHOT_KEYS = [
  '--_ov-tab-height',
  '--_ov-tab-bg',
  '--_ov-tab-fg',
  '--_ov-tab-active-bg',
  '--_ov-tab-active-fg',
  '--_ov-tab-active-border',
  '--_ov-tab-hover-bg',
  '--_ov-tab-hover-fg',
  '--_ov-tab-modified-border',
  '--_ov-tab-border',
  '--_ov-tab-divider',
  '--_ov-tab-font-size',
  '--_ov-tab-padding-x',
  '--_ov-tab-padding-trailing',
  '--_ov-tab-close-size',
  '--_ov-group-header-bg',
] as const;

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
    detachable = true,
    detachThresholdPx = 18,
    onDetachCommit,
    instanceId: instanceIdProp,
    onAttachTab,
    detachToBroker = false,
    variant,
    color,
    size,
    className,
  },
  ref,
) {
  const generatedId = useId();
  const instanceId = instanceIdProp ?? generatedId;
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

  const rootElRef = useRef<HTMLDivElement | null>(null);
  const cssVarSnapshotRef = useRef<React.CSSProperties | null>(null);
  /** Tracks whether we handed the detach off to the broker (ref for sync access). */
  const brokerSessionStarted = useRef(false);

  const rootRefCb = useCallback(
    (node: HTMLDivElement | null) => {
      rootElRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
    },
    [ref],
  );

  const broker = useTabDragBroker();

  const reorder = useTabReorder({
    tabs,
    groups,
    onReorder,
    allowReorderAcrossPinnedBoundary,
    allowReorderAcrossGroups,
  });

  // Snapshot CSS vars (used by both DragOverlay and broker ghost)
  const snapshotCssVars = useCallback(() => {
    if (!rootElRef.current) return;
    const computed = getComputedStyle(rootElRef.current);
    const snapshot: Partial<Record<string, string>> & React.CSSProperties = {};
    for (const key of CSS_VAR_SNAPSHOT_KEYS) {
      snapshot[key] = computed.getPropertyValue(key);
    }
    cssVarSnapshotRef.current = snapshot;
  }, []);

  const detach = useTabDetach({
    detachable,
    detachThresholdPx,
    viewportRef,
    tabs,
    onDetachCommit,
    onDetachArmed:
      broker && detachToBroker
        ? (tabId, clientX, clientY) => {
            const tab = tabs.find((t) => t.id === tabId);
            if (!tab) return;
            snapshotCssVars();
            brokerSessionStarted.current = true;
            broker.beginSession(
              {
                tab,
                sourceInstanceId: instanceId,
                ghostStyle: cssVarSnapshotRef.current ?? undefined,
              },
              clientX,
              clientY,
            );
          }
        : undefined,
    onDetachReverted:
      broker && detachToBroker
        ? () => {
            if (brokerSessionStarted.current) {
              broker.clearSession();
              brokerSessionStarted.current = false;
            }
          }
        : undefined,
  });

  const attach = useTabAttach({ instanceId, viewportRef, onAttachTab });

  const dndModifiers = useMemo(
    () => [createDetachAwareModifier(detach.dragModeRef)],
    [detach.dragModeRef],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      snapshotCssVars();
      reorder.handleDragStart(event);
      detach.handleDetachDragStart(event);
    },
    [reorder, detach, snapshotCssVars],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (detach.dragModeRef.current === 'detach-armed') {
        detach.handleDetachDragEnd(event);
        reorder.handleDragCancel();
      } else {
        reorder.handleDragEnd(event);
        detach.handleDetachDragCancel();
        // If broker was started but user reverted to reorder, clear it
        if (brokerSessionStarted.current && broker) {
          broker.clearSession();
        }
      }
      brokerSessionStarted.current = false;
    },
    [reorder, detach, broker],
  );

  const handleDragCancel = useCallback(() => {
    reorder.handleDragCancel();
    detach.handleDetachDragCancel();
    if (brokerSessionStarted.current && broker) {
      broker.clearSession();
    }
    brokerSessionStarted.current = false;
  }, [reorder, detach, broker]);

  const segments = useMemo(() => computeTabSegments(tabs, groups), [tabs, groups]);

  const pinnedIds = useMemo(() => segments.pinned.map((t) => t.id), [segments.pinned]);
  const ungroupedIds = useMemo(() => segments.ungrouped.map((t) => t.id), [segments.ungrouped]);

  const tabIds = useMemo(() => tabs.filter((t) => !t.disabled).map((t) => t.id), [tabs]);

  const activeTabDescriptor = useMemo(() => {
    if (!reorder.dragActiveId) return null;
    return tabs.find((t) => t.id === reorder.dragActiveId) ?? null;
  }, [tabs, reorder.dragActiveId]);

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
      dragActiveId: reorder.dragActiveId,
      dragMode: detach.dragMode,
      isAttachDropTarget: attach.isDropTarget,
      attachInsertIndex: attach.insertIndex,
    }),
    [
      activeId,
      onActiveChange,
      onCloseTab,
      onContextMenuTab,
      onToggleGroupCollapsed,
      onGroupContextMenu,
      scrollState,
      scrollTo,
      viewportRef,
      tabIds,
      reorder.dragActiveId,
      detach.dragMode,
      attach.isDropTarget,
      attach.insertIndex,
    ],
  );

  // Show dnd-kit's DragOverlay only when detach-armed AND the broker hasn't
  // taken over the ghost rendering (brokerSessionStarted).
  const showDndOverlay =
    detach.dragMode === 'detach-armed' && activeTabDescriptor && !brokerSessionStarted.current;

  return (
    <EditorTabsContext.Provider value={contextValue}>
      <DndContext
        sensors={reorder.sensors}
        collisionDetection={closestCenter}
        modifiers={dndModifiers}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          ref={rootRefCb}
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
                <EditorTabsSegment
                  key={group.id}
                  type="group"
                  group={group}
                  tabCount={groupTabs.length}
                  items={groupItemIds}
                >
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
        {showDndOverlay && (
          <DragOverlay dropAnimation={null} style={cssVarSnapshotRef.current ?? undefined}>
            <DetachGhostTab tab={activeTabDescriptor} />
          </DragOverlay>
        )}
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
