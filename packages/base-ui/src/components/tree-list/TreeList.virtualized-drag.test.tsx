import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { TreeList } from './TreeList';

const originalScrollTo = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollTo');
beforeEach(() => {
  // JSDOM has no layout; keep the actual virtualizer and drag sensors.
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    return DOMRect.fromRect({ width: 320, height: this.hasAttribute('data-index') ? 28 : 200 });
  });
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(320);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(200);
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(2800);
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(320);
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.hasAttribute('data-index') ? 28 : 200;
  });
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value(this: HTMLElement, options: ScrollToOptions) {
      const top = Math.max(0, options.top ?? 0);
      if (this.scrollTop === top) return;
      this.scrollTop = top;
      queueMicrotask(() => this.dispatchEvent(new Event('scroll')));
    },
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  if (originalScrollTo) Object.defineProperty(HTMLElement.prototype, 'scrollTo', originalScrollTo);
  else Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo');
});

it('keeps the drag source and keyboard-active row mounted until drag cancellation', async () => {
  renderWithTheme(
    <TreeList
      items={Array.from({ length: 100 }, (_, index) => ({ id: String(index) }))}
      itemKey={(item) => item.id}
      getChildren={() => undefined}
      renderItem={(item) => (
        <TreeList.ReorderableItem itemKey={item.id} aria-label={item.id}>
          <TreeList.ItemDragHandle aria-label={`Move ${item.id}`}>Move</TreeList.ItemDragHandle>
          <TreeList.ItemLabel>{item.id}</TreeList.ItemLabel>
        </TreeList.ReorderableItem>
      )}
      reorderable
      virtualized
      overscan={0}
      estimatedItemSize={28}
      defaultActiveKey="0"
    >
      <TreeList.Viewport data-testid="viewport" />
    </TreeList>,
  );
  const handle = await screen.findByRole('button', { name: 'Move 1' });
  handle.focus();
  fireEvent.keyDown(handle, { key: ' ', code: 'Space' });
  await waitFor(() => expect(handle).toHaveAttribute('aria-pressed', 'true'));

  const viewport = screen.getByTestId('viewport');
  viewport.scrollTop = 1400;
  fireEvent.scroll(viewport);
  await screen.findByRole('treeitem', { name: '50' });
  expect(screen.getByRole('button', { name: 'Move 1' })).toBe(handle);
  const activeId = screen.getByRole('tree').getAttribute('aria-activedescendant');
  expect(document.getElementById(activeId!)).toHaveAttribute('aria-label', '0');

  fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Move 1' })).toBeNull());
  expect(document.getElementById(activeId!)).toHaveAttribute('aria-label', '0');
});

it('preserves manual scroll until a source change moves the active key', async () => {
  const items = Array.from({ length: 100 }, (_, index) => ({ id: String(index) }));
  function Example({ items }: { items: Array<{ id: string }> }) {
    return (
      <TreeList
        items={items}
        itemKey={(item) => item.id}
        getChildren={() => undefined}
        renderItem={(item) => (
          <TreeList.Item itemKey={item.id} aria-label={item.id}>
            <TreeList.ItemLabel>{item.id}</TreeList.ItemLabel>
          </TreeList.Item>
        )}
        virtualized
        overscan={0}
        estimatedItemSize={28}
        defaultActiveKey="0"
      >
        <TreeList.Viewport data-testid="viewport" />
      </TreeList>
    );
  }
  const { rerender } = renderWithTheme(<Example items={items} />);
  const viewport = screen.getByTestId('viewport');
  viewport.scrollTop = 1400;
  fireEvent.scroll(viewport);
  await screen.findByRole('treeitem', { name: '50' });

  rerender(<Example items={[...items, { id: '100' }]} />);

  await waitFor(() =>
    expect(screen.getByRole('treeitem', { name: '0' })).toHaveAttribute('aria-setsize', '101'),
  );
  expect(viewport.scrollTop).toBe(1400);

  rerender(<Example items={[{ id: 'before' }, ...items, { id: '100' }]} />);

  await waitFor(() => expect(viewport.scrollTop).toBeLessThan(viewport.clientHeight));
  expect(screen.getByRole('treeitem', { name: '0' })).toHaveAttribute('aria-posinset', '2');
  const activeId = screen.getByRole('tree').getAttribute('aria-activedescendant');
  expect(document.getElementById(activeId!)).toHaveAttribute('aria-label', '0');
});
