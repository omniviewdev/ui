import {
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../system/classnames';
import type { ComponentSize } from '../../system/types';
import { Avatar } from '../avatar';
import { Button } from '../button';
import { Image } from '../image';
import { Input } from '../input';
import { Popover } from '../popover';
import {
  ICON_PICKER_RASTER_TYPES,
  useSafeRasterSource,
  type IconPickerRasterMimeType,
} from './imageSources';
import styles from './IconPicker.module.css';

interface IconPickerItemBase {
  id: string;
  label: string;
  keywords?: readonly string[];
  disabled?: boolean;
}

export type IconPickerItem = IconPickerItemBase &
  (
    | { kind: 'preset'; icon: ReactNode }
    | { kind: 'emoji'; emoji: string }
    | {
        kind: 'image';
        /** PNG, JPEG, GIF or WebP base64 data URL, or a caller-owned same-origin raster blob URL. */
        src: string;
        removable?: boolean;
      }
  );

export interface IconPickerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'defaultValue'
> {
  items: readonly IconPickerItem[];
  value?: string;
  onValueChange: (id: string | undefined) => void;
  size?: ComponentSize;
  disabled?: boolean;
  label?: string;
  searchPlaceholder?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Caller validates, decodes and persists the file, updates items/value, and catches errors. */
  onUpload?: (file: File) => void;
  /** Allowed upload MIME hints; caller still validates content. Empty disables uploading. */
  accept?: readonly IconPickerRasterMimeType[];
  uploadPending?: boolean;
  uploadError?: string;
  /** Caller owns confirmation, in-use policy, persistence and the resulting items/value. */
  onRemove?: (id: string) => void;
  removePending?: boolean;
  removeError?: string;
}

const COLUMNS = 6;

function RasterPreview({ src }: { src: string }) {
  const safeSrc = useSafeRasterSource(src);
  return safeSrc ? (
    <Image
      key={safeSrc}
      className={styles.Image}
      src={safeSrc}
      alt=""
      objectFit="contain"
      referrerPolicy="no-referrer"
      fallback={<span aria-hidden>?</span>}
    />
  ) : (
    <span aria-hidden>?</span>
  );
}

function Preview({ item, size }: { item?: IconPickerItem; size: ComponentSize }) {
  return (
    <Avatar
      className={styles.Preview}
      size={size}
      shape="rounded"
      deterministic={false}
      aria-hidden="true"
      fallback={
        item?.kind === 'preset' ? (
          item.icon
        ) : item?.kind === 'emoji' ? (
          item.emoji
        ) : item?.kind === 'image' ? (
          <RasterPreview src={item.src} />
        ) : (
          <span>−</span>
        )
      }
    />
  );
}

/** A controlled, searchable icon library. File and asset lifecycles remain with the caller. */
export function IconPicker({
  items,
  value,
  onValueChange,
  size = 'md',
  disabled = false,
  label = 'Choose icon',
  searchPlaceholder = 'Search icons…',
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  onUpload,
  accept = ICON_PICKER_RASTER_TYPES,
  uploadPending = false,
  uploadError,
  onRemove,
  removePending = false,
  removeError,
  className,
  ...props
}: IconPickerProps) {
  const id = useId();
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const search = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const optionRefs = useRef(new Map<string, HTMLButtonElement>());
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [focusedId, setFocusedId] = useState<string>();
  const selected = items.find((item) => item.id === value);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filtered = items.filter((item) =>
    [item.label, ...(item.keywords ?? []), item.kind === 'emoji' ? item.emoji : ''].some((text) =>
      text.toLocaleLowerCase().includes(normalizedQuery),
    ),
  );
  const enabled = filtered.filter((item) => !item.disabled);
  const tabStop =
    enabled.find((item) => item.id === focusedId)?.id ??
    enabled.find((item) => item.id === value)?.id ??
    enabled[0]?.id;
  const busy = uploadPending || removePending;
  const open = !disabled && (controlledOpen ?? internalOpen);
  const acceptedTypes = accept.filter((type) =>
    ICON_PICKER_RASTER_TYPES.some((allowed) => allowed === type),
  );

  function changeOpen(next: boolean) {
    if (disabled && next) return;
    setInternalOpen(next);
    setQuery('');
    setFocusedId(undefined);
    onOpenChange?.(next);
  }

  function choose(item: IconPickerItem) {
    if (disabled || busy || item.disabled) return;
    onValueChange(item.id);
    changeOpen(false);
  }

  function focusOption(item: IconPickerItem | undefined) {
    if (!item) return;
    setFocusedId(item.id);
    optionRefs.current.get(item.id)?.focus();
  }

  function navigate(event: KeyboardEvent<HTMLButtonElement>, item: IconPickerItem) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const index = filtered.findIndex((entry) => entry.id === item.id);
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    let delta: number;
    if (event.key === 'ArrowRight') delta = rtl ? -1 : 1;
    else if (event.key === 'ArrowLeft') delta = rtl ? 1 : -1;
    else if (event.key === 'ArrowDown') delta = COLUMNS;
    else if (event.key === 'ArrowUp') delta = -COLUMNS;
    else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      focusOption(event.key === 'Home' ? enabled[0] : enabled.at(-1));
      return;
    } else return;
    event.preventDefault();
    let next = (index + delta + filtered.length) % filtered.length;
    const step = delta > 0 ? 1 : -1;
    for (let count = 0; count < filtered.length; count++) {
      const candidate = filtered[next];
      if (candidate && !candidate.disabled) {
        focusOption(candidate);
        return;
      }
      next = (next + step + filtered.length) % filtered.length;
    }
  }

  return (
    <div ref={setRoot} className={cn(styles.Root, className)} data-ov-size={size} {...props}>
      <Popover.Root open={open} onOpenChange={changeOpen} size={size}>
        <Popover.Trigger
          disabled={disabled}
          render={<Button size={size} variant="outline" className={styles.Trigger} />}
          aria-label={`${label}: ${selected?.label ?? 'None'}`}
        >
          <Preview item={selected} size={size} />
          <span className={styles.TriggerLabel}>{selected?.label ?? label}</span>
          <span aria-hidden>⌄</span>
        </Popover.Trigger>
        {/* Local portal retains nested native themes and caller-defined token overrides. */}
        {root ? (
          <Popover.Portal container={root}>
            <Popover.Positioner side="bottom" align="start" sideOffset={4} positionMethod="fixed">
              <Popover.Popup
                className={styles.Popup}
                initialFocus={search}
                aria-busy={busy || undefined}
              >
                <Popover.Title>{label}</Popover.Title>
                <Input.Root size={size}>
                  <Input.Control
                    ref={search}
                    size={size}
                    type="search"
                    aria-label="Search icons"
                    aria-controls={`${id}-choices`}
                    value={query}
                    placeholder={searchPlaceholder}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setFocusedId(undefined);
                    }}
                    onKeyDown={(event) => {
                      if (event.nativeEvent.isComposing) return;
                      if (event.key === 'Enter') event.preventDefault();
                      if (busy) return;
                      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                        event.preventDefault();
                        focusOption(event.key === 'ArrowDown' ? enabled[0] : enabled.at(-1));
                      } else if (event.key === 'Enter') {
                        event.preventDefault();
                        if (enabled[0]) choose(enabled[0]);
                      }
                    }}
                  />
                </Input.Root>
                <div
                  id={`${id}-choices`}
                  className={styles.Grid}
                  role="group"
                  aria-label="Icons"
                  aria-describedby={`${id}-help`}
                >
                  {filtered.map((item) => (
                    <button
                      key={item.id}
                      ref={(node) => {
                        if (node) optionRefs.current.set(item.id, node);
                        else optionRefs.current.delete(item.id);
                      }}
                      type="button"
                      className={styles.Option}
                      aria-label={item.label}
                      aria-pressed={item.id === value}
                      title={item.label}
                      disabled={disabled || busy || item.disabled}
                      tabIndex={item.id === tabStop ? 0 : -1}
                      onFocus={() => setFocusedId(item.id)}
                      onKeyDown={(event) => navigate(event, item)}
                      onClick={() => choose(item)}
                    >
                      <Preview item={item} size={size} />
                      {item.id === value ? (
                        <span className={styles.Check} aria-hidden>
                          ✓
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
                <span className={styles.SrOnly} role="status" aria-live="polite" aria-atomic="true">
                  {filtered.length} {filtered.length === 1 ? 'icon' : 'icons'} found.
                </span>
                {filtered.length === 0 ? <p className={styles.Hint}>No icons found.</p> : null}
                <p id={`${id}-help`} className={styles.Hint}>
                  Arrow keys browse · Enter or Space selects · Escape closes
                </p>
                <div className={styles.Actions}>
                  <Button
                    size={size}
                    variant="ghost"
                    disabled={disabled || busy || value === undefined}
                    onClick={() => {
                      onValueChange(undefined);
                      changeOpen(false);
                    }}
                  >
                    Clear icon
                  </Button>
                  {onUpload ? (
                    <>
                      <input
                        ref={fileInput}
                        className={styles.SrOnly}
                        type="file"
                        accept={acceptedTypes.join(',')}
                        aria-label="Upload icon file"
                        tabIndex={-1}
                        disabled={disabled || busy || acceptedTypes.length === 0}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = '';
                          if (file && !disabled && !busy && acceptedTypes.length > 0)
                            onUpload(file);
                        }}
                      />
                      <Button
                        size={size}
                        variant="outline"
                        disabled={disabled || busy || acceptedTypes.length === 0}
                        onClick={() => fileInput.current?.click()}
                      >
                        {uploadPending ? 'Uploading…' : 'Upload image'}
                      </Button>
                    </>
                  ) : null}
                  {onRemove && selected?.kind === 'image' && selected.removable ? (
                    <Button
                      size={size}
                      variant="ghost"
                      color="danger"
                      disabled={disabled || busy}
                      onClick={() => {
                        onRemove(selected.id);
                        search.current?.focus();
                      }}
                    >
                      {removePending ? 'Removing…' : 'Remove selected image'}
                    </Button>
                  ) : null}
                </div>
                {uploadPending ? (
                  <p className={styles.Hint} role="status">
                    Uploading image…
                  </p>
                ) : null}
                {uploadError ? (
                  <p className={styles.Error} role="alert">
                    {uploadError}
                  </p>
                ) : null}
                {removePending ? (
                  <p className={styles.Hint} role="status">
                    Removing image…
                  </p>
                ) : null}
                {removeError ? (
                  <p className={styles.Error} role="alert">
                    {removeError}
                  </p>
                ) : null}
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        ) : null}
      </Popover.Root>
    </div>
  );
}
