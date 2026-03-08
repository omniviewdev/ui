import { forwardRef, useCallback, useMemo, useState } from 'react';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps } from '../../system/types';
import { EditorTabsContext } from './context/EditorTabsContext';
import { useTabScroll } from './hooks/useTabScroll';
import { computeTabSegments } from './utils/computeTabSegments';
import { EditorTabItem } from './EditorTabItem';
import { EditorTabsSegment } from './EditorTabsSegment';
import { EditorTabsViewport } from './EditorTabsViewport';
import { EditorTabScrollButton } from './EditorTabScrollButton';
import { EditorTabScrollShadow } from './EditorTabScrollShadow';
import { EditorTabCloseButton } from './EditorTabCloseButton';
import { EditorTabGroupChip } from './EditorTabGroupChip';
import type { TabDescriptor, TabGroupDescriptor, TabGroupId, TabId } from './types';
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

  const segments = useMemo(() => computeTabSegments(tabs, groups), [tabs, groups]);

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
    }),
    [activeId, onActiveChange, onCloseTab, onContextMenuTab, onToggleGroupCollapsed, onGroupContextMenu, scrollState, scrollTo, viewportRef, tabIds],
  );

  return (
    <EditorTabsContext.Provider value={contextValue}>
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
            <EditorTabsSegment type="pinned">
              {segments.pinned.map((tab) => (
                <EditorTabItem key={tab.id} tab={tab} />
              ))}
            </EditorTabsSegment>
          )}
          {segments.groups.map(({ group, tabs: groupTabs }) => (
            <EditorTabsSegment key={group.id} type="group" group={group} tabCount={groupTabs.length}>
              {groupTabs.map((tab) => (
                <EditorTabItem key={tab.id} tab={tab} />
              ))}
            </EditorTabsSegment>
          ))}
          {segments.ungrouped.length > 0 && (
            <EditorTabsSegment type="ungrouped">
              {segments.ungrouped.map((tab) => (
                <EditorTabItem key={tab.id} tab={tab} />
              ))}
            </EditorTabsSegment>
          )}
        </EditorTabsViewport>
        <EditorTabScrollShadow side="right" />
        <EditorTabScrollButton direction="right" />
      </div>
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
