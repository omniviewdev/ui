import { forwardRef, type CSSProperties, type ReactNode } from 'react';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '../../system/classnames';
import type { TabGroupDescriptor } from './types';
import { EditorTabGroupChip } from './EditorTabGroupChip';
import styles from './EditorTabs.module.css';

export interface EditorTabsSegmentProps {
  type: 'pinned' | 'group' | 'ungrouped';
  group?: TabGroupDescriptor;
  tabCount?: number;
  items?: string[];
  children: ReactNode;
  className?: string;
}

export const EditorTabsSegment = forwardRef<HTMLDivElement, EditorTabsSegmentProps>(
  function EditorTabsSegment({ type, group, tabCount = 0, items, children, className }, ref) {
    const isCollapsed = type === 'group' && group?.collapsed;

    const content = !isCollapsed ? (
      items ? (
        <SortableContext items={items} strategy={horizontalListSortingStrategy}>
          {children}
        </SortableContext>
      ) : (
        children
      )
    ) : null;

    return (
      <div
        ref={ref}
        className={cn(styles.Segment, className)}
        data-segment={type}
        role="presentation"
        {...(isCollapsed ? { 'data-collapsed': '' } : {})}
        {...(group?.color ? { style: { '--_ov-group-color': group.color } as CSSProperties } : {})}
      >
        {type === 'group' && group && <EditorTabGroupChip group={group} tabCount={tabCount} />}
        {content}
      </div>
    );
  },
);
