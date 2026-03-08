import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useRef,
  useSyncExternalStore,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { LuCheck, LuMinus } from 'react-icons/lu';
import { cn } from '../../system/classnames';
import { List } from '../list';
import type { Key } from '../list';
import {
  useListStoreContext,
  useListActions,
} from '../list/context/ListContext';
import type { CheckBehavior, SelectableListRootProps, SelectableListItemProps, SelectableListItemIndicatorProps, SelectableListSelectAllProps, SelectableListSelectionSummaryProps, SelectableListGroupSelectAllProps } from './types';
import styles from './SelectableList.module.css';

// ---------------------------------------------------------------------------
// Internal contexts
// ---------------------------------------------------------------------------

const SelectableListContext = createContext<{ checkBehavior: CheckBehavior }>({
  checkBehavior: 'checkbox',
});

const ItemKeyContext = createContext<Key | null>(null);

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const SelectableListRoot = forwardRef<HTMLDivElement, SelectableListRootProps>(
  function SelectableListRoot(
    { className, checkBehavior, selectionMode = 'multiple', ...props },
    ref,
  ) {
    const resolved: CheckBehavior =
      checkBehavior ?? (selectionMode === 'single' ? 'radio' : 'checkbox');

    return (
      <SelectableListContext.Provider value={{ checkBehavior: resolved }}>
        <List.Root
          ref={ref}
          className={cn(styles.Root, className)}
          selectionMode={selectionMode}
          selectionBehavior="toggle"
          {...props}
        />
      </SelectableListContext.Provider>
    );
  },
);

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

const SelectableListItem = forwardRef<HTMLDivElement, SelectableListItemProps>(
  function SelectableListItem({ className, itemKey, ...props }, ref) {
    return (
      <ItemKeyContext.Provider value={itemKey}>
        <List.Item
          ref={ref}
          className={cn(styles.Item, className)}
          itemKey={itemKey}
          {...props}
        />
      </ItemKeyContext.Provider>
    );
  },
);

// ---------------------------------------------------------------------------
// ItemIndicator
// ---------------------------------------------------------------------------

const SelectableListItemIndicator = forwardRef<
  HTMLSpanElement,
  SelectableListItemIndicatorProps
>(function SelectableListItemIndicator({ className, ...props }, ref) {
  const store = useListStoreContext();
  const { checkBehavior } = useContext(SelectableListContext);
  const itemKey = useContext(ItemKeyContext);

  if (itemKey == null) {
    throw new Error(
      'SelectableList.ItemIndicator must be used within <SelectableList.Item>',
    );
  }

  const prevRef = useRef<{ isSelected: boolean }>({ isSelected: false });

  const isSelected = useSyncExternalStore(
    store.subscribe,
    () => {
      const next = store.getItemState(itemKey).isSelected;
      if (prevRef.current.isSelected === next) return prevRef.current.isSelected;
      prevRef.current = { isSelected: next };
      return next;
    },
    () => false,
  );

  const isCheckbox = checkBehavior === 'checkbox';

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        styles.IndicatorWrapper,
        isCheckbox ? styles.CheckboxIndicator : styles.RadioIndicator,
        className,
      )}
      data-checked={isSelected ? '' : undefined}
      {...props}
    >
      <span className={styles.IndicatorControl}>
        {isCheckbox ? (
          <LuCheck className={styles.IndicatorIcon} />
        ) : (
          isSelected && <span className={styles.RadioDot} />
        )}
      </span>
    </span>
  );
});

// ---------------------------------------------------------------------------
// SelectAll
// ---------------------------------------------------------------------------

interface SelectAllSnapshot {
  allSelected: boolean;
  someSelected: boolean;
  totalEnabled: number;
}

const SelectableListSelectAll = forwardRef<
  HTMLDivElement,
  SelectableListSelectAllProps
