import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { ViewLayout, type ViewLayoutItem } from './ViewLayout';

const initial: ViewLayoutItem[] = [
  { id: 'a', title: 'Capacity', columnSpan: 2, rowSpan: 1 },
  { id: 'b', title: 'Inventory', columnSpan: 2, rowSpan: 2 },
];
function Example({ editing = true }: { editing?: boolean }) {
  const [items, setItems] = useState(initial);
  return (
    <>
      <ViewLayout
        items={items}
        onItemsChange={setItems}
        columns={4}
        editing={editing}
        renderItem={(item) => <p>{item.id} content</p>}
      />
      <output>{JSON.stringify(items)}</output>
    </>
  );
}

describe('ViewLayout', () => {
  it('moves a keyed component with keyboard without replacing its content', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Example />);
    const original = screen.getByText('b content');
    const move = screen.getByRole('button', { name: 'Move Inventory earlier' });
    move.focus();
    await user.keyboard('{Enter}');
    expect(screen.getAllByRole('article')[0]).toHaveAccessibleName('Inventory');
    expect(screen.getByText('b content')).toBe(original);
    expect(screen.getByText('Inventory moved to position 1')).toHaveAttribute('role', 'status');
  });

  it('resizes with accessible keyboard controls within geometry bounds', async () => {
    renderWithTheme(<Example />);
    const resize = screen.getByRole('button', { name: 'Resize Capacity' });
    resize.focus();
    fireEvent.keyDown(resize, { key: 'ArrowRight' });
    fireEvent.keyDown(resize, { key: 'ArrowDown' });
    expect(
      screen.getByText(/"columnSpan":3,"rowSpan":2/, { selector: 'output' }),
    ).toBeInTheDocument();
    fireEvent.keyDown(resize, { key: 'ArrowRight' });
    fireEvent.keyDown(resize, { key: 'ArrowRight' });
    expect(
      screen.getByText(/"columnSpan":4,"rowSpan":2/, { selector: 'output' }),
    ).toBeInTheDocument();
    expect(resize).toHaveAccessibleDescription(/Arrow keys/);
  });

  it('applies geometry beyond six rows through the configured maximum', () => {
    function TallPanel() {
      const [items, setItems] = useState([
        { id: 'tall', title: 'Tall', columnSpan: 1, rowSpan: 6 },
      ]);
      return (
        <ViewLayout
          items={items}
          onItemsChange={setItems}
          editing
          columns={1}
          maxRowSpan={15}
          renderItem={() => <p>Tall content</p>}
        />
      );
    }
    renderWithTheme(<TallPanel />);
    const resize = screen.getByRole('button', { name: 'Resize Tall' });
    fireEvent.keyDown(resize, { key: 'ArrowDown' });
    const geometry = screen.getByRole('article', { name: 'Tall' }).parentElement!;
    expect(geometry.style.getPropertyValue('--_ov-view-row-span')).toBe('7');
    for (let index = 0; index < 10; index++) fireEvent.keyDown(resize, { key: 'ArrowDown' });
    expect(geometry.style.getPropertyValue('--_ov-view-row-span')).toBe('15');
    expect(screen.getByText('1 / 1 columns · 15 rows')).toBeInTheDocument();
    expect(geometry.parentElement?.style.getPropertyValue('--_ov-view-row-height')).toBe('120px');
  });

  it('requests configuration and removal independently, preserving other panels', async () => {
    const onConfigure = vi.fn();
    const onItemsChange = vi.fn();
    renderWithTheme(
      <ViewLayout
        items={initial}
        columns={4}
        editing
        onConfigure={onConfigure}
        onItemsChange={onItemsChange}
        renderItem={(item) => <p>{item.id} content</p>}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Configure Capacity' }));
    expect(onConfigure).toHaveBeenCalledWith('a');
    await userEvent.click(screen.getByRole('button', { name: 'Remove Capacity' }));
    expect(onItemsChange).toHaveBeenCalledWith([initial[1]]);
    // Controlled: content remains until the owner accepts the removal.
    expect(screen.getByText('a content')).toBeInTheDocument();
  });

  it('hides edit affordances in preview while leaving live panel controls usable', async () => {
    const action = vi.fn();
    renderWithTheme(
      <ViewLayout
        items={initial}
        editing={false}
        onItemsChange={vi.fn()}
        renderItem={(item) => <button onClick={action}>{item.title} action</button>}
      />,
    );
    expect(
      screen.queryByRole('button', { name: /Remove|Resize|Move|Drag/ }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      within(screen.getByRole('article', { name: 'Capacity' })).getByRole('button'),
    );
    expect(action).toHaveBeenCalledOnce();
  });
});
