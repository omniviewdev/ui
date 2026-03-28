import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CommandPalette, type CommandItem } from './CommandPalette';

// ---------------------------------------------------------------------------
// Mock @omniviewdev/base-ui — CommandList compound component
// ---------------------------------------------------------------------------

vi.mock('@omniviewdev/base-ui', async () => {
  const React = await vi.importActual<typeof import('react')>('react');

  // Simple CommandList mock that renders items directly and supports filtering
  function MockRoot({
    items,
    itemKey,
    renderItem,
    filterFn,
    groupBy,
    onAction,
    onDismiss,
    placeholder,
    children,
  }: {
    items: CommandItem[];
    itemKey: (item: CommandItem) => string;
    renderItem: (item: CommandItem, meta: { key: string; isActive: boolean; isDisabled: boolean }) => React.ReactNode;
    filterFn?: (item: CommandItem, query: string) => boolean;
    groupBy?: (item: CommandItem) => string;
    onAction?: (key: string, item: CommandItem) => void;
    onDismiss?: () => void;
    placeholder?: string;
    children?: React.ReactNode;
  }) {
    const [query, setQuery] = React.useState('');
    const [activeIndex, setActiveIndex] = React.useState(0);

    const filtered = React.useMemo(() => {
      if (!query || !filterFn) return items;
      return items.filter((item) => filterFn(item, query));
    }, [items, query, filterFn]);

    // Group items
    const groups = React.useMemo(() => {
      if (!groupBy) return new Map([['', filtered]]);
      const map = new Map<string, CommandItem[]>();
      for (const item of filtered) {
        const group = groupBy(item);
        const list = map.get(group);
        if (list) list.push(item);
        else map.set(group, [item]);
      }
      return map;
    }, [filtered, groupBy]);

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setActiveIndex((i: number) => (i + 1) % Math.max(filtered.length, 1));
            break;
          case 'ArrowUp':
            e.preventDefault();
            setActiveIndex((i: number) => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
            break;
          case 'Enter': {
            e.preventDefault();
            const selected = filtered[activeIndex];
            if (selected && onAction) onAction(itemKey(selected), selected);
            break;
          }
          case 'Escape':
            e.preventDefault();
            onDismiss?.();
            break;
        }
      },
      [filtered, activeIndex, onAction, onDismiss, itemKey],
    );

    // Provide context to children via data attributes on root
    const contextValue = React.useMemo(
      () => ({ query, setQuery, setActiveIndex, handleKeyDown, placeholder }),
      [query, handleKeyDown, placeholder],
    );

    let flatIndex = 0;

    // Build results content
    const resultsContent = filtered.length > 0 ? (
      Array.from(groups.entries()).map(([group, groupItems]: [string, CommandItem[]]) => (
        <div key={group}>
          {group && <div>{group}</div>}
          {groupItems.map((item: CommandItem) => {
            const idx = flatIndex++;
            return renderItem(item, {
              key: itemKey(item),
              isActive: idx === activeIndex,
              isDisabled: false,
            });
          })}
        </div>
      ))
    ) : null;

    return (
      <MockRootContext.Provider value={contextValue}>
        <div>
          {React.Children.map(children, (child: React.ReactNode) => {
            if (!React.isValidElement(child)) return child;
            const displayName = (child.type as { displayName?: string })?.displayName;
            if (displayName === 'CommandList.Input') return child;
            if (displayName === 'CommandList.Results') {
              const childProps = child.props as Record<string, unknown>;
              return resultsContent ? (
                <div {...childProps}>{resultsContent}</div>
              ) : null;
            }
            if (displayName === 'CommandList.Empty') {
              return filtered.length === 0 ? child : null;
            }
            return child;
          })}
        </div>
      </MockRootContext.Provider>
    );
  }
  MockRoot.displayName = 'CommandList.Root';

  const MockRootContext = React.createContext<{
    query: string;
    setQuery: (q: string) => void;
    setActiveIndex: (i: number) => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    placeholder?: string;
  } | null>(null);

  function MockInput(props: Record<string, unknown>) {
    const ctx = React.useContext(MockRootContext);
    return (
      <input
        type="text"
        value={ctx?.query ?? ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          ctx?.setQuery(e.target.value);
          ctx?.setActiveIndex(0);
        }}
        onKeyDown={ctx?.handleKeyDown}
        placeholder={ctx?.placeholder}
        {...props}
      />
    );
  }
  MockInput.displayName = 'CommandList.Input';

  function MockResults(props: Record<string, unknown>) {
    return <div role="listbox" {...props} />;
  }
  MockResults.displayName = 'CommandList.Results';

  function MockItem({ children, itemKey: _itemKey, ...props }: Record<string, unknown>) {
    return (
      <div role="option" tabIndex={0} aria-selected={props['data-active'] === true} {...props}>
        {children as React.ReactNode}
      </div>
    );
  }
  MockItem.displayName = 'CommandList.Item';

  function MockItemIcon({ children, ...props }: Record<string, unknown>) {
    return <span {...props}>{children as React.ReactNode}</span>;
  }
  MockItemIcon.displayName = 'CommandList.ItemIcon';

  function MockItemLabel({ children, ...props }: Record<string, unknown>) {
    return <span {...props}>{children as React.ReactNode}</span>;
  }
  MockItemLabel.displayName = 'CommandList.ItemLabel';

  function MockItemDescription({ children, ...props }: Record<string, unknown>) {
    return <span {...props}>{children as React.ReactNode}</span>;
  }
  MockItemDescription.displayName = 'CommandList.ItemDescription';

  function MockItemShortcut({ children, ...props }: Record<string, unknown>) {
    return <kbd {...props}>{children as React.ReactNode}</kbd>;
  }
  MockItemShortcut.displayName = 'CommandList.ItemShortcut';

  function MockEmpty({ children, ...props }: Record<string, unknown>) {
    return <div {...props}>{children as React.ReactNode}</div>;
  }
  MockEmpty.displayName = 'CommandList.Empty';

  function MockLoading({ children, ...props }: Record<string, unknown>) {
    return <div {...props}>{children as React.ReactNode}</div>;
  }
  MockLoading.displayName = 'CommandList.Loading';

  const CommandList = Object.assign(MockRoot, {
    Root: MockRoot,
    Input: MockInput,
    Results: MockResults,
    Item: MockItem,
    ItemIcon: MockItemIcon,
    ItemLabel: MockItemLabel,
    ItemDescription: MockItemDescription,
    ItemShortcut: MockItemShortcut,
    Empty: MockEmpty,
    Loading: MockLoading,
  });

  return { CommandList };
});

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const commands: CommandItem[] = [
  { id: 'open', label: 'Open File', shortcut: 'Ctrl+O', group: 'File' },
  { id: 'save', label: 'Save File', shortcut: 'Ctrl+S', group: 'File' },
  { id: 'find', label: 'Find in Files', shortcut: 'Ctrl+Shift+F', group: 'Search' },
  {
    id: 'terminal',
    label: 'Toggle Terminal',
    shortcut: 'Ctrl+`',
    group: 'View',
    description: 'Show or hide the integrated terminal',
  },
  { id: 'disabled', label: 'Disabled Command', disabled: true },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CommandPalette', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    commands,
    onSelect: vi.fn(),
  };

  it('renders when open', () => {
    render(<CommandPalette {...defaultProps} />);
    expect(screen.getByTestId('command-palette')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<CommandPalette {...defaultProps} open={false} />);
    expect(screen.queryByTestId('command-palette')).not.toBeInTheDocument();
  });

  it('shows command items', () => {
    render(<CommandPalette {...defaultProps} />);
    expect(screen.getByTestId('command-item-open')).toBeInTheDocument();
    expect(screen.getByTestId('command-item-save')).toBeInTheDocument();
    expect(screen.getByTestId('command-item-find')).toBeInTheDocument();
  });

  it('filters out disabled commands', () => {
    render(<CommandPalette {...defaultProps} />);
    expect(screen.queryByTestId('command-item-disabled')).not.toBeInTheDocument();
  });

  it('filters commands by search text', async () => {
    const user = userEvent.setup();
    render(<CommandPalette {...defaultProps} />);
    const input = screen.getByTestId('command-palette-input');
    await user.type(input, 'terminal');
    expect(screen.getByTestId('command-item-terminal')).toBeInTheDocument();
    expect(screen.queryByTestId('command-item-open')).not.toBeInTheDocument();
  });

  it('filters by description', async () => {
    const user = userEvent.setup();
    render(<CommandPalette {...defaultProps} />);
    await user.type(screen.getByTestId('command-palette-input'), 'integrated');
    expect(screen.getByTestId('command-item-terminal')).toBeInTheDocument();
  });

  it('filters by group name', async () => {
    const user = userEvent.setup();
    render(<CommandPalette {...defaultProps} />);
    await user.type(screen.getByTestId('command-palette-input'), 'search');
    expect(screen.getByTestId('command-item-find')).toBeInTheDocument();
  });

  it('shows empty state when no matches', async () => {
    const user = userEvent.setup();
    render(<CommandPalette {...defaultProps} />);
    await user.type(screen.getByTestId('command-palette-input'), 'zzzzz');
    expect(screen.getByTestId('command-palette-empty')).toBeInTheDocument();
  });

  it('selects command on Enter after arrow navigation', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<CommandPalette {...defaultProps} onSelect={onSelect} onClose={onClose} />);
    const input = screen.getByTestId('command-palette-input');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'save' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(<CommandPalette {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(screen.getByTestId('command-palette-input'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on overlay click', () => {
    const onClose = vi.fn();
    render(<CommandPalette {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('command-palette-overlay'));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not propagate click from dialog to overlay', () => {
    const onClose = vi.fn();
    render(<CommandPalette {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('command-palette'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders group labels', () => {
    render(<CommandPalette {...defaultProps} />);
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
  });

  it('displays keyboard shortcuts', () => {
    render(<CommandPalette {...defaultProps} />);
    expect(screen.getByText('Ctrl+O')).toBeInTheDocument();
  });

  it('shows description text for items that have one', () => {
    render(<CommandPalette {...defaultProps} />);
    expect(screen.getByText('Show or hide the integrated terminal')).toBeInTheDocument();
  });

  it('uses custom placeholder text', () => {
    render(<CommandPalette {...defaultProps} placeholder="Search resources…" />);
    expect(screen.getByPlaceholderText('Search resources…')).toBeInTheDocument();
  });

  it('has proper dialog accessibility attributes', () => {
    render(<CommandPalette {...defaultProps} />);
    const dialog = screen.getByTestId('command-palette');
    expect(dialog).toHaveAttribute('role', 'dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Command palette');
  });

  it('handles empty commands array', () => {
    render(<CommandPalette {...defaultProps} commands={[]} />);
    expect(screen.getByTestId('command-palette-empty')).toBeInTheDocument();
  });

  it('wraps ArrowDown from last to first item', () => {
    const onSelect = vi.fn();
    render(<CommandPalette {...defaultProps} onSelect={onSelect} />);
    const input = screen.getByTestId('command-palette-input');
    // 4 non-disabled commands, press down 4 times to wrap
    for (let i = 0; i < 4; i++) {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    }
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'open' }));
  });

  it('wraps ArrowUp from first to last item', () => {
    const onSelect = vi.fn();
    render(<CommandPalette {...defaultProps} onSelect={onSelect} />);
    const input = screen.getByTestId('command-palette-input');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'terminal' }));
  });

  it('does not call onSelect on Enter with empty results', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CommandPalette {...defaultProps} onSelect={onSelect} />);
    await user.type(screen.getByTestId('command-palette-input'), 'zzzzz');
    fireEvent.keyDown(screen.getByTestId('command-palette-input'), { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
  });
});
