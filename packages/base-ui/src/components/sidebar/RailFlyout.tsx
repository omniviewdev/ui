import { Fragment, useCallback, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Menu } from '../menu';
import type { Key } from '../tree-list/types';
import { ChevronRightIcon } from './icons';
import { childrenOf, hasBadge, isGroup, type NavigationModel } from './navigationModel';
import styles from './SidebarNavigation.module.css';

function depthStyle(depth: number): CSSProperties {
  return { '--_ov-sidebar-depth': depth } as CSSProperties;
}

interface RowProps<TItem> {
  item: TItem;
  depth: number;
  model: NavigationModel<TItem>;
}

interface DestinationProps<TItem> extends RowProps<TItem> {
  label: string;
  /** The explicit "Open group" row carries no badge: its children already show theirs. */
  showBadge: boolean;
}

/** A leaf, or the explicit destination row of a selectable group. Fires onAction and closes. */
function FlyoutDestination<TItem>({
  item,
  depth,
  model,
  label,
  showBadge,
}: DestinationProps<TItem>) {
  const key = model.itemKey(item);
  const selected = model.selectedKey === key;
  const icon = model.getIcon?.(item);
  const badge = showBadge ? model.getBadge?.(item) : null;
  return (
    <Menu.Item
      size="sm"
      className={styles.FlyoutRow}
      style={depthStyle(depth)}
      disabled={model.isDisabled(key)}
      aria-current={selected ? 'page' : undefined}
      data-ov-selected={selected ? 'true' : undefined}
      onClick={() => model.onAction(key, item)}
    >
      {icon ? <span className={styles.FlyoutIcon}>{icon}</span> : null}
      <span className={styles.FlyoutLabel}>{label}</span>
      {hasBadge(badge) ? <span className={styles.FlyoutBadge}>{badge}</span> : null}
    </Menu.Item>
  );
}

interface RowsProps<TItem> {
  items: readonly TItem[];
  depth: number;
  model: NavigationModel<TItem>;
  expanded: ReadonlySet<Key>;
  toggle: (key: Key) => void;
}

interface GroupProps<TItem> extends RowProps<TItem> {
  expanded: ReadonlySet<Key>;
  toggle: (key: Key) => void;
}

/** A group row expands in place; children mount only while it is open. */
function FlyoutGroup<TItem>({ item, depth, model, expanded, toggle }: GroupProps<TItem>) {
  const key = model.itemKey(item);
  const label = model.getTextValue(item);
  const open = expanded.has(key);
  const icon = model.getIcon?.(item);
  const badge = model.getBadge?.(item);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const opens = event.key === 'ArrowRight' && !open;
    const closes = event.key === 'ArrowLeft' && open;
    if (!opens && !closes) return;
    // Handled here, so the popup-level ArrowLeft handler must not also close the flyout.
    event.preventDefault();
    toggle(key);
  };

  return (
    <Fragment>
      <Menu.Item
        size="sm"
        closeOnClick={false}
        className={styles.FlyoutRow}
        style={depthStyle(depth)}
        disabled={model.isDisabled(key)}
        aria-expanded={open}
        data-ov-flyout-group=""
        onClick={() => toggle(key)}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.FlyoutChevron}>
          <ChevronRightIcon />
        </span>
        {icon ? <span className={styles.FlyoutIcon}>{icon}</span> : null}
        <span className={styles.FlyoutLabel}>{label}</span>
        {hasBadge(badge) ? <span className={styles.FlyoutBadge}>{badge}</span> : null}
      </Menu.Item>
      {open ? (
        <div role="group" aria-label={label}>
          {model.isSelectable(item) ? (
            <FlyoutDestination
              item={item}
              depth={depth + 1}
              model={model}
              label={model.getOpenLabel(item)}
              showBadge={false}
            />
          ) : null}
          <FlyoutRows
            items={childrenOf(model, item)}
            depth={depth + 1}
            model={model}
            expanded={expanded}
            toggle={toggle}
          />
        </div>
      ) : null}
    </Fragment>
  );
}

function FlyoutRows<TItem>({ items, depth, model, expanded, toggle }: RowsProps<TItem>) {
  return items.map((item) => {
    const key = String(model.itemKey(item));
    if (!isGroup(model, item)) {
      return (
        <FlyoutDestination
          key={key}
          item={item}
          depth={depth}
          model={model}
          label={model.getTextValue(item)}
          showBadge
        />
      );
    }
    return (
      <FlyoutGroup
        key={key}
        item={item}
        depth={depth}
        model={model}
        expanded={expanded}
        toggle={toggle}
      />
    );
  });
}

interface FlyoutProps<TItem> {
  group: TItem;
  model: NavigationModel<TItem>;
}

/**
 * Menu content for one rail group. It mounts only while the flyout is open, so a closed
 * rail never builds nested nodes, and nested groups mount their children only when expanded.
 * The path to the current selection starts expanded so the selection is visible.
 */
export function RailFlyout<TItem>({ group, model }: FlyoutProps<TItem>) {
  const [expanded, setExpanded] = useState<ReadonlySet<Key>>(
    () => new Set(model.selectedAncestors),
  );
  const toggle = useCallback((key: Key) => {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return (
    <Menu.Group>
      <Menu.GroupLabel className={styles.FlyoutHeading}>
        {model.getTextValue(group)}
      </Menu.GroupLabel>
      {model.isSelectable(group) ? (
        <FlyoutDestination
          item={group}
          depth={0}
          model={model}
          label={model.getOpenLabel(group)}
          showBadge={false}
        />
      ) : null}
      <FlyoutRows
        items={childrenOf(model, group)}
        depth={0}
        model={model}
        expanded={expanded}
        toggle={toggle}
      />
    </Menu.Group>
  );
}
