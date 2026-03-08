import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CommandList } from './CommandList';
import type { CommandListRootProps, CommandItemMeta, HighlightRange } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface TestCommand {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  category?: string;
  disabled?: boolean;
}

const commands: TestCommand[] = [
  { id: 'open', label: 'Open File', description: 'Open a file', shortcut: '⌘O', category: 'file' },
  {
    id: 'save',
    label: 'Save File',
    description: 'Save current file',
    shortcut: '⌘S',
    category: 'file',
  },
  {
    id: 'find',
    label: 'Find in Files',
    description: 'Search across files',
    shortcut: '⇧⌘F',
    category: 'search',
  },
  { id: 'replace', label: 'Find and Replace', shortcut: '⌘H', category: 'search' },
  { id: 'terminal', label: 'Toggle Terminal', category: 'view' },
];

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

type Story = Partial<CommandListRootProps<TestCommand>>;

function TestCommandList(overrides: Story = {}) {
  const {
    items = commands,
    itemKey = (item) => item.id,
    renderItem = (item: TestCommand, meta: CommandItemMeta) => (
      <CommandList.Item itemKey={meta.key} disabled={item.disabled}>
        <CommandList.ItemLabel>{item.label}</CommandList.ItemLabel>
        {item.description && (
          <CommandList.ItemDescription>{item.description}</CommandList.ItemDescription>
        )}
        {item.shortcut && <CommandList.ItemShortcut keys={[item.shortcut]} />}
      </CommandList.Item>
    ),
    children,
    ...rest
  } = overrides;

  return (
    <CommandList.Root items={items} itemKey={itemKey} renderItem={renderItem} {...rest}>
      <CommandList.Input />
      <CommandList.Results />
      <CommandList.Empty>No results found</CommandList.Empty>
      <CommandList.Loading>Searching…</CommandList.Loading>
      {children}
    </CommandList.Root>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CommandList', () => {
  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  describe('Rendering', () => {
    it('renders with role="combobox"', () => {
      renderWithTheme(<TestCommandList />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders results with role="listbox"', () => {
      renderWithTheme(<TestCommandList />);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('renders items with role="option"', () => {
      renderWithTheme(<TestCommandList />);
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(commands.length);
    });

    it('renders item labels', () => {
      renderWithTheme(<TestCommandList />);
      for (const cmd of commands) {
        expect(screen.getByText(cmd.label)).toBeInTheDocument();
      }
    });

    it('renders search input', () => {
      renderWithTheme(<TestCommandList />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('sets aria-activedescendant on combobox', () => {
      renderWithTheme(<TestCommandList />);
      const combobox = screen.getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-activedescendant');
    });
  });

  // -------------------------------------------------------------------------
  // Query
  // -------------------------------------------------------------------------

  describe('Query', () => {
    it('updates input value on typing', async () => {
      const user = userEvent.setup();
      renderWithTheme(<TestCommandList />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'find');
      expect(input).toHaveValue('find');
    });

    it('fires onQueryChange when typing', async () => {
      const onQueryChange = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(<TestCommandList onQueryChange={onQueryChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'a');
      expect(onQueryChange).toHaveBeenCalledWith('a');
    });

    it('supports controlled query', () => {
      renderWithTheme(<TestCommandList query="test" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('test');
    });

    it('supports defaultQuery', () => {
      renderWithTheme(<TestCommandList defaultQuery="hello" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('hello');
    });
  });

  // -------------------------------------------------------------------------
  // Client-side filtering
  // -------------------------------------------------------------------------

  describe('Client-side filtering', () => {
    it('filters items when filterFn is provided', async () => {
      const user = userEvent.setup();
      const filterFn = (item: TestCommand, q: string) =>
        item.label.toLowerCase().includes(q.toLowerCase());

      renderWithTheme(<TestCommandList filterFn={filterFn} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'find');

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(2); // "Find in Files" and "Find and Replace"
    });

    it('sorts by score when filterFn returns numbers', async () => {
      const user = userEvent.setup();
      const filterFn = (item: TestCommand, q: string) => {
        if (!item.label.toLowerCase().includes(q.toLowerCase())) return 0;
        return item.label.toLowerCase().startsWith(q.toLowerCase()) ? 100 : 50;
      };

      renderWithTheme(<TestCommandList filterFn={filterFn} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'find');

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveTextContent('Find in Files');
    });
  });

  // -------------------------------------------------------------------------
  // External search
  // -------------------------------------------------------------------------

  describe('External search', () => {
    it('renders new items when items prop updates', () => {
      const { rerender } = renderWithTheme(<TestCommandList items={commands.slice(0, 2)} />);
      expect(screen.getAllByRole('option')).toHaveLength(2);

      rerender(
        <ThemeProvider>
          <TestCommandList items={commands} />
        </ThemeProvider>,
      );
      expect(screen.getAllByRole('option')).toHaveLength(commands.length);
    });

    it('shows loading indicator when loading prop is true', () => {
      renderWithTheme(<TestCommandList loading />);
      expect(screen.getByText('Searching…')).toBeInTheDocument();
    });

    it('hides loading indicator when loading is false', () => {
      renderWithTheme(<TestCommandList loading={false} />);
      expect(screen.queryByText('Searching…')).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Keyboard navigation
  // -------------------------------------------------------------------------

  describe('Keyboard navigation', () => {
    it('first item is active by default', () => {
      renderWithTheme(<TestCommandList />);
      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('data-ov-active', 'true');
    });

    it('ArrowDown moves active to next item', async () => {
      const user = userEvent.setup();
      renderWithTheme(<TestCommandList />);

      await user.keyboard('{ArrowDown}');

      const options = screen.getAllByRole('option');
      expect(options[1]).toHaveAttribute('data-ov-active', 'true');
    });

    it('ArrowUp moves active to previous item', async () => {
      const user = userEvent.setup();
      renderWithTheme(<TestCommandList />);

      // Move down first, then up
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('data-ov-active', 'true');
    });

    it('Enter invokes onAction with active item', async () => {
      const onAction = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(<TestCommandList onAction={onAction} />);

      await user.keyboard('{Enter}');
      expect(onAction).toHaveBeenCalledWith('open', commands[0]);
    });

    it('Escape calls onDismiss', async () => {
      const onDismiss = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(<TestCommandList onDismiss={onDismiss} />);

      await user.keyboard('{Escape}');
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('Home moves to first item', async () => {
      const user = userEvent.setup();
      renderWithTheme(<TestCommandList />);

      // Move to last
      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
      await user.keyboard('{Home}');

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('data-ov-active', 'true');
    });

    it('End moves to last item', async () => {
      const user = userEvent.setup();
      renderWithTheme(<TestCommandList />);

      await user.keyboard('{End}');

      const options = screen.getAllByRole('option');
      expect(options[options.length - 1]).toHaveAttribute('data-ov-active', 'true');
    });
  });

  // -------------------------------------------------------------------------
  // Grouping
  // -------------------------------------------------------------------------

  describe('Grouping', () => {
    it('renders group headers', () => {
      renderWithTheme(
        <TestCommandList
          groupBy={(item) => item.category ?? 'other'}
          groupOrder={['file', 'search', 'view']}
          groupLabel={(key) => ({ file: 'File', search: 'Search', view: 'View' })[key] ?? key}
        />,
      );

      expect(screen.getByText('File')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('View')).toBeInTheDocument();
    });

    it('renders items within groups', () => {
      renderWithTheme(
        <TestCommandList
          groupBy={(item) => item.category ?? 'other'}
          groupOrder={['file', 'search', 'view']}
          groupLabel={(key) => ({ file: 'File', search: 'Search', view: 'View' })[key] ?? key}
        />,
      );

      const groups = screen.getAllByRole('group');
      expect(groups).toHaveLength(3);
    });

    it('respects group order', () => {
      renderWithTheme(
        <TestCommandList
          groupBy={(item) => item.category ?? 'other'}
          groupOrder={['view', 'file', 'search']}
          groupLabel={(key) => ({ file: 'File', search: 'Search', view: 'View' })[key] ?? key}
        />,
      );

      const viewHeader = screen.getByText('View');
      const fileHeader = screen.getByText('File');
      const searchHeader = screen.getByText('Search');

      // Verify DOM order: View before File before Search
      expect(
        viewHeader.compareDocumentPosition(fileHeader) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(
        fileHeader.compareDocumentPosition(searchHeader) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Highlights
  // -------------------------------------------------------------------------

  describe('Highlights', () => {
    it('renders mark elements for highlight ranges', () => {
      const highlights = new Map<string | number, HighlightRange[]>([
        ['open', [{ start: 0, end: 4 }]],
      ]);

      renderWithTheme(
        <TestCommandList
          highlights={highlights}
          renderItem={(item: TestCommand, meta: CommandItemMeta) => (
            <CommandList.Item itemKey={meta.key}>
              <CommandList.ItemLabel highlights={meta.highlights}>
                {item.label}
              </CommandList.ItemLabel>
            </CommandList.Item>
          )}
        />,
      );

      const marks = document.querySelectorAll('mark');
      expect(marks).toHaveLength(1);
      expect(marks[0]).toHaveTextContent('Open');
    });
  });

  // -------------------------------------------------------------------------
  // Disabled items
  // -------------------------------------------------------------------------

  describe('Disabled items', () => {
    it('skips items disabled via disabledKeys in keyboard navigation', async () => {
      const user = userEvent.setup();
      const itemsForTest: TestCommand[] = [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
      ];

      renderWithTheme(<TestCommandList items={itemsForTest} disabledKeys={['b']} />);

      await user.keyboard('{ArrowDown}');

      const options = screen.getAllByRole('option');
      // Should skip 'B' (disabled via disabledKeys) and land on 'C'
      expect(options[2]).toHaveAttribute('data-ov-active', 'true');
    });

    it('renders item-level disabled prop as aria-disabled and data-ov-disabled', () => {
      const itemsWithDisabled: TestCommand[] = [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B', disabled: true },
        { id: 'c', label: 'C' },
      ];

      renderWithTheme(<TestCommandList items={itemsWithDisabled} />);

      const options = screen.getAllByRole('option');
      expect(options[1]).toHaveAttribute('aria-disabled', 'true');
      expect(options[1]).toHaveAttribute('data-ov-disabled', 'true');
    });

    it('renders disabled items with aria-disabled', () => {
      renderWithTheme(<TestCommandList disabledKeys={['open']} />);

      const firstOption = screen.getAllByRole('option')[0]!;
      expect(firstOption).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not invoke disabled items on Enter', async () => {
      const onAction = vi.fn();
      const user = userEvent.setup();
      const itemsWithDisabled: TestCommand[] = [
        { id: 'a', label: 'A', disabled: true },
        { id: 'b', label: 'B' },
      ];

      renderWithTheme(
        <TestCommandList items={itemsWithDisabled} disabledKeys={['a']} onAction={onAction} />,
      );

      // Active should be on first non-disabled = 'b'
      await user.keyboard('{Enter}');
      expect(onAction).toHaveBeenCalledWith('b', itemsWithDisabled[1]);
    });
  });

  // -------------------------------------------------------------------------
  // Active tracking
  // -------------------------------------------------------------------------

  describe('Active tracking', () => {
    it('resets active to first item when items change', () => {
      const { rerender } = renderWithTheme(<TestCommandList items={commands} />);

      // Initially first item is active
      let options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('data-ov-active', 'true');

      // Change items
      rerender(
        <ThemeProvider>
          <TestCommandList items={commands.slice(2)} />
        </ThemeProvider>,
      );

      options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('data-ov-active', 'true');
    });
  });

  // -------------------------------------------------------------------------
  // Empty / Loading
  // -------------------------------------------------------------------------

  describe('Empty and Loading states', () => {
    it('shows empty state when no items', () => {
      renderWithTheme(<TestCommandList items={[]} />);
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    it('hides empty state when items exist', () => {
      renderWithTheme(<TestCommandList />);
      expect(screen.queryByText('No results found')).not.toBeInTheDocument();
    });

    it('shows loading instead of empty when loading', () => {
      renderWithTheme(<TestCommandList items={[]} loading />);
      expect(screen.getByText('Searching…')).toBeInTheDocument();
      expect(screen.queryByText('No results found')).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Click behavior
  // -------------------------------------------------------------------------

  describe('Click behavior', () => {
    it('invokes action on item click', () => {
      const onAction = vi.fn();
      renderWithTheme(<TestCommandList onAction={onAction} />);

      // Click the second item using fireEvent for synchronous behavior
      const options = screen.getAllByRole('option');
      fireEvent.click(options[1]!);

      expect(onAction).toHaveBeenCalledWith('save', commands[1]);
    });

    it('activates item on mouse move', () => {
      renderWithTheme(<TestCommandList />);

      const options = screen.getAllByRole('option');
      fireEvent.mouseMove(options[2]!);

      expect(options[2]).toHaveAttribute('data-ov-active', 'true');
    });
  });
});
