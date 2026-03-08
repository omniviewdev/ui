import {
  forwardRef,
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useSyncExternalStore,
  Fragment,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type {
  CommandListRootProps,
  CommandListItemProps,
  CommandItemMeta,
  CommandGroup,
  HighlightRange,
  Key,
} from './types';
import { useCommandListState } from './hooks/useCommandListState';
import { useCommandListItem as useCommandListItemHook } from './hooks/useCommandListItem';
import { useCommandListFocus } from './hooks/useCommandListFocus';
import { useListVirtualizer } from '../list/hooks/useListVirtualizer';
import {
  CommandListConfigContext,
  CommandListStoreContext,
  CommandListActionsContext,
  useCommandListConfig,
  useCommandListStoreContext,
  useCommandListActions,
} from './context/CommandListContext';
import {
  MdKeyboardCommandKey,
  MdKeyboardOptionKey,
  MdKeyboardControlKey,
} from 'react-icons/md';
import { BsShift } from 'react-icons/bs';
import { SearchInput, type SearchInputProps } from '../search-input';
import { Hotkey } from '../typography/Hotkey';
import styles from './CommandList.module.css';

// ---------------------------------------------------------------------------
// RenderItem context — typed without TItem. Root closes over the generic;
// Results only sees (key, meta) → ReactNode.
// ---------------------------------------------------------------------------

type RenderItemFn = (key: Key, meta: CommandItemMeta) => ReactNode;

const RenderItemContext = createContext<RenderItemFn | null>(null);

function useRenderItem(): RenderItemFn {
  const ctx = useContext(RenderItemContext);
  if (!ctx) {
    throw new Error('CommandList.Results must be used within <CommandList.Root>');
  }
  return ctx;
}

// Groups context — passes grouped items to Results
const GroupsContext = createContext<CommandGroup[] | null>(null);

function useGroups(): CommandGroup[] {
  const ctx = useContext(GroupsContext);
  if (!ctx) {
    throw new Error('CommandList.Results must be used within <CommandList.Root>');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

function CommandListRootImpl<TItem>(
  {
    className,
    variant,
    color,
    size,
    children,
    onKeyDown,
    // Extract managed props so they don't spread to DOM
    items,
    itemKey,
    getTextValue,
    renderItem,
    query: queryProp,
    defaultQuery,
    onQueryChange,
    filterFn,
    sortByScore,
    groupBy,
    groupOrder,
    groupLabel,
    highlights,
    disabledKeys: disabledKeysProp,
    onAction,
    onDismiss,
    loading,
    density,
    loopFocus,
    placeholder,
    virtualized,
    overscan,
    estimatedItemSize,
    ...domProps
  }: CommandListRootProps<TItem>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { config, store, actions, groups } = useCommandListState<TItem>({
    items,
    itemKey,
    getTextValue,
    renderItem,
    query: queryProp,
    defaultQuery,
    onQueryChange,
    filterFn,
    sortByScore,
    groupBy,
    groupOrder,
    groupLabel,
    highlights,
    disabledKeys: disabledKeysProp,
    onAction,
    onDismiss,
    loading,
    density,
    loopFocus,
    placeholder,
    virtualized,
    overscan,
    estimatedItemSize,
    children,
  });

  const listId = useId();
  const resultsId = `${listId}-results`;
  const fullConfig = useMemo(
    () => ({ ...config, listId }),
    [config, listId],
  );

  // Build renderItem closure that captures TItem
  const itemsMap = useMemo(() => {
    const m = new Map<Key, TItem>();
    for (const item of items) m.set(itemKey(item), item);
    return m;
  }, [items, itemKey]);

  const itemsMapRef = useRef(itemsMap);
  itemsMapRef.current = itemsMap;

  const renderItemFn: RenderItemFn = useCallback(
    (key: Key, meta: CommandItemMeta) => {
      const item = itemsMapRef.current.get(key);
      if (item === undefined) return null;
      return renderItem(item, meta);
    },
    [renderItem],
  );

  const { handleKeyDown } = useCommandListFocus({ config: fullConfig, actions, store });

  const activeDescendantId = useSyncExternalStore(
    store.subscribe,
    () => {
      const snapshot = store.getSnapshot();
      return snapshot.activeKey != null ? `${listId}-item-${snapshot.activeKey}` : undefined;
    },
    () => undefined,
  );

  const combinedKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      handleKeyDown(event);
      onKeyDown?.(event);
    },
    [handleKeyDown, onKeyDown],
  );

  return (
    <RenderItemContext.Provider value={renderItemFn}>
      <GroupsContext.Provider value={groups as CommandGroup[]}>
        <CommandListConfigContext.Provider value={fullConfig}>
          <CommandListStoreContext.Provider value={store}>
            <CommandListActionsContext.Provider value={actions}>
              <div
                ref={ref}
                role="combobox"
                aria-expanded="true"
                aria-haspopup="listbox"
                aria-owns={resultsId}
                aria-activedescendant={activeDescendantId}
                className={cn(styles.Root, className)}
                data-ov-density={fullConfig.density}
                data-ov-list-id={listId}
                onKeyDown={combinedKeyDown}
                {...styleDataAttributes({ variant, color, size })}
                {...domProps}
              >
                {children}
              </div>
            </CommandListActionsContext.Provider>
          </CommandListStoreContext.Provider>
        </CommandListConfigContext.Provider>
      </GroupsContext.Provider>
    </RenderItemContext.Provider>
  );
}

const CommandListRoot = forwardRef(CommandListRootImpl) as <TItem>(
  props: CommandListRootProps<TItem> & { ref?: Ref<HTMLDivElement> },
) => ReactNode;

// ---------------------------------------------------------------------------
// Input — wraps the existing SearchInput component
// ---------------------------------------------------------------------------

interface CommandListInputProps extends Omit<SearchInputProps, 'value' | 'onValueChange'> {
  autoFocus?: boolean;
}

const CommandListInput = forwardRef<HTMLInputElement, CommandListInputProps>(
  function CommandListInput({ className, autoFocus = true, variant = 'ghost', ...props }, ref) {
    const config = useCommandListConfig();
    const store = useCommandListStoreContext();
    const actions = useCommandListActions();

    const query = useSyncExternalStore(
      store.subscribe,
      () => store.getSnapshot().query,
      () => '',
    );

    const handleValueChange = useCallback(
      (value: string) => {
        actions.setQuery(value);
      },
      [actions],
    );

    return (
      <SearchInput
        ref={ref}
        className={cn(styles.Input, className)}
        value={query}
        onValueChange={handleValueChange}
        placeholder={config.placeholder}
        variant={variant}
        clearable
        autoFocus={autoFocus}
        aria-autocomplete="list"
        aria-controls={`${config.listId}-results`}
        {...props}
      />
    );
  },
);

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

type CommandListResultsProps = HTMLAttributes<HTMLDivElement>;

function mergeRefs<T>(
  localRef: RefObject<T | null>,
  forwardedRef: Ref<T> | null,
): (node: T | null) => void {
  return (node) => {
    (localRef as { current: T | null }).current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) (forwardedRef as { current: T | null }).current = node;
  };
}

