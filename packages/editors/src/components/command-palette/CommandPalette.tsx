import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
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
}

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
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

export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(
  function CommandPalette(
    { open, onClose, commands, onSelect, placeholder = 'Type a command…' },
    ref,
  ) {
    const [search, setSearch] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const filtered = useMemo(() => {
      if (!search) return commands.filter((c) => !c.disabled);
      return commands.filter(
        (c) =>
          !c.disabled &&
          (fuzzyMatch(c.label, search) ||
            (c.description && fuzzyMatch(c.description, search)) ||
            (c.group && fuzzyMatch(c.group, search))),
      );
    }, [commands, search]);

    // Group commands
    const groups = useMemo(() => {
      const map = new Map<string, CommandItem[]>();
      for (const cmd of filtered) {
        const group = cmd.group || '';
        const list = map.get(group);
        if (list) {
          list.push(cmd);
        } else {
          map.set(group, [cmd]);
        }
      }
      return map;
    }, [filtered]);

    // Reset state when opened/closed
    useEffect(() => {
      if (open) {
        setSearch('');
        setActiveIndex(0);
        // Focus input after render
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    }, [open]);

    // Scroll active item into view
    useEffect(() => {
      if (!listRef.current) return;
      const active = listRef.current.querySelector('[data-active="true"]');
      if (active && typeof active.scrollIntoView === 'function') {
        active.scrollIntoView({ block: 'nearest' });
      }
    }, [activeIndex]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % Math.max(filtered.length, 1));
            break;
          case 'ArrowUp':
            e.preventDefault();
            setActiveIndex((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
            break;
          case 'Enter': {
            e.preventDefault();
            const selected = filtered[activeIndex];
            if (selected) {
              onSelect(selected);
              onClose();
            }
            break;
          }
          case 'Escape':
            e.preventDefault();
            onClose();
            break;
        }
      },
      [filtered, activeIndex, onSelect, onClose],
    );

    if (!open) return null;

    let flatIndex = 0;

    return (
      <div className={styles.Overlay} onClick={onClose} data-testid="command-palette-overlay">
        <div
          ref={ref}
          className={styles.Root}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          data-testid="command-palette"
        >
          <div className={styles.InputWrapper}>
            <input
              ref={inputRef}
              className={styles.Input}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActiveIndex(0);
              }}
              placeholder={placeholder}
              aria-label="Search commands"
              data-testid="command-palette-input"
            />
          </div>
          <div
            ref={listRef}
            className={styles.List}
            role="listbox"
            data-testid="command-palette-list"
          >
            {filtered.length === 0 ? (
              <div className={styles.Empty} data-testid="command-palette-empty">
                No matching commands
              </div>
            ) : (
              Array.from(groups.entries()).map(([group, items]) => (
                <div key={group} className={styles.Group}>
                  {group && <div className={styles.GroupLabel}>{group}</div>}
                  {items.map((cmd) => {
                    const index = flatIndex++;
                    const isActive = index === activeIndex;
                    return (
                      <div
                        key={cmd.id}
                        className={cn(styles.Item, isActive && styles.ItemActive)}
                        role="option"
                        aria-selected={isActive}
                        data-active={isActive}
                        data-testid={`command-item-${cmd.id}`}
                        onClick={() => {
                          onSelect(cmd);
                          onClose();
                        }}
                        onMouseEnter={() => setActiveIndex(index)}
                      >
                        {cmd.icon && <span className={styles.Icon}>{cmd.icon}</span>}
                        <div className={styles.Content}>
                          <span className={styles.Label}>{cmd.label}</span>
                          {cmd.description && (
                            <span className={styles.Description}>{cmd.description}</span>
                          )}
                        </div>
                        {cmd.shortcut && <kbd className={styles.Shortcut}>{cmd.shortcut}</kbd>}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  },
);

CommandPalette.displayName = 'CommandPalette';
