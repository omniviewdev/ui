import { act, fireEvent, screen, waitFor, type RenderResult } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { TreeList } from './TreeList';

const items = Array.from({ length: 100 }, (_, index) => ({
  id: `file-${index}`,
  name: index === 79 ? 'Zebra.txt' : `File ${index}`,
}));
const itemKey = (item: (typeof items)[number]) => item.id;
const getChildren = () => undefined;
const getTextValue = (item: (typeof items)[number]) => item.name;

function VirtualTree({
  overscan = 0,
  estimatedItemSize,
}: {
  overscan?: number;
  estimatedItemSize?: number;
}) {
  return (
    <TreeList.Root
      items={items}
      itemKey={itemKey}
      getChildren={getChildren}
      getTextValue={getTextValue}
      renderItem={(item) => <TreeList.Item itemKey={item.id}>{item.name}</TreeList.Item>}
      density="compact"
      virtualized
      overscan={overscan}
      estimatedItemSize={estimatedItemSize}
    >
      <TreeList.Viewport data-testid="viewport" style={{ height: 66 }} />
    </TreeList.Root>
  );
}

async function renderVirtualTree() {
  let view!: RenderResult;
  await act(async () => {
    view = renderWithTheme(<VirtualTree />);
  });
  return view;
}

describe('TreeList virtualized navigation', () => {
  let rowHeight: number;
  const observers = new Map<
    Element,
    { callback: ResizeObserverCallback; observer: ResizeObserver }
  >();
  const originalScrollTo = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollTo');

  beforeEach(() => {
    rowHeight = 22;
    observers.clear();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(private readonly callback: ResizeObserverCallback) {}
        observe(target: Element) {
          observers.set(target, {
            callback: this.callback,
            observer: this as unknown as ResizeObserver,
          });
        }
        unobserve(target: Element) {
          observers.delete(target);
        }
        disconnect() {
          for (const [target, value] of observers) {
            if (value.observer === (this as unknown as ResizeObserver)) observers.delete(target);
          }
        }
      },
    );
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.dataset.testid === 'viewport' ? 66 : rowHeight;
    });
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(240);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.dataset.testid === 'viewport' ? 66 : rowHeight;
    });
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(240);
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      const content = this.querySelector<HTMLElement>('[data-index]')?.parentElement;
      return Number.parseFloat(content?.style.height ?? '') || items.length * rowHeight;
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      return DOMRect.fromRect({
        width: 240,
        height: this.dataset.testid === 'viewport' ? 66 : rowHeight,
      });
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value(this: HTMLElement, options: ScrollToOptions) {
        this.scrollTop = options.top ?? this.scrollTop;
        fireEvent.scroll(this);
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    if (originalScrollTo)
      Object.defineProperty(HTMLElement.prototype, 'scrollTo', originalScrollTo);
    else Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo');
  });

  it('reveals End, Home, arrows and typeahead targets that were not mounted', async () => {
    await renderVirtualTree();
    const tree = screen.getByRole('tree');
    const viewport = screen.getByTestId('viewport');
    expect(screen.queryByText('File 99')).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(tree, { key: 'End' });
    });
    await waitFor(() => expect(screen.getByText('File 99')).toBeInTheDocument());
    expect(viewport.scrollTop).toBeGreaterThan(0);
    expect(tree).toHaveAttribute('aria-activedescendant', screen.getByText('File 99').id);
    expect(screen.getByText('File 99')).toHaveAttribute('aria-posinset', '100');
    expect(screen.getByText('File 99')).toHaveAttribute('aria-setsize', '100');
    viewport.scrollTop = 0;
    await act(async () => {
      fireEvent.scroll(viewport);
    });
    expect(screen.getByText('File 99')).toBeInTheDocument();
    await act(async () => {
      fireEvent.keyDown(tree, { key: 'End' });
    });
    await waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(0));

    await act(async () => {
      fireEvent.keyDown(tree, { key: 'ArrowUp' });
    });
    expect(tree).toHaveAttribute('aria-activedescendant', screen.getByText('File 98').id);
    await act(async () => {
      fireEvent.keyDown(tree, { key: 'Home' });
    });
    await waitFor(() => expect(viewport.scrollTop).toBe(0));
    expect(tree).toHaveAttribute('aria-activedescendant', screen.getByText('File 0').id);
    await act(async () => {
      fireEvent.keyDown(tree, { key: 'z' });
    });
    expect(tree).toHaveAttribute('aria-activedescendant', screen.getByText('Zebra.txt').id);
    await waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(0));

    // Manual scrolling must not unmount the active descendant or force it back into view.
    viewport.scrollTop = 0;
    await act(async () => {
      fireEvent.scroll(viewport);
    });
    expect(screen.getByText('Zebra.txt')).toBeInTheDocument();
    expect(viewport.scrollTop).toBe(0);
  });

  it('uses rendered compact height and refreshes estimates after CSS size changes', async () => {
    await renderVirtualTree();
    const viewport = screen.getByTestId('viewport');
    const probe = viewport.querySelector('[aria-hidden="true"]')!;
    const content = probe.nextElementSibling as HTMLElement;
    await waitFor(() => expect(content.style.height).toBe('2200px'));

    rowHeight = 34;
    const observation = observers.get(probe)!;
    await act(async () => {
      observation.callback([], observation.observer);
    });
    await waitFor(() => expect(content.style.height).toBe('3400px'));
  });

  it('honors caller overscan and explicit estimates instead of the CSS default', async () => {
    const { rerender } = await renderVirtualTree();
    const originalCount = screen.getAllByRole('treeitem').length;
    await act(async () => {
      rerender(<VirtualTree overscan={8} estimatedItemSize={40} />);
    });
    await waitFor(() =>
      expect(screen.getAllByRole('treeitem').length).toBeGreaterThan(originalCount),
    );
    const probe = screen.getByTestId('viewport').querySelector('[aria-hidden="true"]')!;
    expect(
      Number.parseFloat((probe.nextElementSibling as HTMLElement).style.height),
    ).toBeGreaterThan(2200);
  });
});

