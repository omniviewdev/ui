import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { LuCheck, LuChevronDown, LuSearch, LuX } from 'react-icons/lu';
import { useCallback, useMemo, useRef, type PointerEvent, type ReactNode } from 'react';
import { Chip } from '../chip';
import { IconButton } from '../icon-button';
import { cn, withBaseClassName } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import {
  DEFAULT_COLOR,
  DEFAULT_SIZE,
  DEFAULT_VARIANT,
  type StyledComponentProps,
} from '../../system/types';
import styles from './MultiSelect.module.css';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toPrimitiveString(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  return '';
}

function defaultItemLabel<Item>(item: Item): string {
  if (typeof item === 'string' || typeof item === 'number') {
    return String(item);
  }

  if (isRecord(item)) {
    const label = toPrimitiveString(item.label);
    if (label) {
      return label;
    }

    const value = toPrimitiveString(item.value);
    if (value) {
      return value;
    }

    const id = toPrimitiveString(item.id);
    if (id) {
      return id;
    }
  }

  return '';
}

function defaultItemValue<Item>(item: Item): string {
  if (typeof item === 'string' || typeof item === 'number') {
    return String(item);
  }

  if (isRecord(item)) {
    const value = toPrimitiveString(item.value);
    if (value) {
      return value;
    }

    const id = toPrimitiveString(item.id);
    if (id) {
      return id;
    }

    const label = toPrimitiveString(item.label);
    if (label) {
      return label;
    }
  }

  return '';
}

export interface MultiSelectProps<Item = string>
  extends
    Omit<
      BaseCombobox.Root.Props<Item, true>,
      'multiple' | 'children' | 'color' | 'itemToStringLabel' | 'itemToStringValue'
    >,
    StyledComponentProps {
  label?: ReactNode;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: ReactNode;
  className?: string;
  controlClassName?: string;
  popupClassName?: string;
  listClassName?: string;
  maxVisibleChips?: number;
  showItemIndicator?: boolean;
  getItemLabel?: (item: Item) => string;
  getItemValue?: (item: Item) => string;
  getItemKey?: (item: Item, index: number) => string;
  getItemDisabled?: (item: Item) => boolean;
  renderChipLabel?: (item: Item) => ReactNode;
  renderItemLabel?: (item: Item) => ReactNode;
  renderItemEndDecorator?: (item: Item) => ReactNode;
  removeButtonLabel?: (item: Item) => string;
  triggerLabel?: string;
  clearable?: boolean;
  clearButtonLabel?: string;
  clearDecorator?: ReactNode;
}