const CommandListResults = forwardRef<HTMLDivElement, CommandListResultsProps>(
  function CommandListResults({ className, children, ...props }, ref) {
    const config = useCommandListConfig();
    const store = useCommandListStoreContext();
    const scrollRef = useRef<HTMLDivElement>(null);
    const renderItem = useRenderItem();
    const groups = useGroups();

    // useSyncExternalStore triggers re-renders on store changes (active item,
    // loading, etc.). The snapshot itself is unused — actual data is read via
    // store.getItems() / store.getItemState() for grouped rendering below.
    const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    const allItems = store.getItems();
    void snapshot;

    const virtualizer = useListVirtualizer({
      count: allItems.length,
      scrollRef,
      enabled: config.virtualized,
      estimatedItemSize: config.estimatedItemSize,
      overscan: config.overscan,
    });

    const mergedRef = mergeRefs(scrollRef, ref);

    const resultsId = `${config.listId}-results`;

    if (config.virtualized) {
      return (
        <div
          ref={mergedRef}
          id={resultsId}
          role="listbox"
          className={cn(styles.Results, className)}
          {...props}
        >
          <div style={{ height: virtualizer.totalSize, position: 'relative' }}>
            {virtualizer.virtualItems.map((virtualItem) => {
              const procItem = allItems[virtualItem.index];
              if (!procItem) return null;
              const meta: CommandItemMeta = {
                key: procItem.key,
                isActive: store.getItemState(procItem.key).isActive,
                isDisabled: procItem.disabled,
                groupKey: procItem.groupKey,
                score: procItem.score,
                highlights: procItem.highlights,
              };
              return (
                <div
                  key={procItem.key}
                  ref={virtualizer.measureElement}
                  data-index={virtualItem.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  {renderItem(procItem.key, meta)}
                </div>
              );
            })}
          </div>
          {children}
        </div>
      );
    }

    // Non-virtualized: render grouped items
    const hasGroups = groups.length > 1 || (groups.length === 1 && groups[0]!.key !== '__default');

    return (
      <div
        ref={mergedRef}
        id={resultsId}
        role="listbox"
        className={cn(styles.Results, className)}
        {...props}
      >
        {hasGroups
          ? groups.map((group) => {
              if (group.items.length === 0) return null;
              const headerId = `${config.listId}-group-${group.key}`;
              return (
                <div key={group.key} role="group" aria-labelledby={headerId} className={styles.Group}>
                  {group.label && (
                    <div id={headerId} role="presentation" className={styles.GroupHeader}>
                      {group.label}
                    </div>
                  )}
                  {group.items.map((procItem) => {
                    const meta: CommandItemMeta = {
                      key: procItem.key,
                      isActive: store.getItemState(procItem.key).isActive,
                      isDisabled: procItem.disabled,
                      groupKey: procItem.groupKey,
                      score: procItem.score,
                      highlights: procItem.highlights,
                    };
                    return (
                      <Fragment key={procItem.key}>
                        {renderItem(procItem.key, meta)}
                      </Fragment>
                    );
                  })}
                </div>
              );
            })
          : allItems.map((procItem) => {
              const meta: CommandItemMeta = {
                key: procItem.key,
                isActive: store.getItemState(procItem.key).isActive,
                isDisabled: procItem.disabled,
                groupKey: procItem.groupKey,
                score: procItem.score,
                highlights: procItem.highlights,
              };
              return (
                <Fragment key={procItem.key}>
                  {renderItem(procItem.key, meta)}
                </Fragment>
              );
            })}
        {children}
      </div>
    );
  },
);

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

const CommandListItem = forwardRef<HTMLDivElement, CommandListItemProps>(
  function CommandListItem(
    { className, itemKey, disabled = false, children, onClick, ...props },
    ref,
  ) {
    const store = useCommandListStoreContext();
    const actions = useCommandListActions();
    const config = useCommandListConfig();
    const itemState = useCommandListItemHook(store, itemKey);

    const isDisabled = disabled || itemState.isDisabled;

    const handleClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        if (isDisabled) {
          onClick?.(event);
          return;
        }
        actions.invoke(itemKey);
        onClick?.(event);
      },
      [isDisabled, actions, itemKey, onClick],
    );

    const handleMouseMove = useCallback(() => {
      if (!isDisabled && !itemState.isActive) {
        store.setActiveKey(itemKey);
      }
    }, [isDisabled, itemState.isActive, store, itemKey]);

    return (
      <div
        ref={ref}
        id={`${config.listId}-item-${itemKey}`}
        role="option"
        aria-selected={itemState.isActive || undefined}
        aria-disabled={isDisabled || undefined}
        className={cn(styles.Item, className)}
        data-ov-active={itemState.isActive}
        data-ov-disabled={isDisabled}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        {...props}
      >
        {children}
      </div>
    );
  },
);

