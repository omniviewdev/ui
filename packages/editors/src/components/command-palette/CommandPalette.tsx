import {
  forwardRef, useCallback, useLayoutEffect, useMemo, useRef, useSyncExternalStore,
  type ReactNode, type RefObject,
} from 'react';
import {
  CommandList, useCommandListConfig, useCommandListStoreContext,
} from '@omniviewdev/base-ui';
import styles from './CommandPalette.module.css';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string;
  group?: string;
  disabled?: boolean;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: CommandItem[];
  onSelect: (command: CommandItem) => void;
  placeholder?: string;
  /** Caller-owned pending state; previous commands cannot execute while loading. */
  loading?: boolean;
  /** Caller-owned failure message. Takes precedence over loading and empty states. */
  error?: string;
}

function getCommandKey(cmd: CommandItem): string {
  return cmd.id;
}

function fuzzyMatch(text: string, query: string): boolean {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  let qi = 0;
  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

function matchesCommand(cmd: CommandItem, query: string): boolean {
  return fuzzyMatch(cmd.label, query) ||
    (cmd.description ? fuzzyMatch(cmd.description, query) : false) ||
    (cmd.group ? fuzzyMatch(cmd.group, query) : false);
}

const NO_COMMANDS: CommandItem[] = [];

/** CommandList puts combobox state on its root; the palette keeps it on the focused input. */
function PaletteInput({ inputRef }: { inputRef: RefObject<HTMLInputElement | null> }) {
  const { listId } = useCommandListConfig();
  const store = useCommandListStoreContext();
  const { activeKey } = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const activeId = activeKey != null ? `${listId}-item-${activeKey}` : undefined;

  useLayoutEffect(() => {
    if (activeId) {
      inputRef.current?.ownerDocument.getElementById(activeId)?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [activeId, inputRef]);

  return (
    <CommandList.Input
      ref={inputRef}
      autoFocus={false}
      role="combobox"
      aria-label="Search commands"
      aria-expanded="true"
      aria-haspopup="listbox"
      aria-activedescendant={activeId}
      autoComplete="off"
      spellCheck={false}
      data-testid="command-palette-input"
    />
  );
}

export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(
  function CommandPalette(
    { open, onClose, commands, onSelect, placeholder = 'Type a command…', loading = false, error },
    ref,
  ) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const composingRef = useRef(false);
    const failed = error !== undefined;
    const enabledCommands = useMemo(
      () => commands.filter((c) => !c.disabled),
      [commands],
    );
    const visibleCommands = failed || loading ? NO_COMMANDS : enabledCommands;

    // Group only contiguous runs. Merging equal group labels would reorder caller results.
    const groups = useMemo(() => {
      const keys = new Map<string, string>();
      const labels = new Map<string, string>();
      let previous: string | undefined;
      let run = -1;
      for (const command of visibleCommands) {
        const label = command.group || 'Other commands';
        if (label !== previous) run++;
        previous = label;
        const key = String(run);
        keys.set(command.id, key);
        labels.set(key, label);
      }
      return { keys, labels, grouped: visibleCommands.some((command) => command.group) };
    }, [visibleCommands]);
    const groupBy = useCallback((cmd: CommandItem) => groups.keys.get(cmd.id)!, [groups]);
    const groupLabel = useCallback((key: string) => groups.labels.get(key)!, [groups]);

    useLayoutEffect(() => {
      if (!open) return;
      const dialog = dialogRef.current;
      const doc = dialog?.ownerDocument;
      const opener = doc?.activeElement;
      composingRef.current = false;
      inputRef.current?.focus({ preventScroll: true });
      return () => {
        // Respect commands that intentionally focus a navigation destination.
        if (opener instanceof HTMLElement && opener.isConnected &&
            (doc?.activeElement === doc?.body || dialog?.contains(doc?.activeElement ?? null))) {
          opener.focus({ preventScroll: true });
        }
      };
    }, [open]);

    if (!open) return null;

    return (
      <div
        role="presentation"
        className={styles.Overlay}
        onClick={onClose}
        data-testid="command-palette-overlay"
      >
        <div
          ref={(node) => {
            dialogRef.current = node;
            if (typeof ref === 'function') return ref(node);
            if (ref) ref.current = node;
          }}
          className={styles.Root}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(event) => {
            // Nonfocusable headings/results must not strand keyboard focus on the page body.
            if (event.button === 0 && event.target instanceof Element &&
                !event.target.closest('input, button')) {
              event.preventDefault();
              inputRef.current?.focus({ preventScroll: true });
            }
          }}
          onKeyDown={(e) => e.stopPropagation()}
          onCompositionStartCapture={() => { composingRef.current = true; }}
          onCompositionEndCapture={() => { composingRef.current = false; }}
          onKeyDownCapture={(event) => {
            // Stop command handlers without preventing the IME's native default action.
            if (composingRef.current || event.nativeEvent.isComposing || event.keyCode === 229) {
              event.stopPropagation();
              return;
            }
            // A focused Clear search button owns Enter/Space, not the command list.
            if (event.target instanceof HTMLButtonElement &&
                event.key !== 'Escape' && event.key !== 'Tab') {
              event.stopPropagation();
              return;
            }
            if (event.key === 'Escape') {
              event.preventDefault();
              event.stopPropagation();
              onClose();
            } else if (event.key === 'Tab') {
              const controls = dialogRef.current?.querySelectorAll<HTMLElement>(
                'input:not(:disabled), button:not(:disabled)',
              );
              if (!controls?.length) return;
              const first = controls[0]!;
              const last = controls[controls.length - 1]!;
              const active = first.ownerDocument.activeElement;
              if ((event.shiftKey && active === first) || (!event.shiftKey && active === last)) {
                event.preventDefault();
                (event.shiftKey ? last : first).focus();
              }
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          data-testid="command-palette"
        >
          <CommandList.Root
            className={styles.CommandList}
            role="presentation"
            aria-expanded={undefined}
            aria-haspopup={undefined}
            aria-owns={undefined}
            aria-activedescendant={undefined}
            items={visibleCommands}
            itemKey={getCommandKey}
            renderItem={(cmd, meta) => (
              <CommandList.Item
                itemKey={meta.key}
                data-testid={`command-item-${cmd.id}`}
              >
                {cmd.icon && (
                  <CommandList.ItemIcon aria-hidden="true">{cmd.icon}</CommandList.ItemIcon>
                )}
                <CommandList.ItemLabel>{cmd.label}</CommandList.ItemLabel>
                {cmd.description && (
                  <CommandList.ItemDescription>
                    {cmd.description}
                  </CommandList.ItemDescription>
                )}
                {cmd.shortcut && (
                  <CommandList.ItemShortcut>
                    {cmd.shortcut}
                  </CommandList.ItemShortcut>
                )}
              </CommandList.Item>
            )}
            filterFn={matchesCommand}
            sortByScore={false}
            groupBy={groups.grouped ? groupBy : undefined}
            groupLabel={groupLabel}
            loading={loading && !failed}
            onAction={(key) => {
              const current = visibleCommands.find((command) => command.id === key && !command.disabled);
              if (!current) return;
              onSelect(current);
              onClose();
            }}
            onDismiss={onClose}
            placeholder={placeholder}
            density="compact"
          >
            <PaletteInput inputRef={inputRef} />
            <CommandList.Results
              className={styles.Results}
              aria-label="Commands"
              aria-busy={loading && !failed}
              data-testid="command-palette-list"
            />
            {failed ? (
              <div role="alert" className={styles.Message} data-testid="command-palette-error">
                {error || 'Unable to load commands.'}
              </div>
            ) : (
              <>
                <CommandList.Loading role="status" data-testid="command-palette-loading">
                  Loading commands…
                </CommandList.Loading>
                <CommandList.Empty role="status" data-testid="command-palette-empty">
                  No matching commands
                </CommandList.Empty>
              </>
            )}
          </CommandList.Root>
        </div>
      </div>
    );
  },
);

CommandPalette.displayName = 'CommandPalette';
