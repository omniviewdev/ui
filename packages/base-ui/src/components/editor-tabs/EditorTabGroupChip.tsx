import { forwardRef, useCallback } from 'react';
import { Chip } from '../chip';
import { useEditorTabsContext } from './context/EditorTabsContext';
import type { TabGroupDescriptor } from './types';
import styles from './EditorTabs.module.css';

export interface EditorTabGroupChipProps {
  group: TabGroupDescriptor;
  tabCount: number;
  className?: string;
}

export const EditorTabGroupChip = forwardRef<HTMLElement, EditorTabGroupChipProps>(
  function EditorTabGroupChip({ group, tabCount, className }, ref) {
    const { onToggleGroupCollapsed, onGroupContextMenu } = useEditorTabsContext();

    const handleClick = useCallback(() => {
      onToggleGroupCollapsed?.(group.id);
    }, [group.id, onToggleGroupCollapsed]);

    const handleContextMenu = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onGroupContextMenu?.(group.id, e);
      },
      [group.id, onGroupContextMenu],
    );

    const countBadge = group.collapsed ? (
      <span className={styles.GroupChipCount}>{tabCount}</span>
    ) : undefined;

    return (
      <Chip
        ref={ref}
        clickable
        variant="solid"
        size="sm"
        className={className}
        endDecorator={countBadge}
        aria-expanded={!group.collapsed}
        aria-label={`${group.title ?? 'Group'} — ${tabCount} tab${tabCount !== 1 ? 's' : ''}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={
          group.color
            ? ({
                '--_ov-accent-bg': group.color,
                '--_ov-accent-fg': '#fff',
                '--_ov-accent-border': group.color,
                borderRadius: 'var(--ov-size-chip-radius)',
                alignSelf: 'center',
                margin: '0 2px',
              } as React.CSSProperties)
            : ({ alignSelf: 'center', margin: '0 2px' } as React.CSSProperties)
        }
      >
        {group.title}
      </Chip>
    );
  },
);