// ---------------------------------------------------------------------------
// ItemIcon
// ---------------------------------------------------------------------------

const CommandListItemIcon = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function CommandListItemIcon({ className, ...props }, ref) {
    return <span ref={ref} className={cn(styles.ItemIcon, className)} {...props} />;
  },
);

// ---------------------------------------------------------------------------
// ItemLabel (with highlight support)
// ---------------------------------------------------------------------------

interface CommandListItemLabelProps extends HTMLAttributes<HTMLSpanElement> {
  highlights?: HighlightRange[];
}

function splitByRanges(text: string, ranges: HighlightRange[]): { text: string; highlighted: boolean }[] {
  if (!ranges.length) return [{ text, highlighted: false }];

  // Clamp ranges to text bounds and discard invalid ones
  const clamped: HighlightRange[] = [];
  for (const r of ranges) {
    const start = Math.max(0, Math.min(r.start, text.length));
    const end = Math.max(0, Math.min(r.end, text.length));
    if (start < end) clamped.push({ start, end });
  }
  if (!clamped.length) return [{ text, highlighted: false }];

  // Sort and merge overlapping ranges
  const sorted = clamped.sort((a, b) => a.start - b.start);
  const merged: HighlightRange[] = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ start: range.start, end: range.end });
    }
  }

  const segments: { text: string; highlighted: boolean }[] = [];
  let cursor = 0;

  for (const range of merged) {
    if (cursor < range.start) {
      segments.push({ text: text.slice(cursor, range.start), highlighted: false });
    }
    segments.push({ text: text.slice(range.start, range.end), highlighted: true });
    cursor = range.end;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlighted: false });
  }

  return segments;
}

