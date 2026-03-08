import { forwardRef, useCallback, useMemo } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { Chip } from '../chip';
import { useEditorTabsContext } from './context/EditorTabsContext';
import type { TabGroupDescriptor } from './types';
import styles from './EditorTabs.module.css';

/** Convert an sRGB channel (0–255) to linear light. */
function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance from linear RGB. */
function luminance(r: number, g: number, b: number): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/** WCAG contrast ratio between two luminances. */
function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Return '#000' or '#fff' — whichever has higher WCAG contrast against `hex`.
 * Accepts 3- or 6-digit hex. Returns `null` for non-hex values (e.g. rgb(),
 * hsl(), var()) so the caller can fall back to the default CSS text color.
 */
function contrastFg(hex: string): string | null {
  // 3-digit shorthand
  let m = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(hex);
  if (m) {
    const [r, g, b] = [
      parseInt(m[1]! + m[1]!, 16),
      parseInt(m[2]! + m[2]!, 16),
      parseInt(m[3]! + m[3]!, 16),
    ];
    const l = luminance(r, g, b);
    return contrastRatio(l, 1) >= contrastRatio(l, 0) ? '#fff' : '#000';
  }
  // 6-digit
  m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return null;
  const [r, g, b] = [parseInt(m[1]!, 16), parseInt(m[2]!, 16), parseInt(m[3]!, 16)];
  const l = luminance(r, g, b);
  return contrastRatio(l, 1) >= contrastRatio(l, 0) ? '#fff' : '#000';
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
      (e: MouseEvent<HTMLElement>) => {
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
        const style: Record<string, string> = {
          '--_ov-accent-bg': group.color,
          '--_ov-accent-border': group.color,
        };
        if (fg) {
          style['--_ov-accent-fg'] = fg;
        }
        return { ...base, ...style } as CSSProperties;
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
