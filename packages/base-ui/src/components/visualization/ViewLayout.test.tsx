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
    expect(move).toHaveFocus();
    const announcement = screen
      .getAllByRole('status')
      .find((status) => status.textContent?.includes('Inventory'));
    expect(announcement).toHaveTextContent(/\b1\b/);
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
    expect(resize).toHaveFocus();
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

  it('recovers focus to the next panel, previous panel, then empty layout after accepted removals', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Example />);
    await user.click(screen.getByRole('button', { name: 'Remove Capacity' }));
    expect(screen.getByRole('article', { name: 'Inventory' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Drag Inventory' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Remove Inventory' }));
    expect(screen.getByRole('group', { name: 'View layout' })).toHaveFocus();
  });

  it('recovers focus on external removal without stealing focus from outside the layout', () => {
    const onItemsChange = vi.fn();
    const view = (items: ViewLayoutItem[]) => (
      <>
        <button>Outside</button>
        <ViewLayout items={items} onItemsChange={onItemsChange} editing renderItem={() => null} />
      </>
    );
    const { rerender } = renderWithTheme(view(initial));
    screen.getByRole('button', { name: 'Resize Inventory' }).focus();
    rerender(view([initial[0]!]));
    expect(screen.getByRole('article', { name: 'Capacity' })).toHaveFocus();
    screen.getByRole('button', { name: 'Outside' }).focus();
    rerender(view([]));
    expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus();
  });

  it('does not emit a resize request at a bound', () => {
    const onItemsChange = vi.fn();
    renderWithTheme(
      <ViewLayout
        items={[{ ...initial[0]!, columnSpan: 4 }]}
        columns={4}
        onItemsChange={onItemsChange}
        editing
        renderItem={() => null}
      />,
    );
    fireEvent.keyDown(screen.getByRole('button', { name: 'Resize Capacity' }), {
      key: 'ArrowRight',
    });
    expect(onItemsChange).not.toHaveBeenCalled();
  });

  it.each(['disabled', 'readOnly'] as const)(
    'prevents layout mutation when %s while preserving content navigation',
    async (mode) => {
      const onItemsChange = vi.fn();
      const onConfigure = vi.fn();
      renderWithTheme(
        <ViewLayout
          items={initial}
          onItemsChange={onItemsChange}
          onConfigure={onConfigure}
          editing
          {...{ [mode]: true }}
          renderItem={() => <button>Inspect result</button>}
        />,
      );
      const resize = screen.getByRole('button', { name: 'Resize Capacity' });
      resize.focus();
      fireEvent.keyDown(resize, { key: 'ArrowRight' });
      await userEvent.click(screen.getByRole('button', { name: 'Remove Capacity' }));
      await userEvent.click(screen.getByRole('button', { name: 'Move Capacity later' }));
      await userEvent.click(screen.getByRole('button', { name: 'Configure Capacity' }));
      expect(onItemsChange).not.toHaveBeenCalled();
      expect(onConfigure).not.toHaveBeenCalled();
      const content = within(screen.getByRole('article', { name: 'Capacity' })).getByRole(
        'button',
        { name: 'Inspect result' },
      );
      content.focus();
      expect(content).toHaveFocus();
    },
  );

  it('abandons an in-flight resize after newer external geometry arrives', () => {
    const onItemsChange = vi.fn();
    const view = (items: ViewLayoutItem[]) => (
      <ViewLayout
        items={items}
        columns={4}
        editing
        onItemsChange={onItemsChange}
        renderItem={() => null}
      />
    );
    const { rerender } = renderWithTheme(view(initial));
    const resize = screen.getByRole('button', { name: 'Resize Capacity' });
    // jsdom has no pointer capture or layout. Only those browser boundaries are supplied.
    resize.setPointerCapture = vi.fn();
    vi.spyOn(
      screen.getByRole('article', { name: 'Capacity' }),
      'getBoundingClientRect',
    ).mockReturnValue({ width: 400 } as DOMRect);
    fireEvent(
      resize,
      new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 100, clientY: 100 }),
    );
    rerender(view([{ ...initial[0]!, columnSpan: 3, rowSpan: 4 }, initial[1]!]));
    fireEvent(resize, new MouseEvent('pointermove', { bubbles: true, clientX: 300, clientY: 100 }));
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(screen.getByText('3 / 4 columns · 4 rows')).toBeInTheDocument();
  });
});
