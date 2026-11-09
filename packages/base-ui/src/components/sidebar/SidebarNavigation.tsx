import { useLayoutEffect, useMemo, useRef } from 'react';
import { cn } from '../../system/classnames';
import type { Key } from '../tree-list/types';
import { useSidebarContext } from './context';
import { firstFocusable, focusedWithin } from './focus';
import { findSelection, type NavigationModel } from './navigationModel';
import { RailNavigation } from './RailNavigation';
import type { SidebarNavigationProps } from './types';
import styles from './SidebarNavigation.module.css';

const DEFAULT_LABEL = 'Navigation';

/** Prefer the row that is, or contains, the selection; else the roving tab stop; else the first. */
function focusRailRow(layer: HTMLElement | null, rootKey: Key | null) {
  if (!layer) return;
  const rows = Array.from(
    layer.querySelectorAll<HTMLElement>('[data-ov-rail-item]:not(:disabled)'),
  );
  const preferred =
    rootKey === null ? undefined : rows.find((row) => row.dataset.ovRailKey === String(rootKey));
  const target = preferred ?? rows.find((row) => row.tabIndex === 0) ?? rows[0];
  target?.focus({ preventScroll: true });
  if (!target) return;
  // Reveal the selected row in its rail, without scrolling the animating outer panel.
  const bounds = layer.getBoundingClientRect();
  const row = target.getBoundingClientRect();
  if (row.top < bounds.top) layer.scrollTop -= bounds.top - row.top;
  else if (row.bottom > bounds.bottom) layer.scrollTop += row.bottom - bounds.bottom;
}

/**
 * Two presentations of one navigation. The children (typically a TreeList) are the expanded
 * presentation: they stay mounted, keep their scroll, expansion and edit state, and are only
 * made inert while collapsed. The collapsed presentation is a generic icon rail projected from
 * `items`, with label tooltips and Menu flyouts, built only from the accessors given here.
 */
export function SidebarNavigation<TItem>({
  items,
  itemKey,
  getChildren,
  getTextValue,
  getIcon,
  getBadge,
  getSectionLabel,
  isItemSelectable,
  getOpenLabel,
  selectedKey = null,
  disabledKeys,
  onAction,
  'aria-label': ariaLabel = DEFAULT_LABEL,
  className,
  children,
  ref,
  ...rest
}: SidebarNavigationProps<TItem>) {
  const { collapsed } = useSidebarContext('Sidebar.Navigation');

  const disabled = useMemo(() => new Set<Key>(disabledKeys), [disabledKeys]);
  const selection = useMemo(
    () => findSelection(items, selectedKey, itemKey, getChildren),
    [items, selectedKey, itemKey, getChildren],
  );
  const model = useMemo<NavigationModel<TItem>>(
    () => ({
      itemKey,
      getChildren,
      getTextValue,
      getIcon,
      getBadge,
      getSectionLabel,
      getOpenLabel: getOpenLabel ?? ((item) => `Open ${getTextValue(item)}`),
      isSelectable: isItemSelectable ?? ((item) => !getChildren(item)?.length),
      isDisabled: (key) => disabled.has(key),
      selectedKey,
      selectedAncestors: selection.ancestors,
      selectedRootKey: selection.rootKey,
      onAction: (key, item) => onAction?.(key, item),
    }),
    [
      itemKey,
      getChildren,
      getTextValue,
      getIcon,
      getBadge,
      getSectionLabel,
      getOpenLabel,
      isItemSelectable,
      disabled,
      selectedKey,
      selection,
      onAction,
    ],
  );

  // Hidden layers become inert in the same commit, which would strand focus. Hand it to the
  // equivalent row on the other side. Children run before the root's own generic fallback.
  const expandedLayer = useRef<HTMLDivElement>(null);
  const railLayer = useRef<HTMLDivElement>(null);
  const previousCollapsed = useRef(collapsed);
  useLayoutEffect(() => {
    if (previousCollapsed.current === collapsed) return;
    previousCollapsed.current = collapsed;
    if (collapsed) {
      if (focusedWithin(expandedLayer.current)) focusRailRow(railLayer.current, selection.rootKey);
      return;
    }
    const active = document.activeElement;
    const inFlyout =
      active instanceof Element && active.closest('[data-ov-sidebar-flyout]') !== null;
    if (inFlyout || focusedWithin(railLayer.current))
      firstFocusable(expandedLayer.current)?.focus({ preventScroll: true });
  }, [collapsed, selection.rootKey]);

  return (
    <div
      {...rest}
      ref={ref}
      className={cn(styles.Navigation, className)}
      data-ov-sidebar-navigation=""
      data-ov-collapsed={collapsed ? 'true' : 'false'}
    >
      <div
        ref={expandedLayer}
        className={styles.ExpandedLayer}
        data-ov-layer="expanded"
        inert={collapsed || undefined}
        aria-hidden={collapsed || undefined}
      >
        {children}
      </div>
      <div
        ref={railLayer}
        className={styles.RailLayer}
        data-ov-layer="rail"
        inert={!collapsed || undefined}
        aria-hidden={!collapsed || undefined}
      >
        <RailNavigation items={items} model={model} label={ariaLabel} />
      </div>
    </div>
  );
}

SidebarNavigation.displayName = 'Sidebar.Navigation';
