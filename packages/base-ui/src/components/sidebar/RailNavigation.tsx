import type { Menu as BaseMenu } from '@base-ui/react/menu';
import type { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
  forwardRef,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../system/classnames';
import { Menu } from '../menu';
import { Tooltip } from '../tooltip';
import type { Key } from '../tree-list/types';
import { useSidebarContext } from './context';
import { RailFlyout } from './RailFlyout';
import { fallbackGlyph, hasBadge, isGroup, type NavigationModel } from './navigationModel';
import styles from './SidebarNavigation.module.css';

/** Hover intent before a group flyout opens, and the grace before it closes. */
const FLYOUT_OPEN_DELAY = 160;
const FLYOUT_CLOSE_DELAY = 120;
const TOOLTIP_DELAY = 280;
const TOOLTIP_TIMEOUT = 400;

/** Flyouts slide along the rail to stay inside the viewport gutters instead of flipping. */
const FLYOUT_COLLISION = { side: 'flip', align: 'shift', fallbackAxisSide: 'none' } as const;

/** Labels appear on keyboard focus for every row; hover owns groups (flyout) and peek. */
function cancelHoverOpen(_open: boolean, details: BaseTooltip.Root.ChangeEventDetails) {
  if (details.reason === 'trigger-hover') details.cancel();
}

interface RailButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  itemKey: Key;
  label: string;
  icon: ReactNode;
  badge: ReactNode;
  /** The row is the current destination. */
  selected: boolean;
  /** The row is, or contains, the current destination: drives the accent cue. */
  hasSelected: boolean;
  tabStop: boolean;
}

/** The icon-only row. Tooltip and Menu triggers compose onto it through their render props. */
const RailButton = forwardRef<HTMLButtonElement, RailButtonProps>(function RailButton(
  { itemKey, label, icon, badge, selected, hasSelected, tabStop, className, ...rest },
  ref,
) {
  const badgeId = useId();
  const badgeVisible = hasBadge(badge);
  const existingDescription = rest['aria-describedby'];
  const description = badgeVisible
    ? existingDescription
      ? `${existingDescription} ${badgeId}`
      : badgeId
    : existingDescription;
  return (
    <button
      type="button"
      {...rest}
      ref={ref}
      className={cn(styles.RailButton, className)}
      aria-label={label}
      aria-describedby={description}
      tabIndex={tabStop ? 0 : -1}
      data-ov-rail-item=""
      data-ov-rail-key={String(itemKey)}
      data-ov-selected={selected ? 'true' : undefined}
      data-ov-has-selected={hasSelected ? 'true' : undefined}
    >
      <span className={styles.RailIcon} aria-hidden="true">
        {icon ?? <span className={styles.FallbackGlyph}>{fallbackGlyph(label)}</span>}
      </span>
      {badgeVisible ? (
        <span id={badgeId} className={styles.RailBadge}>
          {badge}
        </span>
      ) : null}
    </button>
  );
});

function RailTooltip({ label }: { label: string }) {
  return (
    <Tooltip.Portal>
      <Tooltip.Positioner side="right" sideOffset={8}>
        <Tooltip.Popup>{label}</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  );
}

interface ItemProps<TItem> {
  item: TItem;
  model: NavigationModel<TItem>;
  tabStop: boolean;
  hoverPeek: boolean;
  onFocusKey: (key: Key) => void;
}

function RailLeaf<TItem>({ item, model, tabStop, hoverPeek, onFocusKey }: ItemProps<TItem>) {
  const key = model.itemKey(item);
  const label = model.getTextValue(item);
  const selected = model.selectedKey === key;
  return (
    <Tooltip.Root onOpenChange={hoverPeek ? cancelHoverOpen : undefined}>
      <Tooltip.Trigger
        render={
          <RailButton
            itemKey={key}
            label={label}
            icon={model.getIcon?.(item)}
            badge={model.getBadge?.(item)}
            selected={selected}
            hasSelected={selected}
            tabStop={tabStop}
            aria-current={selected ? 'page' : undefined}
            disabled={model.isDisabled(key)}
            onFocus={() => onFocusKey(key)}
            onClick={() => model.onAction(key, item)}
          />
        }
      />
      <RailTooltip label={label} />
    </Tooltip.Root>
  );
}

function RailGroup<TItem>({ item, model, tabStop, hoverPeek, onFocusKey }: ItemProps<TItem>) {
  const key = model.itemKey(item);
  const label = model.getTextValue(item);
  const selected = model.selectedKey === key;
  const disabled = model.isDisabled(key);
  return (
    <Tooltip.Root onOpenChange={cancelHoverOpen}>
      <Tooltip.Trigger
        render={
          <Menu.Trigger
            payload={item}
            disabled={disabled}
            openOnHover={!hoverPeek}
            delay={FLYOUT_OPEN_DELAY}
            closeDelay={FLYOUT_CLOSE_DELAY}
            render={
              <RailButton
                itemKey={key}
                label={label}
                icon={model.getIcon?.(item)}
                badge={model.getBadge?.(item)}
                selected={selected}
                hasSelected={selected || model.selectedAncestors.has(key)}
                tabStop={tabStop}
                disabled={disabled}
                onFocus={() => onFocusKey(key)}
              />
            }
          />
        }
      />
      <RailTooltip label={label} />
    </Tooltip.Root>
  );
}

