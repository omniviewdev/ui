import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { List } from './List';

const items = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Bravo' },
  { id: 'c', label: 'Charlie' },
  { id: 'd', label: 'Delta' },
];

function TestList(props: React.ComponentProps<typeof List>) {
  return (
    <List data-testid="list-root" {...props}>
      <List.Viewport data-testid="list-viewport">
        {items.map((item) => (
          <List.Item key={item.id} itemKey={item.id} textValue={item.label}>
            <List.ItemLabel>{item.label}</List.ItemLabel>
          </List.Item>
        ))}
      </List.Viewport>
    </List>
  );
}

describe('List', () => {
  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  it('renders with default data attributes', () => {
    renderWithTheme(<TestList />);
    const root = screen.getByTestId('list-root');
    expect(root).toHaveAttribute('data-ov-variant', 'soft');
    expect(root).toHaveAttribute('data-ov-color', 'neutral');
    expect(root).toHaveAttribute('data-ov-size', 'md');
    expect(root).toHaveAttribute('data-ov-density', 'default');
  });

  it('renders discovery and secondary colors', () => {
    const { rerender } = renderWithTheme(<TestList color="discovery" />);
    expect(screen.getByTestId('list-root')).toHaveAttribute('data-ov-color', 'discovery');

    rerender(<TestList color="secondary" />);
    expect(screen.getByTestId('list-root')).toHaveAttribute('data-ov-color', 'secondary');
  });

  it('renders with custom data attributes', () => {
    renderWithTheme(<TestList variant="outline" color="brand" size="sm" density="compact" />);
    const root = screen.getByTestId('list-root');
    expect(root).toHaveAttribute('data-ov-variant', 'outline');
    expect(root).toHaveAttribute('data-ov-color', 'brand');
    expect(root).toHaveAttribute('data-ov-size', 'sm');
    expect(root).toHaveAttribute('data-ov-density', 'compact');
  });

  it('renders all item labels', () => {
    renderWithTheme(<TestList />);
    for (const item of items) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it('renders items with role="option"', () => {
    renderWithTheme(<TestList />);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(items.length);
  });

  it('renders root with role="listbox"', () => {
    renderWithTheme(<TestList />);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Selection: single
  // -------------------------------------------------------------------------

  it('selects an item on click in single mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(<TestList selectionMode="single" onSelectedKeysChange={onChange} />);

    await user.click(screen.getByText('Bravo'));
    expect(onChange).toHaveBeenCalledWith(new Set(['b']));
  });

  it('replaces selection on click in single mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(
      <TestList
        selectionMode="single"
        defaultSelectedKeys={['a']}
        onSelectedKeysChange={onChange}
      />,
    );

    await user.click(screen.getByText('Charlie'));
    expect(onChange).toHaveBeenCalledWith(new Set(['c']));
  });

  // -------------------------------------------------------------------------
  // Selection: multiple
  // -------------------------------------------------------------------------

  it('adds to selection with ctrl+click in multiple mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(<TestList selectionMode="multiple" onSelectedKeysChange={onChange} />);

    await user.click(screen.getByText('Alpha'));
    expect(onChange).toHaveBeenLastCalledWith(new Set(['a']));

    await user.keyboard('{Control>}');
    await user.click(screen.getByText('Charlie'));
    await user.keyboard('{/Control}');
    expect(onChange).toHaveBeenLastCalledWith(new Set(['a', 'c']));
  });

  // -------------------------------------------------------------------------
  // Keyboard navigation
  // -------------------------------------------------------------------------

  it('navigates with arrow keys', async () => {
    const user = userEvent.setup();

    renderWithTheme(<TestList selectionMode="single" />);
    const listbox = screen.getByRole('listbox');
    listbox.focus();

    // ArrowDown should activate first item, then second
    await user.keyboard('{ArrowDown}');
    const firstItem = screen.getByText('Alpha').closest('[role="option"]');
    expect(firstItem).toHaveAttribute('data-ov-active', 'true');

    await user.keyboard('{ArrowDown}');
    const secondItem = screen.getByText('Bravo').closest('[role="option"]');
    expect(secondItem).toHaveAttribute('data-ov-active', 'true');
  });

  it('selects active item with Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(<TestList selectionMode="single" onSelectedKeysChange={onChange} />);
    const listbox = screen.getByRole('listbox');
    listbox.focus();

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(new Set(['a']));
  });

  it('navigates to first item with Home', async () => {
    const user = userEvent.setup();

    renderWithTheme(<TestList selectionMode="single" defaultActiveKey="c" />);
    const listbox = screen.getByRole('listbox');
    listbox.focus();

    await user.keyboard('{Home}');
    const firstItem = screen.getByText('Alpha').closest('[role="option"]');
    expect(firstItem).toHaveAttribute('data-ov-active', 'true');
  });

  it('navigates to last item with End', async () => {
    const user = userEvent.setup();

    renderWithTheme(<TestList selectionMode="single" defaultActiveKey="a" />);
    const listbox = screen.getByRole('listbox');
    listbox.focus();

    await user.keyboard('{End}');
    const lastItem = screen.getByText('Delta').closest('[role="option"]');
    expect(lastItem).toHaveAttribute('data-ov-active', 'true');
  });

  it('selects all with Ctrl+A in multiple mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(<TestList selectionMode="multiple" onSelectedKeysChange={onChange} />);

    const listbox = screen.getByRole('listbox');
    listbox.focus();

    await user.keyboard('{Control>}a{/Control}');
    expect(onChange).toHaveBeenCalledWith(new Set(['a', 'b', 'c', 'd']));
  });

  it('focuses matching item via typeahead', async () => {
    const user = userEvent.setup();

    renderWithTheme(<TestList selectionMode="single" />);

    const listbox = screen.getByRole('listbox');
    listbox.focus();

    await user.keyboard('c');
    const charlie = screen.getByText('Charlie').closest('[role="option"]');
    expect(charlie).toHaveAttribute('data-ov-active', 'true');
  });

  // -------------------------------------------------------------------------
  // Disabled items
  // -------------------------------------------------------------------------

  it('skips disabled items in keyboard navigation', async () => {
    const user = userEvent.setup();

    renderWithTheme(<TestList selectionMode="single" disabledKeys={['b']} />);
    const listbox = screen.getByRole('listbox');
    listbox.focus();

    await user.keyboard('{ArrowDown}'); // Alpha
    await user.keyboard('{ArrowDown}'); // skips Bravo -> Charlie
    const charlie = screen.getByText('Charlie').closest('[role="option"]');
    expect(charlie).toHaveAttribute('data-ov-active', 'true');
  });

  it('renders disabled items with data-ov-disabled', () => {
    renderWithTheme(<TestList disabledKeys={['b']} />);
    const bravo = screen.getByText('Bravo').closest('[role="option"]');
    expect(bravo).toHaveAttribute('data-ov-disabled', 'true');
  });

  it('does not select disabled items on click', () => {
    const onChange = vi.fn();

    renderWithTheme(
      <TestList selectionMode="single" disabledKeys={['b']} onSelectedKeysChange={onChange} />,
    );

    const bravo = screen.getByText('Bravo').closest('[role="option"]')!;
    expect(bravo).toHaveAttribute('aria-disabled', 'true');
    expect(bravo).toHaveAttribute('data-ov-disabled', 'true');

    // Use fireEvent to bypass pointer-events: none CSS
    fireEvent.click(bravo);
    expect(onChange).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Empty / Loading
  // -------------------------------------------------------------------------

  it('renders empty state', () => {
    renderWithTheme(
      <List>
        <List.Viewport>
          <List.Empty>No items</List.Empty>
        </List.Viewport>
      </List>,
    );
    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    renderWithTheme(
      <List loading>
        <List.Viewport>
          <List.Loading>Loading items...</List.Loading>
        </List.Viewport>
      </List>,
    );
    expect(screen.getByText('Loading items...')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Groups
  // -------------------------------------------------------------------------

  it('renders groups with role="group"', () => {
    renderWithTheme(
      <List>
        <List.Viewport>
          <List.Group>
            <List.GroupHeader>Group 1</List.GroupHeader>
            <List.Item itemKey="x" textValue="X">
              <List.ItemLabel>X</List.ItemLabel>
            </List.Item>
          </List.Group>
        </List.Viewport>
      </List>,
    );
    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByText('Group 1')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Separator
  // -------------------------------------------------------------------------

  it('renders separator with role="separator"', () => {
    renderWithTheme(
      <List>
        <List.Viewport>
          <List.Item itemKey="x" textValue="X">
            <List.ItemLabel>X</List.ItemLabel>
          </List.Item>
          <List.Separator />
          <List.Item itemKey="y" textValue="Y">
            <List.ItemLabel>Y</List.ItemLabel>
          </List.Item>
        </List.Viewport>
      </List>,
    );
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});