>(function SelectableListSelectAll(
  { className, children, onClick, onKeyDown: onKeyDownProp, ...props },
  ref,
) {
  const store = useListStoreContext();
  const actions = useListActions();
  const { checkBehavior } = useContext(SelectableListContext);

  const prevRef = useRef<SelectAllSnapshot>({
    allSelected: false,
    someSelected: false,
    totalEnabled: 0,
  });

  const snapshot = useSyncExternalStore(
    store.subscribe,
    () => {
      const s = store.getSnapshot();
      const registered = s.registeredKeys;
      const enabled = registered.filter((k) => !s.disabledKeys.has(k));
      const totalEnabled = enabled.length;
      const selectedCount = totalEnabled > 0
        ? enabled.filter((k) => s.selectedKeys.has(k)).length
        : 0;
      const allSelected = totalEnabled > 0 && selectedCount === totalEnabled;
      const someSelected = selectedCount > 0 && !allSelected;

      const prev = prevRef.current;
      if (
        prev.allSelected === allSelected &&
        prev.someSelected === someSelected &&
        prev.totalEnabled === totalEnabled
      ) {
        return prev;
      }
      const next = { allSelected, someSelected, totalEnabled };
      prevRef.current = next;
      return next;
    },
    () => prevRef.current,
  );

  const handleToggle = useCallback(() => {
    if (snapshot.allSelected) {
      // Only deselect enabled keys so disabled-but-selected items stay selected
      const s = store.getSnapshot();
      const enabled = s.registeredKeys.filter((k) => !s.disabledKeys.has(k));
      for (const k of enabled) {
        actions.deselect(k);
      }
    } else {
      actions.selectAll();
    }
  }, [snapshot.allSelected, actions, store]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      handleToggle();
      onClick?.(event);
    },
    [handleToggle, onClick],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleToggle();
      }
      onKeyDownProp?.(event);
    },
    [handleToggle, onKeyDownProp],
  );

  const isCheckbox = checkBehavior === 'checkbox';
  const ariaChecked = snapshot.allSelected
    ? true
    : snapshot.someSelected
      ? ('mixed' as const)
      : false;

  return (
    <div
      {...props}
      ref={ref}
      role="checkbox"
      aria-checked={ariaChecked}
      tabIndex={0}
      className={cn(styles.SelectAll, className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span
        aria-hidden="true"
        className={cn(
          styles.IndicatorWrapper,
          isCheckbox ? styles.CheckboxIndicator : styles.RadioIndicator,
        )}
        data-checked={snapshot.allSelected ? '' : undefined}
        data-indeterminate={snapshot.someSelected ? '' : undefined}
      >
        <span className={styles.IndicatorControl}>
          {isCheckbox ? (
            snapshot.someSelected ? (
              <LuMinus className={styles.IndicatorIcon} />
            ) : (
              <LuCheck className={styles.IndicatorIcon} />
            )
          ) : (
            snapshot.allSelected && <span className={styles.RadioDot} />
          )}
        </span>
      </span>
      {children && <span className={styles.SelectAllLabel}>{children}</span>}
    </div>
  );
});

// ---------------------------------------------------------------------------
// SelectionSummary
// ---------------------------------------------------------------------------

const SelectableListSelectionSummary = forwardRef<
  HTMLDivElement,
  SelectableListSelectionSummaryProps
>(function SelectableListSelectionSummary(
  { className, children, ...props },
  ref,
) {
  const store = useListStoreContext();

  const prevRef = useRef<{ selected: number; total: number }>({
    selected: 0,
    total: 0,
  });

  const counts = useSyncExternalStore(
    store.subscribe,
    () => {
      const s = store.getSnapshot();
      const selected = s.selectedKeys.size;
      const total = s.registeredKeys.length;
      const prev = prevRef.current;
      if (prev.selected === selected && prev.total === total) return prev;
      const next = { selected, total };
      prevRef.current = next;
      return next;
    },
    () => prevRef.current,
  );

  let content: ReactNode;
  if (typeof children === 'function') {
    content = children(counts.selected, counts.total);
  } else if (children != null) {
    content = children;
  } else {
    content = `${counts.selected} of ${counts.total} selected`;
  }

  return (
    <div
      ref={ref}
      className={cn(styles.SelectionSummary, className)}
      {...props}
    >
      {content}
    </div>
  );
});

// ---------------------------------------------------------------------------
// GroupSelectAll
// ---------------------------------------------------------------------------

const SelectableListGroupSelectAll = forwardRef<
  HTMLDivElement,
  SelectableListGroupSelectAllProps