describe('TreeList visible sibling semantics', () => {
  interface TestNode {
    id: string;
    name: string;
    children?: readonly TestNode[];
  }
  const nodes: readonly TestNode[] = [
    {
      id: 'group',
      name: 'Group',
      children: [
        { id: 'one', name: 'Keep one' },
        { id: 'hidden', name: 'Other' },
        { id: 'two', name: 'Keep two' },
      ],
    },
    { id: 'last', name: 'Keep last', children: undefined },
  ];

  it('counts visible siblings rather than flattened positions after filtering', () => {
    renderWithTheme(
      <TreeList.Root
        items={nodes}
        itemKey={(item) => item.id}
        getChildren={(item) => item.children}
        getTextValue={(item) => item.name}
        filterText="keep"
        renderItem={(item) => <TreeList.Item itemKey={item.id}>{item.name}</TreeList.Item>}
      >
        <TreeList.Viewport />
      </TreeList.Root>,
    );
    expect(screen.getByText('Group')).toHaveAttribute('aria-posinset', '1');
    expect(screen.getByText('Group')).toHaveAttribute('aria-setsize', '2');
    expect(screen.getByText('Keep one')).toHaveAttribute('aria-posinset', '1');
    expect(screen.getByText('Keep two')).toHaveAttribute('aria-posinset', '2');
    expect(screen.getByText('Keep two')).toHaveAttribute('aria-setsize', '2');
    expect(screen.getByText('Keep last')).toHaveAttribute('aria-posinset', '2');
  });

  it('does not enter a neighboring branch when all direct children are disabled', () => {
    renderWithTheme(
      <TreeList.Root
        items={nodes}
        itemKey={(item) => item.id}
        getChildren={(item) => item.children}
        defaultExpandedKeys={['group']}
        defaultActiveKey="group"
        disabledKeys={['one', 'hidden', 'two']}
        renderItem={(item) => <TreeList.Item itemKey={item.id}>{item.name}</TreeList.Item>}
      >
        <TreeList.Viewport />
      </TreeList.Root>,
    );
    const tree = screen.getByRole('tree');
    const activeId = tree.getAttribute('aria-activedescendant');
    fireEvent.keyDown(tree, { key: 'ArrowRight' });
    expect(tree).toHaveAttribute('aria-activedescendant', activeId);
  });
});