export function MultiSelect<Item = string>({
  items,
  value,
  defaultValue,
  onValueChange,
  variant = DEFAULT_VARIANT,
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  label,
  placeholder = 'Select options',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  className,
  controlClassName,
  popupClassName,
  listClassName,
  maxVisibleChips = 3,
  showItemIndicator = true,
  getItemLabel,
  getItemValue,
  getItemKey,
  getItemDisabled,
  renderChipLabel,
  renderItemLabel,
  renderItemEndDecorator,
  removeButtonLabel,
  triggerLabel = 'Toggle options',
  clearable = true,
  clearButtonLabel = 'Clear selected options',
  clearDecorator,
  ...props
}: MultiSelectProps<Item>) {
  const controlRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const resolved = useMemo(
    () => ({
      variant,
      color,
      size,
    }),
    [variant, color, size],
  );

  const resolvedItemLabel = useMemo(
    () => getItemLabel ?? ((item: Item) => defaultItemLabel(item)),
    [getItemLabel],
  );

  const resolvedItemValue = useMemo(
    () => getItemValue ?? ((item: Item) => defaultItemValue(item)),
    [getItemValue],
  );

  const safeMaxVisibleChips = Number.isFinite(maxVisibleChips)
    ? Math.max(0, Math.floor(maxVisibleChips))
    : Number.MAX_SAFE_INTEGER;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderClearButton = useCallback(
    (clearProps: any) => (
      <IconButton
        {...clearProps}
        variant="ghost"
        color={color}
        size={size}
        className={cn(
          styles.Clear,
          typeof clearProps.className === 'string' ? clearProps.className : undefined,
        )}
      >
        {clearDecorator ?? <LuX aria-hidden />}
      </IconButton>
    ),
    [color, size, clearDecorator],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTriggerButton = useCallback(
    (triggerProps: any) => (
      <IconButton
        {...triggerProps}
        variant="ghost"
        color={color}
        size={size}
        className={cn(
          styles.Trigger,
          typeof triggerProps.className === 'string' ? triggerProps.className : undefined,
        )}
      >
        <LuChevronDown aria-hidden />
      </IconButton>
    ),
    [color, size],
  );

  const handleControlPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (target?.closest('button, input, textarea, [role="button"], [role="combobox"]')) {
      return;
    }

    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const isOpen = trigger.getAttribute('aria-expanded') === 'true';
    if (!isOpen) {
      event.preventDefault();
      trigger.click();
    }
  };

  return (
    <BaseCombobox.Root<Item, true>
      {...props}
      items={items}
      multiple
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      itemToStringLabel={resolvedItemLabel}
      itemToStringValue={resolvedItemValue}
    >
      <div className={cn(styles.Root, className)} {...styleDataAttributes(resolved)}>
        {label ? <div className={styles.Label}>{label}</div> : null}

        <div
          ref={controlRef}
          className={cn(styles.Control, controlClassName)}
          onPointerDown={handleControlPointerDown}
          {...styleDataAttributes(resolved)}
          data-ov-slot="control"
        >
          <BaseCombobox.Chips className={styles.Chips}>
            <BaseCombobox.Value>
              {(selectedValue: Item[]) => {
                const values = Array.isArray(selectedValue) ? selectedValue : [];

                if (values.length === 0) {
                  return <span className={styles.Placeholder}>{placeholder}</span>;
                }

                const visibleValues = values.slice(0, safeMaxVisibleChips);
                const hiddenCount = values.length - visibleValues.length;

                return (
                  <>
                    {visibleValues.map((item, index) => {
                      const key =
                        getItemKey?.(item, index) ?? `${resolvedItemValue(item)}-${index}`;
                      const chipLabel = renderChipLabel
                        ? renderChipLabel(item)
                        : resolvedItemLabel(item);

                      return (
                        <BaseCombobox.Chip key={key} className={styles.ChipWrapper}>
                          <Chip
                            as="span"
                            mono
                            variant="soft"
                            color={color}
                            size={size}
                            className={styles.Chip}
                            endDecorator={
                              <BaseCombobox.ChipRemove
                                aria-label={
                                  removeButtonLabel?.(item) ?? `Remove ${resolvedItemLabel(item)}`
                                }
                                render={(removeProps) => (
                                  <IconButton
                                    {...removeProps}
                                    variant="ghost"
                                    color={color}
                                    size={size}
                                    className={cn(
                                      styles.ChipRemove,
                                      typeof removeProps.className === 'string'
                                        ? removeProps.className
                                        : undefined,
                                    )}
                                  >
                                    <LuX aria-hidden />
                                  </IconButton>
                                )}
                              />
                            }
                          >
                            {chipLabel}
                          </Chip>
                        </BaseCombobox.Chip>
                      );
                    })}
                    {hiddenCount > 0 ? (
                      <Chip
                        as="span"
                        mono
                        variant="ghost"
                        color="neutral"
                        size={size}
                        className={styles.MoreChip}
                      >
                        +{hiddenCount}
                      </Chip>
                    ) : null}
                  </>
                );
              }}
            </BaseCombobox.Value>
          </BaseCombobox.Chips>

          {clearable ? (
            <BaseCombobox.Clear
              aria-label={clearButtonLabel}
              render={renderClearButton}
            />
          ) : null}

          <BaseCombobox.Trigger
            ref={triggerRef}
            aria-label={triggerLabel}
            render={renderTriggerButton}
          />
        </div>
      </div>

      <BaseCombobox.Portal>
        <BaseCombobox.Positioner
          className={styles.Positioner}
          anchor={controlRef}
          align="start"
          side="bottom"
          sideOffset={6}
        >
          <BaseCombobox.Popup
            className={withBaseClassName<BaseCombobox.Popup.State>(styles.Popup, popupClassName)}
            {...styleDataAttributes(resolved)}
          >
            <div className={styles.SearchShell} {...styleDataAttributes(resolved)}>
              <span className={styles.SearchIcon} aria-hidden>
                <LuSearch />
              </span>
              <BaseCombobox.Input
                className={styles.SearchInput}
                placeholder={searchPlaceholder}
                {...styleDataAttributes(resolved)}
              />
            </div>

            <BaseCombobox.Empty className={styles.Empty} {...styleDataAttributes(resolved)}>
              {emptyMessage}
            </BaseCombobox.Empty>

            <BaseCombobox.List
              className={withBaseClassName<BaseCombobox.List.State>(styles.List, listClassName)}
              {...styleDataAttributes(resolved)}
            >
              {(item: Item, index: number) => {
                const key = getItemKey?.(item, index) ?? `${resolvedItemValue(item)}-${index}`;
                const itemLabel = renderItemLabel ? renderItemLabel(item) : resolvedItemLabel(item);
                const endDecorator = renderItemEndDecorator?.(item);

                return (
                  <BaseCombobox.Item
                    key={key}
                    value={item}
                    disabled={getItemDisabled?.(item)}
                    className={styles.Item}
                    {...styleDataAttributes(resolved)}
                  >
                    {showItemIndicator ? (
                      <BaseCombobox.ItemIndicator className={styles.ItemIndicator}>
                        <LuCheck aria-hidden />
                      </BaseCombobox.ItemIndicator>
                    ) : null}

                    <span className={styles.ItemLabel}>{itemLabel}</span>

                    {endDecorator ? <span className={styles.ItemEnd}>{endDecorator}</span> : null}
                  </BaseCombobox.Item>
                );
              }}
            </BaseCombobox.List>
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    </BaseCombobox.Root>
  );
}

MultiSelect.displayName = 'MultiSelect';