const CommandListItemLabel = forwardRef<HTMLSpanElement, CommandListItemLabelProps>(
  function CommandListItemLabel({ className, children, highlights, ...props }, ref) {
    if (highlights?.length && typeof children === 'string') {
      const segments = splitByRanges(children, highlights);
      return (
        <span ref={ref} className={cn(styles.ItemLabel, className)} {...props}>
          {segments.map((seg, i) =>
            seg.highlighted
              ? <mark key={i} className={styles.Highlight}>{seg.text}</mark>
              : <span key={i}>{seg.text}</span>,
          )}
        </span>
      );
    }

    return <span ref={ref} className={cn(styles.ItemLabel, className)} {...props}>{children}</span>;
  },
);

// ---------------------------------------------------------------------------
// ItemDescription
// ---------------------------------------------------------------------------

const CommandListItemDescription = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function CommandListItemDescription({ className, ...props }, ref) {
    return <span ref={ref} className={cn(styles.ItemDescription, className)} {...props} />;
  },
);

// ---------------------------------------------------------------------------
// ItemShortcut — renders each key using the Hotkey typography component
// ---------------------------------------------------------------------------

/** Known modifier symbols that should each get their own badge. */
const MODIFIER_CHARS = new Set(['⌘', '⇧', '⌥', '⌃']);

/** Modifier key → react-icons component for consistent rendering. */
const MODIFIER_ICONS: Record<string, ReactNode> = {
  '⌘': <MdKeyboardCommandKey aria-hidden />,
  '⇧': <BsShift aria-hidden />,
  '⌥': <MdKeyboardOptionKey aria-hidden />,
  '⌃': <MdKeyboardControlKey aria-hidden />,
};

/**
 * Split a shortcut string like "⌘⇧F" into individual key tokens: ["⌘", "⇧", "F"].
 * Modifier symbols are always split individually. Multi-char keys like "F5" stay together.
 * Space-separated chords like "⌘K ⌘S" are split at spaces first.
 */
function splitShortcut(shortcut: string): string[] {
  const chordParts = shortcut.split(/\s+/).filter(Boolean);
  const keys: string[] = [];

  for (const part of chordParts) {
    let i = 0;
    while (i < part.length) {
      const char = part[i]!;
      if (MODIFIER_CHARS.has(char)) {
        keys.push(char);
        i++;
      } else {
        keys.push(part.slice(i));
        break;
      }
    }
  }

  return keys;
}

