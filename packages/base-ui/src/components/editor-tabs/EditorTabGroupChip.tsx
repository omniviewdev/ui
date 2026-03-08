import { forwardRef, useCallback, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Chip } from '../chip';
import { useEditorTabsContext } from './context/EditorTabsContext';
import type { TabGroupDescriptor } from './types';
import styles from './EditorTabs.module.css';

/**
 * Compute relative luminance from a hex color and return a contrasting fg.
 * Falls back to '#fff' for non-hex or unparseable values.
 */
function contrastFg(hex: string): string {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return '#fff';
  const [r, g, b] = [parseInt(m[1]!, 16), parseInt(m[2]!, 16), parseInt(m[3]!, 16)];
  // YIQ brightness
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#000' : '#fff';
}

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

    const chipStyle = useMemo((): CSSProperties => {
      const base: CSSProperties = {
        borderRadius: 'var(--ov-size-chip-radius)',
        alignSelf: 'center',
        margin: '0 2px',
      };
      if (group.color) {
        const fg = group.fg ?? contrastFg(group.color);
        return {
          ...base,
          '--_ov-accent-bg': group.color,
          '--_ov-accent-fg': fg,
          '--_ov-accent-border': group.color,
        } as CSSProperties;
      }
      return base;
    }, [group.color, group.fg]);

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
        style={chipStyle}
      >
        {group.title}
      </Chip>
    );
  },
);