>(function SelectableListGroupSelectAll(
  { className, groupKeys, children, onClick, onKeyDown: onKeyDownProp, ...props },
  ref,
) {
  const store = useListStoreContext();
  const actions = useListActions();
  const { checkBehavior } = useContext(SelectableListContext);

  const prevRef = useRef<{ allSelected: boolean; someSelected: boolean }>({
    allSelected: false,
    someSelected: false,
  });

  const snapshot = useSyncExternalStore(
    store.subscribe,
    () => {
      const s = store.getSnapshot();
      const enabled = groupKeys.filter((k) => !s.disabledKeys.has(k));
      const selectedCount = enabled.filter((k) =>
        s.selectedKeys.has(k),
      ).length;
      const allSelected = enabled.length > 0 && selectedCount === enabled.length;
      const someSelected = selectedCount > 0 && !allSelected;

      const prev = prevRef.current;
      if (
        prev.allSelected === allSelected &&
        prev.someSelected === someSelected
      ) {
        return prev;
      }
      const next = { allSelected, someSelected };
      prevRef.current = next;
      return next;
    },
    () => prevRef.current,
  );

  const handleToggle = useCallback(() => {
    const s = store.getSnapshot();
    const enabled = groupKeys.filter((k) => !s.disabledKeys.has(k));

    if (snapshot.allSelected) {
      for (const k of enabled) {
        actions.deselect(k);
      }
    } else {
      for (const k of enabled) {
        actions.select(k);
      }
    }
  }, [snapshot.allSelected, store, groupKeys, actions]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      handleToggle();
      onClick?.(event);
    },
    [handleToggle, onClick],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleToggle();
      }
      onKeyDownProp?.(event);
    },
    [handleToggle, onKeyDownProp],
  );

  const isCheckbox = checkBehavior === 'checkbox';
  const ariaChecked = snapshot.allSelected
    ? true
    : snapshot.someSelected
      ? ('mixed' as const)
      : false;

  return (
    <div
      {...props}
      ref={ref}
      role="checkbox"
      aria-checked={ariaChecked}
      tabIndex={0}
      className={cn(styles.GroupSelectAll, className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span
        aria-hidden="true"
        className={cn(
          styles.IndicatorWrapper,
          isCheckbox ? styles.CheckboxIndicator : styles.RadioIndicator,
        )}
        data-checked={snapshot.allSelected ? '' : undefined}
        data-indeterminate={snapshot.someSelected ? '' : undefined}
      >
        <span className={styles.IndicatorControl}>
          {isCheckbox ? (
            snapshot.someSelected ? (
              <LuMinus className={styles.IndicatorIcon} />
            ) : (
              <LuCheck className={styles.IndicatorIcon} />
            )
          ) : (
            snapshot.allSelected && <span className={styles.RadioDot} />
          )}
        </span>
      </span>
      {children && <span className={styles.SelectAllLabel}>{children}</span>}
    </div>
  );
});

// ---------------------------------------------------------------------------
// Display names
// ---------------------------------------------------------------------------

SelectableListRoot.displayName = 'SelectableList';
SelectableListItem.displayName = 'SelectableList.Item';
SelectableListItemIndicator.displayName = 'SelectableList.ItemIndicator';
SelectableListSelectAll.displayName = 'SelectableList.SelectAll';
SelectableListSelectionSummary.displayName = 'SelectableList.SelectionSummary';
SelectableListGroupSelectAll.displayName = 'SelectableList.GroupSelectAll';

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

type SelectableListCompound = typeof SelectableListRoot & {
  Root: typeof SelectableListRoot;
  Viewport: typeof List.Viewport;
  Item: typeof SelectableListItem;
  ItemIndicator: typeof SelectableListItemIndicator;
  ItemIcon: typeof List.ItemIcon;
  ItemLabel: typeof List.ItemLabel;
  ItemDescription: typeof List.ItemDescription;
  ItemMeta: typeof List.ItemMeta;
  ItemActions: typeof List.ItemActions;
  SelectAll: typeof SelectableListSelectAll;
  SelectionSummary: typeof SelectableListSelectionSummary;
  Group: typeof List.Group;
  GroupHeader: typeof List.GroupHeader;
  GroupSelectAll: typeof SelectableListGroupSelectAll;
  Separator: typeof List.Separator;
  Empty: typeof List.Empty;
  Loading: typeof List.Loading;
};

export const SelectableList = Object.assign(SelectableListRoot, {
  Root: SelectableListRoot,
  Viewport: List.Viewport,
  Item: SelectableListItem,
  ItemIndicator: SelectableListItemIndicator,
  ItemIcon: List.ItemIcon,
  ItemLabel: List.ItemLabel,
  ItemDescription: List.ItemDescription,
  ItemMeta: List.ItemMeta,
  ItemActions: List.ItemActions,
  SelectAll: SelectableListSelectAll,
  SelectionSummary: SelectableListSelectionSummary,
  Group: List.Group,
  GroupHeader: List.GroupHeader,
  GroupSelectAll: SelectableListGroupSelectAll,
  Separator: List.Separator,
  Empty: List.Empty,
  Loading: List.Loading,
}) as SelectableListCompound;