interface RailNavigationProps<TItem> {
  items: readonly TItem[];
  model: NavigationModel<TItem>;
  label: string;
}

/**
 * The collapsed projection: one icon row per top-level item with a single tab stop.
 * Leaves show a label tooltip and act; groups open a bounded, scrollable Menu flyout.
 */
export function RailNavigation<TItem>({ items, model, label }: RailNavigationProps<TItem>) {
  const { hoverPeek, collapsed } = useSidebarContext('Sidebar.Navigation');
  const [focusKey, setFocusKey] = useState<Key | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const actions = useRef<BaseMenu.Root.Actions | null>(null);
  useLayoutEffect(() => {
    if (!collapsed) actions.current?.close();
  }, [collapsed]);

  const enabledKeys = items
    .map((item) => model.itemKey(item))
    .filter((key) => !model.isDisabled(key));
  const rovingKey =
    focusKey !== null && enabledKeys.includes(focusKey)
      ? focusKey
      : model.selectedRootKey !== null && enabledKeys.includes(model.selectedRootKey)
        ? model.selectedRootKey
        : (enabledKeys[0] ?? null);

  // Capture phase: the menu triggers also bind the vertical arrows to opening, and stop the
  // event, so the roving handler must run before they see it.
  const handleKeyDownCapture = (event: KeyboardEvent<HTMLUListElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.hasAttribute('data-ov-rail-item')) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

    // A real click, so the menu opens through its own keyboard path and focuses its first row.
    if (event.key === 'ArrowRight' && target.getAttribute('aria-haspopup') === 'menu') {
      event.preventDefault();
      event.stopPropagation();
      target.click();
      return;
    }

    const buttons = Array.from(
      list.current?.querySelectorAll<HTMLElement>('[data-ov-rail-item]:not(:disabled)') ?? [],
    );
    const index = buttons.indexOf(target);
    let next = -1;
    if (event.key === 'ArrowDown') next = Math.min(index + 1, buttons.length - 1);
    else if (event.key === 'ArrowUp') next = Math.max(index - 1, 0);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = buttons.length - 1;
    if (next < 0) return;
    event.preventDefault();
    event.stopPropagation();
    buttons[next]?.focus();
  };

  const handlePopupKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' || event.defaultPrevented) return;
    event.preventDefault();
    actions.current?.close();
  };

  return (
    <Menu.Root modal={false} actionsRef={actions} disabled={!collapsed}>
      {({ payload }) => {
        // Every menu trigger below supplies a TItem from this navigation's items.
        const group = payload as TItem | undefined;
        return (
          <Tooltip.Provider delay={TOOLTIP_DELAY} closeDelay={0} timeout={TOOLTIP_TIMEOUT}>
            <ul
              ref={list}
              role="list"
              aria-label={label}
              className={styles.RailList}
              onKeyDownCapture={handleKeyDownCapture}
            >
              {items.map((item) => {
                const key = model.itemKey(item);
                const sectionLabel = model.getSectionLabel?.(item);
                return (
                  <li key={String(key)} className={styles.RailListItem}>
                    {sectionLabel ? (
                      <div
                        role="separator"
                        aria-label={sectionLabel}
                        className={styles.RailSection}
                      />
                    ) : null}
                    {isGroup(model, item) ? (
                      <RailGroup
                        item={item}
                        model={model}
                        tabStop={key === rovingKey}
                        hoverPeek={hoverPeek}
                        onFocusKey={setFocusKey}
                      />
                    ) : (
                      <RailLeaf
                        item={item}
                        model={model}
                        tabStop={key === rovingKey}
                        hoverPeek={hoverPeek}
                        onFocusKey={setFocusKey}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
            <Menu.Portal>
              <Menu.Positioner
                side="right"
                align="start"
                sideOffset={6}
                alignOffset={-4}
                collisionPadding={8}
                collisionAvoidance={FLYOUT_COLLISION}
              >
                <Menu.Popup
                  size="sm"
                  className={styles.FlyoutPopup}
                  finalFocus={() => collapsed}
                  data-ov-sidebar-flyout=""
                  onKeyDown={handlePopupKeyDown}
                >
                  {group !== undefined ? (
                    <RailFlyout key={String(model.itemKey(group))} group={group} model={model} />
                  ) : null}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Tooltip.Provider>
        );
      }}
    </Menu.Root>
  );
}
