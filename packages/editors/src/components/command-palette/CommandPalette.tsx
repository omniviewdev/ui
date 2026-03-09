import { forwardRef, useMemo, type ReactNode } from 'react';
import { CommandList } from '@omniview/base-ui';
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
    const enabledCommands = useMemo(
      () => commands.filter((c) => !c.disabled),
      [commands],
    );

    if (!open) return null;

    return (
      <div
        className={styles.Overlay}
        onClick={onClose}
        data-testid="command-palette-overlay"
      >
        <div
          ref={ref}
          className={styles.Root}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          data-testid="command-palette"
        >
          <CommandList.Root
            className={styles.CommandList}
            items={enabledCommands}
            itemKey={(cmd) => cmd.id}
            renderItem={(cmd, meta) => (
              <CommandList.Item
                itemKey={meta.key}
                data-testid={`command-item-${cmd.id}`}
              >
                {cmd.icon && (
                  <CommandList.ItemIcon>{cmd.icon}</CommandList.ItemIcon>
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
            filterFn={(cmd, query) =>
              fuzzyMatch(cmd.label, query) ||
              (cmd.description ? fuzzyMatch(cmd.description, query) : false) ||
              (cmd.group ? fuzzyMatch(cmd.group, query) : false)
            }
            groupBy={(cmd) => cmd.group || ''}
            onAction={(_key, cmd) => {
              onSelect(cmd);
              onClose();
            }}
            onDismiss={onClose}
            placeholder={placeholder}
            density="compact"
          >
            <CommandList.Input data-testid="command-palette-input" />
            <CommandList.Results className={styles.Results} data-testid="command-palette-list" />
            <CommandList.Empty data-testid="command-palette-empty">
              No matching commands
            </CommandList.Empty>
          </CommandList.Root>
        </div>
      </div>
    );
  },
);

CommandPalette.displayName = 'CommandPalette';