/** Render a single key token — SVG icon for modifiers, text for regular keys. */
function renderKeyBadge(key: string, index: number) {
  const icon = MODIFIER_ICONS[key];
  return (
    <Hotkey key={index} size="sm" tone="muted">
      {icon ?? key}
    </Hotkey>
  );
}

interface CommandListItemShortcutProps extends HTMLAttributes<HTMLSpanElement> {
  /** Pre-split key labels. If omitted, children string is auto-split. */
  keys?: string[];
}

const CommandListItemShortcut = forwardRef<HTMLSpanElement, CommandListItemShortcutProps>(
  function CommandListItemShortcut({ className, children, keys: keysProp, ...props }, ref) {
    let resolvedKeys: string[] | null = keysProp ?? null;
    if (!resolvedKeys && typeof children === 'string') {
      resolvedKeys = splitShortcut(children);
    } else if (resolvedKeys) {
      resolvedKeys = resolvedKeys.flatMap(splitShortcut);
    }

    if (resolvedKeys) {
      return (
        <span ref={ref} className={cn(styles.ItemShortcut, className)} {...props}>
          {resolvedKeys.map(renderKeyBadge)}
        </span>
      );
    }

    return (
      <span ref={ref} className={cn(styles.ItemShortcut, className)} {...props}>
        {children}
      </span>
    );
  },
);

// ---------------------------------------------------------------------------
// Empty
// ---------------------------------------------------------------------------

interface CommandListEmptyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CommandListEmpty = forwardRef<HTMLDivElement, CommandListEmptyProps>(
  function CommandListEmpty({ className, ...props }, ref) {
    const store = useCommandListStoreContext();
    const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

    if (snapshot.visibleCount > 0 || snapshot.loading) return null;
    return <div ref={ref} className={cn(styles.Empty, className)} {...props} />;
  },
);

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

interface CommandListLoadingProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const CommandListLoading = forwardRef<HTMLDivElement, CommandListLoadingProps>(
  function CommandListLoading({ className, children, ...props }, ref) {
    const store = useCommandListStoreContext();
    const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

    if (!snapshot.loading) return null;
    return (
      <div ref={ref} className={cn(styles.Loading, className)} {...props}>
        {children ?? 'Loading\u2026'}
      </div>
    );
  },
);

// ---------------------------------------------------------------------------
// Display names
// ---------------------------------------------------------------------------

(CommandListRoot as { displayName?: string }).displayName = 'CommandList';
CommandListInput.displayName = 'CommandList.Input';
CommandListResults.displayName = 'CommandList.Results';
CommandListItem.displayName = 'CommandList.Item';
CommandListItemIcon.displayName = 'CommandList.ItemIcon';
CommandListItemLabel.displayName = 'CommandList.ItemLabel';
CommandListItemDescription.displayName = 'CommandList.ItemDescription';
CommandListItemShortcut.displayName = 'CommandList.ItemShortcut';
CommandListEmpty.displayName = 'CommandList.Empty';
CommandListLoading.displayName = 'CommandList.Loading';

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

type CommandListCompound = typeof CommandListRoot & {
  Root: typeof CommandListRoot;
  Input: typeof CommandListInput;
  Results: typeof CommandListResults;
  Item: typeof CommandListItem;
  ItemIcon: typeof CommandListItemIcon;
  ItemLabel: typeof CommandListItemLabel;
  ItemDescription: typeof CommandListItemDescription;
  ItemShortcut: typeof CommandListItemShortcut;
  Empty: typeof CommandListEmpty;
  Loading: typeof CommandListLoading;
};

export const CommandList = Object.assign(CommandListRoot, {
  Root: CommandListRoot,
  Input: CommandListInput,
  Results: CommandListResults,
  Item: CommandListItem,
  ItemIcon: CommandListItemIcon,
  ItemLabel: CommandListItemLabel,
  ItemDescription: CommandListItemDescription,
  ItemShortcut: CommandListItemShortcut,
  Empty: CommandListEmpty,
  Loading: CommandListLoading,
}) as CommandListCompound;
