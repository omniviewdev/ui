import type { DragEndEvent } from '@dnd-kit/core';
import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { TreeList } from './TreeList';
import { handleTreeDragEnd } from './TreeListReorder';
import type { Key, TreeNodeMeta, TreeListRootProps, TreeOrder } from './types';

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

interface FileItem {
  path: string;
  name: string;
  type: 'file' | 'directory';
  children?: FileItem[];
}

const treeData: FileItem[] = [
  {
    path: '/src',
    name: 'src',
    type: 'directory',
    children: [
      {
        path: '/src/components',
        name: 'components',
        type: 'directory',
        children: [
          { path: '/src/components/App.tsx', name: 'App.tsx', type: 'file' },
          { path: '/src/components/Header.tsx', name: 'Header.tsx', type: 'file' },
        ],
      },
      { path: '/src/index.ts', name: 'index.ts', type: 'file' },
    ],
  },
  { path: '/README.md', name: 'README.md', type: 'file' },
];

function renderItem(item: FileItem, node: TreeNodeMeta) {
  return (
    <TreeList.Item itemKey={node.key} textValue={item.name}>
      <TreeList.ItemIndent
        depth={node.depth}
        ancestorIsLast={node.ancestorIsLast}
        isLastChild={node.isLastChild}
      />
      <TreeList.ItemToggle itemKey={node.key} />
      <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
    </TreeList.Item>
  );
}

function renderReorderableItem(item: FileItem, node: TreeNodeMeta) {
  return (
    <TreeList.ReorderableItem itemKey={node.key} textValue={item.name}>
      <TreeList.ItemDragHandle aria-label={`Reorder ${item.name}`}>⋮⋮</TreeList.ItemDragHandle>
      <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
    </TreeList.ReorderableItem>
  );
}

function dragEndEvent(activeKey: Key, overKey: Key | null): DragEndEvent {
  return {
    active: { id: activeKey },
    over: overKey === null ? null : { id: overKey },
  } as DragEndEvent;
}

function supportKeyboardDraggingInJSDOM() {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
}

function giveTreeRowsVerticalGeometry() {
  screen.getAllByRole('treeitem').forEach((row, index) => {
    vi.spyOn(row, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ x: 0, y: index * 40, width: 200, height: 32 }),
    );
  });
}

function TestTree(props: Partial<TreeListRootProps<FileItem>>) {
  const {
    items = treeData,
    itemKey = (item: FileItem) => item.path,
    getChildren = (item: FileItem) => item.children,
    isBranch = (item: FileItem) => item.type === 'directory',
    getTextValue = (item: FileItem) => item.name,
    renderItem: renderItemProp = renderItem,
    selectionMode = 'single',
    ...rest
  } = props;
  return (
    <TreeList.Root<FileItem>
      data-testid="tree-root"
      items={items}
      itemKey={itemKey}
      getChildren={getChildren}
      isBranch={isBranch}
      getTextValue={getTextValue}
      renderItem={renderItemProp}
      selectionMode={selectionMode}
      {...rest}
    >
      <TreeList.Viewport data-testid="tree-viewport" />
    </TreeList.Root>
  );
}

describe('TreeList', () => {
  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  it('renders with role="tree"', () => {
    renderWithTheme(<TestTree />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('renders items with role="treeitem"', () => {
    renderWithTheme(<TestTree />);
    const treeitems = screen.getAllByRole('treeitem');
    // Only root-level items visible: /src (collapsed), /README.md
    expect(treeitems).toHaveLength(2);
  });

  it('renders with default data attributes', () => {
    renderWithTheme(<TestTree />);
    const root = screen.getByTestId('tree-root');
    expect(root).toHaveAttribute('data-ov-variant', 'soft');
    expect(root).toHaveAttribute('data-ov-color', 'neutral');
    expect(root).toHaveAttribute('data-ov-size', 'md');
    expect(root).toHaveAttribute('data-ov-density', 'default');
  });

  it('renders discovery and secondary colors', () => {
    const { rerender } = renderWithTheme(<TestTree color="discovery" />);
    expect(screen.getByTestId('tree-root')).toHaveAttribute('data-ov-color', 'discovery');

    rerender(<TestTree color="secondary" />);
    expect(screen.getByTestId('tree-root')).toHaveAttribute('data-ov-color', 'secondary');
  });

  it('renders all visible item labels', () => {
    renderWithTheme(<TestTree />);
    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('README.md')).toBeInTheDocument();
    // Children not visible since src is collapsed
    expect(screen.queryByText('App.tsx')).not.toBeInTheDocument();
  });

  it('renders aria-level on items', () => {
    renderWithTheme(<TestTree defaultExpandedKeys={new Set(['/src'])} />);
    const src = screen.getByText('src').closest('[role="treeitem"]');
    expect(src).toHaveAttribute('aria-level', '1');

    const components = screen.getByText('components').closest('[role="treeitem"]');
    expect(components).toHaveAttribute('aria-level', '2');
  });

  it('renders aria-expanded on branch items', () => {
    renderWithTheme(<TestTree defaultExpandedKeys={new Set(['/src'])} />);
    const src = screen.getByText('src').closest('[role="treeitem"]');
    expect(src).toHaveAttribute('aria-expanded', 'true');

    const components = screen.getByText('components').closest('[role="treeitem"]');
    expect(components).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not render aria-expanded on leaf items', () => {
    renderWithTheme(<TestTree defaultExpandedKeys={new Set(['/src'])} />);
    const indexTs = screen.getByText('index.ts').closest('[role="treeitem"]');
    expect(indexTs).not.toHaveAttribute('aria-expanded');
  });

  // -------------------------------------------------------------------------
  // Expansion
  // -------------------------------------------------------------------------

  it('expands node on toggle click', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestTree />);

    expect(screen.queryByText('index.ts')).not.toBeInTheDocument();

    // Click the toggle for /src
    const toggles = screen.getAllByRole('button', { name: /expand/i });
    await user.click(toggles[0]!);

    expect(screen.getByText('index.ts')).toBeInTheDocument();
    expect(screen.getByText('components')).toBeInTheDocument();
  });

  it('collapses expanded node on toggle click', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestTree defaultExpandedKeys={new Set(['/src'])} />);

    expect(screen.getByText('index.ts')).toBeInTheDocument();

    const collapseBtn = screen.getAllByRole('button', { name: /collapse/i })[0]!;
    await user.click(collapseBtn);

    expect(screen.queryByText('index.ts')).not.toBeInTheDocument();
  });

  it('respects defaultExpandedKeys', () => {
    renderWithTheme(<TestTree defaultExpandedKeys={new Set(['/src', '/src/components'])} />);
    expect(screen.getByText('App.tsx')).toBeInTheDocument();
    expect(screen.getByText('Header.tsx')).toBeInTheDocument();
  });

  it('supports controlled expandedKeys', () => {
    const onChange = vi.fn();
    renderWithTheme(<TestTree expandedKeys={new Set(['/src'])} onExpandedKeysChange={onChange} />);
    expect(screen.getByText('index.ts')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Selection
  // -------------------------------------------------------------------------

  it('selects an item on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(<TestTree selectionMode="single" onSelectedKeysChange={onChange} />);

    await user.click(screen.getByText('README.md'));
    expect(onChange).toHaveBeenCalledWith(new Set(['/README.md']));
  });

  it('keeps non-selectable branches active and clickable without selecting them', async () => {
    const user = userEvent.setup();
    const onBranchClick = vi.fn();

    renderWithTheme(
      <TestTree
        renderItem={(item, node) => (
          <TreeList.Item
            itemKey={node.key}
            textValue={item.name}
            selectable={item.type !== 'directory'}
            onClick={item.type === 'directory' ? onBranchClick : undefined}
          >
            <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
          </TreeList.Item>
        )}
      />,
    );

    await user.click(screen.getByText('src'));
    const branch = screen.getByText('src').closest('[role="treeitem"]');
    expect(onBranchClick).toHaveBeenCalledOnce();
    expect(branch).toHaveAttribute('data-ov-active', 'true');
    expect(branch).not.toHaveAttribute('aria-selected');

    await user.click(screen.getByText('README.md'));
    const leaf = screen.getByText('README.md').closest('[role="treeitem"]');
    expect(leaf).toHaveAttribute('aria-selected', 'true');
  });

  it.each(['single', 'multiple'] as const)(
    'keeps non-selectable branches focused and expandable through keyboard activation in %s mode',
    async (selectionMode) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderWithTheme(
        <TestTree
          selectionMode={selectionMode}
          onSelectedKeysChange={onChange}
          renderItem={(item, node) => (
            <TreeList.Item itemKey={node.key} selectable={item.type !== 'directory'}>
              <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
            </TreeList.Item>
          )}
        />,
      );
      screen.getByRole('tree').focus();
      await user.keyboard('{ArrowDown}{Enter}{ArrowRight}');
      expect(screen.getByText('src').closest('[role="treeitem"]')).toHaveAttribute(
        'data-ov-active',
        'true',
      );
      expect(screen.getByText('src').closest('[role="treeitem"]')).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      await user.keyboard(' ');
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByText('src').closest('[role="treeitem"]')).not.toHaveAttribute(
        'aria-selected',
      );
      await user.keyboard('{End}{Enter}');
      expect(onChange).toHaveBeenLastCalledWith(new Set(['/README.md']));
    },
  );

  it('excludes never-mounted virtualized branches from Ctrl+A using source eligibility', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const renderRow = vi.fn(renderItem);
    const items: FileItem[] = Array.from({ length: 200 }, (_, index) => ({
      path: `row-${index}`,
      name: `Row ${index}`,
      type: index % 2 === 0 ? 'directory' : 'file',
      children: index % 2 === 0 ? [] : undefined,
    }));
    renderWithTheme(
      <TestTree
        items={items}
        virtualized
        selectionMode="multiple"
        isItemSelectable={(item) => item.type !== 'directory'}
        renderItem={renderRow}
        onSelectedKeysChange={onChange}
      />,
    );
    expect(screen.queryByText('Row 198')).not.toBeInTheDocument();
    expect(renderRow.mock.calls.some(([item]) => item.path === 'row-198')).toBe(false);
    screen.getByRole('tree').focus();
    await user.keyboard('{Control>}a{/Control}');
    expect(onChange).toHaveBeenLastCalledWith(
      new Set(items.filter((item) => item.type === 'file').map((item) => item.path)),
    );
  });

  it('keeps source eligibility authoritative over mounted item defaults and updates it externally', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = renderWithTheme(
      <TestTree
        isItemSelectable={(item) => item.type !== 'directory'}
        onSelectedKeysChange={onChange}
      />,
    );
    await user.click(screen.getByText('src'));
    screen.getByRole('tree').focus();
    await user.keyboard('{Enter} ');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('src').closest('[role="treeitem"]')).toHaveAttribute(
      'data-ov-active',
      'true',
    );
    rerender(<TestTree onSelectedKeysChange={onChange} />);
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(new Set(['/src']));
  });

  it('excludes non-selectable branches from select-all and keyboard ranges', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithTheme(
      <TestTree
        selectionMode="multiple"
        defaultExpandedKeys={new Set(['/src'])}
        onSelectedKeysChange={onChange}
        renderItem={(item, node) => (
          <TreeList.Item itemKey={node.key} selectable={item.type !== 'directory'}>
            <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
          </TreeList.Item>
        )}
      />,
    );
    screen.getByRole('tree').focus();
    await user.keyboard('{Control>}a{/Control}');
    expect(onChange).toHaveBeenLastCalledWith(new Set(['/src/index.ts', '/README.md']));
    await user.keyboard('{End}{Enter}{Shift>}{ArrowUp}{ArrowUp}{ArrowUp}{/Shift}');
    expect(onChange).toHaveBeenLastCalledWith(new Set(['/src/index.ts', '/README.md']));
    expect(screen.getByText('src').closest('[role="treeitem"]')).toHaveAttribute(
      'data-ov-active',
      'true',
    );
    expect(screen.getByText('components').closest('[role="treeitem"]')).not.toHaveAttribute(
      'aria-selected',
    );
    expect(screen.getByText('src').closest('[role="treeitem"]')).not.toHaveAttribute(
      'aria-selected',
    );
  });

  it('replaces selection on click in single mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(
      <TestTree
        selectionMode="single"
        defaultSelectedKeys={['/src']}
        onSelectedKeysChange={onChange}
      />,
    );

    await user.click(screen.getByText('README.md'));
    expect(onChange).toHaveBeenCalledWith(new Set(['/README.md']));
  });

  it('deselects on re-click with selectionBehavior=toggle in single mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(
      <TestTree
        selectionMode="single"
        selectionBehavior="toggle"
        onSelectedKeysChange={onChange}
      />,
    );

    // First click selects
    await user.click(screen.getByText('README.md'));
    expect(onChange).toHaveBeenLastCalledWith(new Set(['/README.md']));

    // Second click on same item should deselect
    await user.click(screen.getByText('README.md'));
    expect(onChange).toHaveBeenLastCalledWith(new Set());
  });

  it('keeps selection on re-click with selectionBehavior=replace in single mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(
      <TestTree
        selectionMode="single"
        selectionBehavior="replace"
        onSelectedKeysChange={onChange}
      />,
    );

    // First click selects
    await user.click(screen.getByText('README.md'));
    expect(onChange).toHaveBeenLastCalledWith(new Set(['/README.md']));

    // Second click on same item should keep it selected (replace = always select)
    await user.click(screen.getByText('README.md'));
    expect(onChange).toHaveBeenLastCalledWith(new Set(['/README.md']));
  });

  it('toggles individual items with selectionBehavior=toggle in multiple mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(
      <TestTree
        selectionMode="multiple"
        selectionBehavior="toggle"
        onSelectedKeysChange={onChange}
      />,
    );

    // Click src → selected
    await user.click(screen.getByText('src'));
    expect(onChange).toHaveBeenLastCalledWith(new Set(['/src']));

    // Click README → both selected (toggle adds without clearing)
    await user.click(screen.getByText('README.md'));
    expect(onChange).toHaveBeenLastCalledWith(new Set(['/src', '/README.md']));

    // Click src again → deselected, only README remains
    await user.click(screen.getByText('src'));
    expect(onChange).toHaveBeenLastCalledWith(new Set(['/README.md']));
  });

  it('replaces selection on plain click with selectionBehavior=replace in multiple mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(
      <TestTree
        selectionMode="multiple"
        selectionBehavior="replace"
        onSelectedKeysChange={onChange}
      />,
    );

    // Click src → selected
    await user.click(screen.getByText('src'));
    expect(onChange).toHaveBeenLastCalledWith(new Set(['/src']));

    // Click README without modifier → replaces (only README selected)
    await user.click(screen.getByText('README.md'));
    expect(onChange).toHaveBeenLastCalledWith(new Set(['/README.md']));
  });

  it('adds to selection with ctrl+click in multiple mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(<TestTree selectionMode="multiple" onSelectedKeysChange={onChange} />);

    await user.click(screen.getByText('src'));
    expect(onChange).toHaveBeenLastCalledWith(new Set(['/src']));

    await user.keyboard('{Control>}');
    await user.click(screen.getByText('README.md'));
    await user.keyboard('{/Control}');
    expect(onChange).toHaveBeenLastCalledWith(new Set(['/src', '/README.md']));
  });

  // -------------------------------------------------------------------------
  // Keyboard navigation
  // -------------------------------------------------------------------------

  it('navigates with ArrowDown/ArrowUp', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestTree />);

    const tree = screen.getByRole('tree');
    tree.focus();

    await user.keyboard('{ArrowDown}');
    const src = screen.getByText('src').closest('[role="treeitem"]');
    expect(src).toHaveAttribute('data-ov-active', 'true');

    await user.keyboard('{ArrowDown}');
    const readme = screen.getByText('README.md').closest('[role="treeitem"]');
    expect(readme).toHaveAttribute('data-ov-active', 'true');

    await user.keyboard('{ArrowUp}');
    expect(src).toHaveAttribute('data-ov-active', 'true');
  });

  it('expands collapsed branch with ArrowRight', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestTree />);

    const tree = screen.getByRole('tree');
    tree.focus();

    await user.keyboard('{ArrowDown}'); // active: /src
    await user.keyboard('{ArrowRight}'); // expand /src

    expect(screen.getByText('components')).toBeInTheDocument();
  });

  it('moves to first child with ArrowRight on expanded branch', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestTree defaultExpandedKeys={new Set(['/src'])} />);

    const tree = screen.getByRole('tree');
    tree.focus();

    await user.keyboard('{ArrowDown}'); // active: /src (expanded)
    await user.keyboard('{ArrowRight}'); // move to first child

    const components = screen.getByText('components').closest('[role="treeitem"]');
    expect(components).toHaveAttribute('data-ov-active', 'true');
  });

  it('ArrowRight on expanded branch skips disabled first child', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <TestTree defaultExpandedKeys={new Set(['/src'])} disabledKeys={['/src/components']} />,
    );

    const tree = screen.getByRole('tree');
    tree.focus();

    await user.keyboard('{ArrowDown}'); // active: /src (expanded)
    await user.keyboard('{ArrowRight}'); // should skip disabled /src/components

    const indexTs = screen.getByText('index.ts').closest('[role="treeitem"]');
    expect(indexTs).toHaveAttribute('data-ov-active', 'true');
  });

  it('collapses expanded branch with ArrowLeft', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestTree defaultExpandedKeys={new Set(['/src'])} />);

    const tree = screen.getByRole('tree');
    tree.focus();

    await user.keyboard('{ArrowDown}'); // active: /src (expanded)
    await user.keyboard('{ArrowLeft}'); // collapse /src

    expect(screen.queryByText('components')).not.toBeInTheDocument();
  });

  it('moves to parent with ArrowLeft on leaf/collapsed', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestTree defaultExpandedKeys={new Set(['/src'])} />);

    const tree = screen.getByRole('tree');
    tree.focus();

    await user.keyboard('{ArrowDown}'); // /src
    await user.keyboard('{ArrowDown}'); // /src/components
    await user.keyboard('{ArrowDown}'); // /src/index.ts
    await user.keyboard('{ArrowLeft}'); // back to parent /src

    const src = screen.getByText('src').closest('[role="treeitem"]');
    expect(src).toHaveAttribute('data-ov-active', 'true');
  });

  it('navigates to first item with Home', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestTree defaultActiveKey="/README.md" />);

    const tree = screen.getByRole('tree');
    tree.focus();

    await user.keyboard('{Home}');
    const src = screen.getByText('src').closest('[role="treeitem"]');
    expect(src).toHaveAttribute('data-ov-active', 'true');
  });

  it('navigates to last item with End', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestTree defaultActiveKey="/src" />);

    const tree = screen.getByRole('tree');
    tree.focus();

    await user.keyboard('{End}');
    const readme = screen.getByText('README.md').closest('[role="treeitem"]');
    expect(readme).toHaveAttribute('data-ov-active', 'true');
  });

  it('selects active item with Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(<TestTree selectionMode="single" onSelectedKeysChange={onChange} />);

    const tree = screen.getByRole('tree');
    tree.focus();

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(new Set(['/src']));
  });

  it('selects all with Ctrl+A in multiple mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(<TestTree selectionMode="multiple" onSelectedKeysChange={onChange} />);

    const tree = screen.getByRole('tree');
    tree.focus();

    await user.keyboard('{Control>}a{/Control}');
    expect(onChange).toHaveBeenCalledWith(new Set(['/src', '/README.md']));
  });

  // -------------------------------------------------------------------------
  // Disabled items
  // -------------------------------------------------------------------------

  it('skips disabled items in keyboard navigation', async () => {
    const user = userEvent.setup();

    renderWithTheme(<TestTree disabledKeys={['/README.md']} />);

    const tree = screen.getByRole('tree');
    tree.focus();

    // Only /src is navigable, ArrowDown from /src should not move to disabled README
    await user.keyboard('{ArrowDown}'); // /src
    await user.keyboard('{ArrowDown}'); // should not move (README disabled, no more items)

    const src = screen.getByText('src').closest('[role="treeitem"]');
    expect(src).toHaveAttribute('data-ov-active', 'true');
  });

  it('renders disabled items with aria-disabled', () => {
    renderWithTheme(<TestTree disabledKeys={['/README.md']} />);
    const readme = screen.getByText('README.md').closest('[role="treeitem"]');
    expect(readme).toHaveAttribute('aria-disabled', 'true');
    expect(readme).toHaveAttribute('data-ov-disabled', 'true');
  });

  it('does not select disabled items on click', () => {
    const onChange = vi.fn();

    renderWithTheme(
      <TestTree
        selectionMode="single"
        disabledKeys={['/README.md']}
        onSelectedKeysChange={onChange}
      />,
    );

    const readme = screen.getByText('README.md').closest('[role="treeitem"]')!;
    // Using fireEvent.click (not userEvent) to issue a low-level DOM click
    // directly on the disabled treeitem and verify it doesn't trigger selection.
    fireEvent.click(readme);
    expect(onChange).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Indentation
  // -------------------------------------------------------------------------

  it('sets --tree-depth CSS variable on ItemIndent', () => {
    renderWithTheme(<TestTree defaultExpandedKeys={new Set(['/src'])} />);

    // /src is depth 0, components is depth 1
    const src = screen.getByText('src').closest('[role="treeitem"]');
    const srcIndent = src?.querySelector('[class*="ItemIndent"]');
    expect(srcIndent).toHaveStyle({ '--tree-depth': '0' });

    const components = screen.getByText('components').closest('[role="treeitem"]');
    const compIndent = components?.querySelector('[class*="ItemIndent"]');
    expect(compIndent).toHaveStyle({ '--tree-depth': '1' });
  });

  // -------------------------------------------------------------------------
  // Indent guides
  // -------------------------------------------------------------------------

  describe('indent guides', () => {
    function guidesFor(name: string) {
      return screen
        .getByText(name)
        .closest('[role="treeitem"]')!
        .querySelectorAll('[data-ov-guide]');
    }

    it('retains mid, last, and pass-through elbows in connectors mode', () => {
      renderWithTheme(
        <TestTree
          defaultExpandedKeys={new Set(['/src', '/src/components'])}
          indentGuide="connectors"
        />,
      );

      expect(guidesFor('components')).toHaveLength(1);
      expect(guidesFor('App.tsx')[0]).toHaveAttribute('data-ov-segment', 'pass');
      expect(guidesFor('App.tsx')[1]).toHaveAttribute('data-ov-connector', 'mid');
      expect(guidesFor('Header.tsx')[1]).toHaveAttribute('data-ov-connector', 'last');
      expect(guidesFor('index.ts')[0]).toHaveAttribute('data-ov-connector', 'last');
    });

    it('renders full-height and center-terminated rail segments without elbows', () => {
      renderWithTheme(
        <TestTree defaultExpandedKeys={new Set(['/src', '/src/components'])} indentGuide="rail" />,
      );

      const appGuides = guidesFor('App.tsx');
      expect(appGuides).toHaveLength(2);
      expect(appGuides[0]).toHaveAttribute('data-ov-guide', 'rail');
      expect(appGuides[0]).toHaveAttribute('data-ov-segment', 'pass');
      expect(appGuides[1]).toHaveAttribute('data-ov-segment', 'mid');
      expect(guidesFor('Header.tsx')[1]).toHaveAttribute('data-ov-segment', 'last');
      expect(guidesFor('index.ts')[0]).toHaveAttribute('data-ov-segment', 'last');
      expect(screen.getByRole('tree').querySelector('[data-ov-connector]')).toBeNull();
    });

    it('continues rail ancestors at multiple depths and stops after their final children', () => {
      const nested: FileItem[] = [
        {
          path: '/root',
          name: 'root',
          type: 'directory',
          children: [
            {
              path: '/branch',
              name: 'branch',
              type: 'directory',
              children: [
                {
                  path: '/nested',
                  name: 'nested',
                  type: 'directory',
                  children: [{ path: '/leaf', name: 'leaf', type: 'file' }],
                },
                { path: '/branch-last', name: 'branch-last', type: 'file' },
              ],
            },
            {
              path: '/last-branch',
              name: 'last-branch',
              type: 'directory',
              children: [{ path: '/last-leaf', name: 'last-leaf', type: 'file' }],
            },
          ],
        },
      ];
      renderWithTheme(
        <TestTree
          items={nested}
          defaultExpandedKeys={new Set(['/root', '/branch', '/nested', '/last-branch'])}
          indentGuide="rail"
        />,
      );

      expect(
        Array.from(guidesFor('leaf'), (guide) => guide.getAttribute('data-ov-segment')),
      ).toEqual(['pass', 'pass', 'last']);
      const lastGuides = guidesFor('last-leaf');
      expect(lastGuides).toHaveLength(2);
      expect(lastGuides[0]).not.toHaveAttribute('data-ov-segment');
      expect(lastGuides[1]).toHaveAttribute('data-ov-segment', 'last');
    });

    it.each(['rail', 'connectors'] as const)('omits %s guides at depth zero', (indentGuide) => {
      renderWithTheme(<TestTree indentGuide={indentGuide} />);
      expect(guidesFor('src')).toHaveLength(0);
      expect(guidesFor('README.md')).toHaveLength(0);
    });

    it.each([undefined, 'none'] as const)(
      'retains plain indentation for guide mode %s',
      (indentGuide) => {
        renderWithTheme(
          <TestTree
            defaultExpandedKeys={new Set(['/src', '/src/components'])}
            indentGuide={indentGuide}
            indentation={24}
          />,
        );
        const row = screen.getByText('App.tsx').closest('[role="treeitem"]')!;
        expect(guidesFor('App.tsx')).toHaveLength(0);
        expect(row.querySelector('[class*="ItemIndent"]')).toHaveStyle({
          '--tree-depth': '2',
          '--_ov-tree-indent': '24px',
        });
      },
    );

    it('updates rail termination when sibling order changes', () => {
      const { rerender } = renderWithTheme(
        <TestTree defaultExpandedKeys={new Set(['/src'])} indentGuide="rail" />,
      );
      expect(guidesFor('components')[0]).toHaveAttribute('data-ov-segment', 'mid');
      expect(guidesFor('index.ts')[0]).toHaveAttribute('data-ov-segment', 'last');

      rerender(
        <TestTree
          defaultExpandedKeys={new Set(['/src'])}
          indentGuide="rail"
          order={new Map([['/src', ['/src/index.ts', '/src/components']]])}
        />,
      );
      expect(guidesFor('components')[0]).toHaveAttribute('data-ov-segment', 'last');
      expect(guidesFor('index.ts')[0]).toHaveAttribute('data-ov-segment', 'mid');
    });

    it('terminates rails at the final matching child when filtering', () => {
      renderWithTheme(<TestTree indentGuide="rail" filterText="App.tsx" />);

      expect(screen.queryByText('Header.tsx')).not.toBeInTheDocument();
      expect(screen.queryByText('index.ts')).not.toBeInTheDocument();
      expect(guidesFor('components')[0]).toHaveAttribute('data-ov-segment', 'last');
      const appGuides = guidesFor('App.tsx');
      expect(appGuides[0]).not.toHaveAttribute('data-ov-segment');
      expect(appGuides[1]).toHaveAttribute('data-ov-segment', 'last');
    });

    it('preserves expansion and selection when changing guide modes', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithTheme(
        <TestTree indentGuide="none" defaultExpandedKeys={new Set(['/src'])} />,
      );
      await user.click(screen.getByText('components'));
      expect(screen.getByText('components').closest('[role="treeitem"]')).toHaveAttribute(
        'aria-selected',
        'true',
      );

      rerender(<TestTree indentGuide="rail" defaultExpandedKeys={new Set(['/src'])} />);
      expect(guidesFor('components')[0]).toHaveAttribute('data-ov-guide', 'rail');
      expect(screen.getByText('components').closest('[role="treeitem"]')).toHaveAttribute(
        'aria-selected',
        'true',
      );

      rerender(<TestTree indentGuide="connectors" defaultExpandedKeys={new Set(['/src'])} />);
      expect(guidesFor('components')[0]).toHaveAttribute('data-ov-connector', 'mid');
      expect(screen.getByText('src').closest('[role="treeitem"]')).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });
  });

  // -------------------------------------------------------------------------
  // Ordering
  // -------------------------------------------------------------------------

  describe('ordering', () => {
    it('orders root and nested siblings', () => {
      const order: TreeOrder = new Map([
        [null, ['/README.md', '/src']],
        ['/src', ['/src/index.ts', '/src/components']],
      ]);

      renderWithTheme(<TestTree order={order} defaultExpandedKeys={new Set(['/src'])} />);

      expect(screen.getAllByRole('treeitem').map((item) => item.textContent)).toEqual([
        'README.md',
        'src',
        'index.ts',
        'components',
      ]);
    });

    it('appends source siblings missing from an order entry', () => {
      const order: TreeOrder = new Map([[null, ['/README.md']]]);

      renderWithTheme(<TestTree defaultOrder={order} />);

      expect(screen.getAllByRole('treeitem').map((item) => item.textContent)).toEqual([
        'README.md',
        'src',
      ]);
    });

    it('uses replacement controlled order props', () => {
      const initial: TreeOrder = new Map([[null, ['/README.md', '/src']]]);
      const replacement: TreeOrder = new Map([[null, ['/src', '/README.md']]]);
      const { rerender } = renderWithTheme(<TestTree order={initial} />);

      expect(screen.getAllByRole('treeitem').map((item) => item.textContent)).toEqual([
        'README.md',
        'src',
      ]);

      rerender(<TestTree order={replacement} />);

      expect(screen.getAllByRole('treeitem').map((item) => item.textContent)).toEqual([
        'src',
        'README.md',
      ]);
    });

    it('preserves sibling order and last-child metadata while filtering', () => {
      const order: TreeOrder = new Map([
        ['/src/components', ['/src/components/Header.tsx', '/src/components/App.tsx']],
      ]);
      const renderItemWithLastChild = (item: FileItem, node: TreeNodeMeta) => (
        <TreeList.Item
          itemKey={node.key}
          textValue={item.name}
          data-testid={`ordered-${item.name}`}
          data-last-child={node.isLastChild ? 'true' : 'false'}
        >
          <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
        </TreeList.Item>
      );

      renderWithTheme(
        <TestTree order={order} filterText=".tsx" renderItem={renderItemWithLastChild} />,
      );

      expect(screen.getAllByRole('treeitem').map((item) => item.textContent)).toEqual([
        'src',
        'components',
        'Header.tsx',
        'App.tsx',
      ]);
      expect(screen.getByTestId('ordered-Header.tsx')).toHaveAttribute('data-last-child', 'false');
      expect(screen.getByTestId('ordered-App.tsx')).toHaveAttribute('data-last-child', 'true');
    });
  });

  // -------------------------------------------------------------------------
  // Reordering
  // -------------------------------------------------------------------------

  describe('reordering', () => {
    it('reorders uncontrolled siblings with the keyboard and reports move metadata', async () => {
      supportKeyboardDraggingInJSDOM();
      const user = userEvent.setup();
      const onOrderChange = vi.fn();
      renderWithTheme(
        <TestTree reorderable renderItem={renderReorderableItem} onOrderChange={onOrderChange} />,
      );
      giveTreeRowsVerticalGeometry();

      screen.getByRole('button', { name: 'Reorder src' }).focus();
      await user.keyboard('[Space][ArrowDown][Space]');

      expect(screen.getAllByRole('treeitem').map((item) => item.textContent)).toEqual([
        '⋮⋮README.md',
        '⋮⋮src',
      ]);
      expect(onOrderChange).toHaveBeenCalledTimes(1);
      expect(onOrderChange.mock.calls[0]?.[1]).toEqual({
        activeKey: '/src',
        overKey: '/README.md',
        parentKey: null,
        fromIndex: 0,
        toIndex: 1,
      });
    });

    it('retains uncontrolled sibling order when edit mode exits and reenters without order props', async () => {
      supportKeyboardDraggingInJSDOM();
      const user = userEvent.setup();
      const { rerender } = renderWithTheme(<TestTree />);
      rerender(<TestTree reorderable renderItem={renderReorderableItem} />);
      giveTreeRowsVerticalGeometry();
      screen.getByRole('button', { name: 'Reorder src' }).focus();
      await user.keyboard('[Space][ArrowDown][Space]');
      expect(screen.getAllByRole('treeitem').map((item) => item.textContent)).toEqual([
        '⋮⋮README.md',
        '⋮⋮src',
      ]);

      rerender(<TestTree />);
      expect(screen.getAllByRole('treeitem').map((item) => item.textContent)).toEqual([
        'README.md',
        'src',
      ]);
      expect(screen.queryByRole('button', { name: /reorder/i })).not.toBeInTheDocument();
      for (const row of screen.getAllByRole('treeitem')) {
        expect(row).not.toHaveAttribute('data-ov-reorderable');
      }

      rerender(<TestTree reorderable renderItem={renderReorderableItem} />);
      expect(screen.getAllByRole('treeitem').map((item) => item.textContent)).toEqual([
        '⋮⋮README.md',
        '⋮⋮src',
      ]);
      giveTreeRowsVerticalGeometry();
      screen.getByRole('button', { name: 'Reorder README.md' }).focus();
      await user.keyboard('[Space][ArrowDown][Space]');
      expect(screen.getAllByRole('treeitem').map((item) => item.textContent)).toEqual([
        '⋮⋮src',
        '⋮⋮README.md',
      ]);
    });

    it('preserves uncontrolled reorder state while showing and recovering from an error', async () => {
      supportKeyboardDraggingInJSDOM();
      const user = userEvent.setup();
      const onOrderChange = vi.fn();
      const { rerender } = renderWithTheme(
        <TestTree reorderable renderItem={renderReorderableItem} onOrderChange={onOrderChange} />,
      );
      giveTreeRowsVerticalGeometry();
      screen.getByRole('button', { name: 'Reorder src' }).focus();
      await user.keyboard('[Space][ArrowDown][Space]');
      expect(screen.getAllByRole('treeitem').map((item) => item.textContent)).toEqual([
        '⋮⋮README.md',
        '⋮⋮src',
      ]);
      const tree = screen.getByRole('tree');

      rerender(
        <TestTree
          reorderable
          renderItem={renderReorderableItem}
          onOrderChange={onOrderChange}
          error="Unable to refresh files"
        />,
      );
      expect(screen.getByText('Unable to refresh files')).toBeInTheDocument();
      expect(screen.queryByRole('treeitem')).not.toBeInTheDocument();
      expect(screen.getByRole('tree')).toBe(tree);

      rerender(
        <TestTree reorderable renderItem={renderReorderableItem} onOrderChange={onOrderChange} />,
      );
      expect(screen.getAllByRole('treeitem').map((item) => item.textContent)).toEqual([
        '⋮⋮README.md',
        '⋮⋮src',
      ]);
      expect(onOrderChange).toHaveBeenCalledOnce();

      giveTreeRowsVerticalGeometry();
      screen.getByRole('button', { name: 'Reorder README.md' }).focus();
      await user.keyboard('[Space][ArrowDown][Space]');
      expect(screen.getAllByRole('treeitem').map((item) => item.textContent)).toEqual([
        '⋮⋮src',
        '⋮⋮README.md',
      ]);
      expect(onOrderChange).toHaveBeenCalledTimes(2);
      expect(onOrderChange.mock.calls[1]?.[1]).toEqual({
        activeKey: '/README.md',
        overKey: '/src',
        parentKey: null,
        fromIndex: 0,
        toIndex: 1,
      });
    });

    it('emits a controlled reorder without changing rendering until rerender', async () => {
      supportKeyboardDraggingInJSDOM();
      const user = userEvent.setup();
      const onOrderChange = vi.fn();
      const initialOrder: TreeOrder = new Map([[null, ['/src', '/README.md']]]);
      const { rerender } = renderWithTheme(
        <TestTree
          reorderable
          order={initialOrder}
          renderItem={renderReorderableItem}
          onOrderChange={onOrderChange}
        />,
      );

      giveTreeRowsVerticalGeometry();
      screen.getByRole('button', { name: 'Reorder src' }).focus();
      await user.keyboard('[Space][ArrowDown][Space]');

      expect(screen.getAllByRole('treeitem').map((item) => item.textContent)).toEqual([
        '⋮⋮src',
        '⋮⋮README.md',
      ]);
      expect(onOrderChange).toHaveBeenCalledTimes(1);

      const nextOrder = onOrderChange.mock.calls[0]?.[0] as TreeOrder;
      rerender(
        <TestTree
          reorderable
          order={nextOrder}
          renderItem={renderReorderableItem}
          onOrderChange={onOrderChange}
        />,
      );
      expect(screen.getAllByRole('treeitem').map((item) => item.textContent)).toEqual([
        '⋮⋮README.md',
        '⋮⋮src',
      ]);
    });

    it.each(['root', 'item'] as const)(
      'keeps a %s-disabled sibling measurable as a rejected reorder target',
      async (disabledAt) => {
        supportKeyboardDraggingInJSDOM();
        const user = userEvent.setup();
        const onOrderChange = vi.fn();
        const siblingData: FileItem[] = [
          { path: '/a', name: 'a', type: 'file' },
          { path: '/b', name: 'b', type: 'file' },
          { path: '/c', name: 'c', type: 'file' },
        ];
        renderWithTheme(
          <TestTree
            items={siblingData}
            reorderable
            disabledKeys={disabledAt === 'root' ? ['/b'] : undefined}
            renderItem={(item, node) => (
              <TreeList.ReorderableItem
                itemKey={node.key}
                disabled={disabledAt === 'item' && node.key === '/b'}
              >
                <TreeList.ItemDragHandle aria-label={`Reorder ${item.name}`}>
                  ⋮⋮
                </TreeList.ItemDragHandle>
                <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
              </TreeList.ReorderableItem>
            )}
            onOrderChange={onOrderChange}
          />,
        );
        giveTreeRowsVerticalGeometry();

        expect(screen.getByRole('button', { name: 'Reorder b' })).toBeDisabled();
        screen.getByRole('button', { name: 'Reorder a' }).focus();
        await user.keyboard('[Space]');
        await user.keyboard('[ArrowDown]');
        expect(document.body).toHaveTextContent(
          'Draggable item /a was moved over droppable area /b.',
        );
        await user.keyboard('[Space]');

        expect(onOrderChange).not.toHaveBeenCalled();
        expect(screen.getAllByRole('treeitem').map((item) => item.textContent)).toEqual([
          '⋮⋮a',
          '⋮⋮b',
          '⋮⋮c',
        ]);
      },
    );

    it.each([false, true])(
      'preserves uncontrolled state and focus on edit toggle with order props: %s',
      async (hasOrder) => {
        const user = userEvent.setup();
        const defaultOrder: TreeOrder | undefined = hasOrder ? new Map() : undefined;
        const renderEditingItem = (item: FileItem, node: TreeNodeMeta) => (
          <TreeList.ReorderableItem itemKey={node.key}>
            <TreeList.ItemDragHandle aria-label={`Reorder ${item.name}`}>
              ⋮⋮
            </TreeList.ItemDragHandle>
            <TreeList.ItemToggle itemKey={node.key} />
            <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
          </TreeList.ReorderableItem>
        );
        const { rerender } = renderWithTheme(<TestTree defaultOrder={defaultOrder} />);

        await user.click(screen.getByRole('button', { name: 'Expand' }));
        await user.click(screen.getByText('index.ts'));
        const tree = screen.getByRole('tree');
        tree.focus();

        expect(screen.getByText('index.ts').closest('[role="treeitem"]')).toHaveAttribute(
          'aria-selected',
          'true',
        );
        expect(tree).toHaveFocus();

        rerender(
          <TestTree reorderable defaultOrder={defaultOrder} renderItem={renderEditingItem} />,
        );

        expect(screen.getByRole('tree')).toBe(tree);
        expect(tree).toHaveFocus();
        expect(screen.getByText('src').closest('[role="treeitem"]')).toHaveAttribute(
          'aria-expanded',
          'true',
        );
        expect(screen.getByText('index.ts').closest('[role="treeitem"]')).toHaveAttribute(
          'aria-selected',
          'true',
        );
        expect(screen.getByText('index.ts').closest('[role="treeitem"]')).toHaveAttribute(
          'data-ov-active',
          'true',
        );

        rerender(<TestTree defaultOrder={defaultOrder} />);
        expect(screen.getByRole('tree')).toBe(tree);
        expect(tree).toHaveFocus();
        expect(screen.getByText('index.ts').closest('[role="treeitem"]')).toHaveAttribute(
          'aria-selected',
          'true',
        );
        expect(screen.getByText('src').closest('[role="treeitem"]')).toHaveAttribute(
          'aria-expanded',
          'true',
        );
        expect(screen.getByText('index.ts').closest('[role="treeitem"]')).toHaveAttribute(
          'data-ov-active',
          'true',
        );
      },
    );

    it.each([null, 'parent'])(
      'preserves hidden saved sibling order in group %s after filter → reorder → clear',
      async (parentKey) => {
        supportKeyboardDraggingInJSDOM();
        const user = userEvent.setup();
        const onOrderChange = vi.fn();
        const siblings: FileItem[] = [
          { path: 'a', name: 'shown A', type: 'file' },
          { path: 'b', name: 'shown B', type: 'file' },
          { path: 'c', name: 'hidden C', type: 'file' },
          { path: 'd', name: 'hidden D', type: 'file' },
        ];
        const props = {
          items:
            parentKey === null
              ? siblings
              : [
                  {
                    path: parentKey,
                    name: 'parent',
                    type: 'directory' as const,
                    children: siblings,
                  },
                ],
          defaultExpandedKeys: new Set(parentKey === null ? [] : [parentKey]),
          reorderable: true,
          defaultOrder: new Map([[parentKey, ['d', 'a', 'c', 'b']]]),
          renderItem: renderReorderableItem,
          onOrderChange,
        };
        const { rerender } = renderWithTheme(<TestTree {...props} filterText="shown" />);
        giveTreeRowsVerticalGeometry();
        screen.getByRole('button', { name: 'Reorder shown A' }).focus();
        await user.keyboard('[Enter][ArrowDown][Space]');
        expect(onOrderChange).toHaveBeenCalledOnce();
        expect(onOrderChange.mock.calls[0]![0].get(parentKey)).toEqual(['d', 'c', 'b', 'a']);
        rerender(<TestTree {...props} filterText="" />);
        expect(
          screen
            .getAllByRole('treeitem')
            .filter((row) => row.textContent !== '⋮⋮parent')
            .map((row) => row.textContent),
        ).toEqual(['⋮⋮hidden D', '⋮⋮hidden C', '⋮⋮shown B', '⋮⋮shown A']);
      },
    );

    it('keeps handle drag keys out of the public row key handler', async () => {
      supportKeyboardDraggingInJSDOM();
      const user = userEvent.setup();
      const onOrderChange = vi.fn();
      const onRowKeyDown = vi.fn();
      const renderItemWithRowKeyHandler = (item: FileItem, node: TreeNodeMeta) => (
        <TreeList.ReorderableItem itemKey={node.key} textValue={item.name} onKeyDown={onRowKeyDown}>
          <TreeList.ItemDragHandle aria-label={`Reorder ${item.name}`}>⋮⋮</TreeList.ItemDragHandle>
          <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
        </TreeList.ReorderableItem>
      );
      renderWithTheme(
        <TestTree
          reorderable
          renderItem={renderItemWithRowKeyHandler}
          onOrderChange={onOrderChange}
        />,
      );
      giveTreeRowsVerticalGeometry();

      screen.getByRole('button', { name: 'Reorder src' }).focus();
      await user.keyboard('[Enter][ArrowDown][Space]');

      expect(onRowKeyDown).not.toHaveBeenCalled();
      expect(onOrderChange).toHaveBeenCalledOnce();

      fireEvent.keyDown(screen.getByText('src').closest('[role="treeitem"]')!, {
        key: 'Enter',
      });
      expect(onRowKeyDown).toHaveBeenCalledOnce();
    });

    it('rejects cross-parent, disabled, self, invalid, and cancelled reorder drops', () => {
      const proposeMove = vi.fn();
      const nodeMeta = new Map<Key, TreeNodeMeta>([
        [
          '/src',
          {
            key: '/src',
            depth: 0,
            parentKey: null,
            isBranch: true,
            isExpanded: true,
            isLoading: false,
            isLastChild: false,
            ancestorIsLast: [],
          },
        ],
        [
          '/README.md',
          {
            key: '/README.md',
            depth: 0,
            parentKey: null,
            isBranch: false,
            isExpanded: false,
            isLoading: false,
            isLastChild: true,
            ancestorIsLast: [],
          },
        ],
        [
          '/src/index.ts',
          {
            key: '/src/index.ts',
            depth: 1,
            parentKey: '/src',
            isBranch: false,
            isExpanded: false,
            isLoading: false,
            isLastChild: true,
            ancestorIsLast: [false],
          },
        ],
      ]);
      const baseOptions = {
        visibleKeys: ['/src', '/src/index.ts', '/README.md'] as const,
        disabledKeys: new Set<Key>(),
        getNodeMeta: (key: Key) => nodeMeta.get(key),
        getSiblingKeys: () => ['/src', '/README.md'],
        proposeMove,
      };

      handleTreeDragEnd(dragEndEvent('/src', '/src/index.ts'), baseOptions);
      handleTreeDragEnd(dragEndEvent('/src', '/src'), baseOptions);
      handleTreeDragEnd(dragEndEvent('/missing', '/README.md'), baseOptions);
      handleTreeDragEnd(dragEndEvent('/src', null), baseOptions);
      handleTreeDragEnd(dragEndEvent('/src', '/README.md'), {
        ...baseOptions,
        disabledKeys: new Set<Key>(['/README.md']),
      });
      handleTreeDragEnd(dragEndEvent('/src', '/README.md'), {
        ...baseOptions,
        disabledKeys: new Set<Key>(['/src']),
      });

      expect(proposeMove).not.toHaveBeenCalled();
    });

    it('proposes one reorder for a valid same-parent drop using complete resolved siblings', () => {
      const proposeMove = vi.fn();
      const nodeMeta = new Map<Key, TreeNodeMeta>([
        [
          '/src',
          {
            key: '/src',
            depth: 0,
            parentKey: null,
            isBranch: true,
            isExpanded: true,
            isLoading: false,
            isLastChild: false,
            ancestorIsLast: [],
          },
        ],
        [
          '/src/index.ts',
          {
            key: '/src/index.ts',
            depth: 1,
            parentKey: '/src',
            isBranch: false,
            isExpanded: false,
            isLoading: false,
            isLastChild: true,
            ancestorIsLast: [false],
          },
        ],
        [
          '/README.md',
          {
            key: '/README.md',
            depth: 0,
            parentKey: null,
            isBranch: false,
            isExpanded: false,
            isLoading: false,
            isLastChild: true,
            ancestorIsLast: [],
          },
        ],
      ]);

      handleTreeDragEnd(dragEndEvent('/src', '/README.md'), {
        visibleKeys: ['/src', '/src/index.ts', '/README.md'],
        disabledKeys: new Set(),
        getNodeMeta: (key) => nodeMeta.get(key),
        getSiblingKeys: () => ['/hidden', '/src', '/README.md'],
        proposeMove,
      });

      expect(proposeMove).toHaveBeenCalledOnce();
      expect(proposeMove).toHaveBeenCalledWith(
        ['/hidden', '/src', '/README.md'],
        null,
        '/src',
        '/README.md',
      );
    });

    it('keeps drag-handle pointer and keyboard events from activating or selecting rows', async () => {
      const user = userEvent.setup();
      const onActiveKeyChange = vi.fn();
      const onSelectedKeysChange = vi.fn();
      renderWithTheme(
        <TestTree
          reorderable
          renderItem={renderReorderableItem}
          defaultActiveKey="/src"
          onActiveKeyChange={onActiveKeyChange}
          onSelectedKeysChange={onSelectedKeysChange}
        />,
      );
      const handle = screen.getByRole('button', { name: 'Reorder README.md' });

      await user.click(handle);
      fireEvent.keyDown(handle, { key: 'Enter' });

      expect(onActiveKeyChange).not.toHaveBeenCalled();
      expect(onSelectedKeysChange).not.toHaveBeenCalled();
      expect(screen.getByText('src').closest('[role="treeitem"]')).toHaveAttribute(
        'data-ov-active',
        'true',
      );
    });

    it('keeps static items free of drag handles, sortable attributes, and wrappers', () => {
      renderWithTheme(<TestTree reorderable />);

      expect(screen.queryByRole('button', { name: /reorder/i })).not.toBeInTheDocument();
      const viewport = screen.getByTestId('tree-viewport');
      const rows = screen.getAllByRole('treeitem');
      expect([...viewport.children]).toEqual(rows);
      for (const row of rows) {
        expect(row).not.toHaveAttribute('data-ov-dragging');
        expect(row).not.toHaveAttribute('data-ov-reorderable');
        expect(row).not.toHaveAttribute('aria-roledescription');
        expect(row).not.toHaveStyle({ transform: expect.any(String) });
      }
    });
  });

  // -------------------------------------------------------------------------
  // Filtering
  // -------------------------------------------------------------------------

  describe('filtering', () => {
    it('filters items by text using getTextValue', () => {
      renderWithTheme(
        <TestTree defaultExpandedKeys={new Set(['/src', '/src/components'])} filterText="App" />,
      );

      // App.tsx matches — should be visible
      expect(screen.getByText('App.tsx')).toBeInTheDocument();
      // Header.tsx does not match — should not be visible
      expect(screen.queryByText('Header.tsx')).not.toBeInTheDocument();
      // src and components are ancestor branches — should be visible
      expect(screen.getByText('src')).toBeInTheDocument();
      expect(screen.getByText('components')).toBeInTheDocument();
    });

    it('shows ancestor branches for deeply nested matches', () => {
      renderWithTheme(<TestTree filterText="App" />);

      // Even without defaultExpandedKeys, filtering auto-expands to show App.tsx
      expect(screen.getByText('App.tsx')).toBeInTheDocument();
      expect(screen.getByText('components')).toBeInTheDocument();
      expect(screen.getByText('src')).toBeInTheDocument();
    });

    it('hides branches with no matching descendants', () => {
      renderWithTheme(<TestTree filterText="README" />);

      // README.md is a root-level file — should be visible
      expect(screen.getByText('README.md')).toBeInTheDocument();
      // /src has no matching items — should not be visible
      expect(screen.queryByText('src')).not.toBeInTheDocument();
    });

    it('shows empty state when nothing matches', () => {
      renderWithTheme(
        <TreeList.Root
          items={treeData}
          itemKey={(item: FileItem) => item.path}
          getChildren={(item: FileItem) => item.children}
          isBranch={(item: FileItem) => item.type === 'directory'}
          getTextValue={(item: FileItem) => item.name}
          renderItem={renderItem}
          filterText="zzz_no_match"
        >
          <TreeList.Viewport />
          <TreeList.Empty>No results</TreeList.Empty>
        </TreeList.Root>,
      );

      expect(screen.queryByRole('treeitem')).not.toBeInTheDocument();
      expect(screen.getByText('No results')).toBeInTheDocument();
    });

    it('is case-insensitive by default', () => {
      renderWithTheme(<TestTree filterText="app" />);

      expect(screen.getByText('App.tsx')).toBeInTheDocument();
    });

    it('supports custom filterFn', () => {
      const customFilter = (item: FileItem, text: string) => item.path.endsWith(text);

      renderWithTheme(<TestTree filterText=".md" filterFn={customFilter} />);

      expect(screen.getByText('README.md')).toBeInTheDocument();
      expect(screen.queryByText('src')).not.toBeInTheDocument();
    });

    it('uses controlled filterText', () => {
      const onChange = vi.fn();
      renderWithTheme(<TestTree filterText="Header" onFilterTextChange={onChange} />);

      // Only Header.tsx and its ancestors should be visible
      expect(screen.getByText('Header.tsx')).toBeInTheDocument();
      expect(screen.queryByText('App.tsx')).not.toBeInTheDocument();
    });

    it('uses uncontrolled defaultFilterText', () => {
      renderWithTheme(<TestTree defaultFilterText="index" />);

      expect(screen.getByText('index.ts')).toBeInTheDocument();
      expect(screen.queryByText('App.tsx')).not.toBeInTheDocument();
    });

    it('shows all items when filterText is empty', () => {
      renderWithTheme(<TestTree filterText="" defaultExpandedKeys={new Set(['/src'])} />);

      // All root items visible
      expect(screen.getByText('src')).toBeInTheDocument();
      expect(screen.getByText('README.md')).toBeInTheDocument();
      // Expanded children visible
      expect(screen.getByText('components')).toBeInTheDocument();
      expect(screen.getByText('index.ts')).toBeInTheDocument();
    });

    it('does not filter when no getTextValue and no filterFn provided', () => {
      renderWithTheme(
        <TreeList.Root
          items={treeData}
          itemKey={(item: FileItem) => item.path}
          getChildren={(item: FileItem) => item.children}
          isBranch={(item: FileItem) => item.type === 'directory'}
          renderItem={renderItem}
          filterText="App"
          defaultExpandedKeys={new Set(['/src', '/src/components'])}
        >
          <TreeList.Viewport />
        </TreeList.Root>,
      );

      // Without getTextValue, filterFn is undefined, so filtering is a no-op
      expect(screen.getByText('App.tsx')).toBeInTheDocument();
      expect(screen.getByText('Header.tsx')).toBeInTheDocument();
      expect(screen.getByText('README.md')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Async loading
  // -------------------------------------------------------------------------

  it('calls loadChildren when expanding a branch with no children', async () => {
    const user = userEvent.setup();
    const loadChildren = vi.fn().mockResolvedValue(undefined);

    // children: undefined means "not yet loaded" → triggers loadChildren
    const lazyData: FileItem[] = [
      {
        path: '/lazy',
        name: 'lazy',
        type: 'directory',
        // children intentionally omitted (undefined = not yet loaded)
      },
    ];

    renderWithTheme(<TestTree items={lazyData} loadChildren={loadChildren} />);

    const toggle = screen.getByRole('button', { name: /expand/i });
    await user.click(toggle);

    expect(loadChildren).toHaveBeenCalledWith('/lazy', expect.objectContaining({ path: '/lazy' }));
  });

  it('shows children after async load and re-render', async () => {
    const user = userEvent.setup();

    // children: undefined means "not yet loaded" → triggers loadChildren
    const lazyData: FileItem[] = [
      {
        path: '/lazy',
        name: 'lazy',
        type: 'directory',
      },
    ];

    const withChildren: FileItem[] = [
      {
        path: '/lazy',
        name: 'lazy',
        type: 'directory',
        children: [{ path: '/lazy/child.ts', name: 'child.ts', type: 'file' }],
      },
    ];

    const { rerender } = renderWithTheme(
      <TestTree items={lazyData} loadChildren={async () => {}} />,
    );

    const toggle = screen.getByRole('button', { name: /expand/i });
    await user.click(toggle);

    // Re-render with children populated (simulating state update from loadChildren)
    rerender(
      <TestTree
        items={withChildren}
        loadChildren={async () => {}}
        expandedKeys={new Set(['/lazy'])}
      />,
    );

    expect(screen.getByText('child.ts')).toBeInTheDocument();
  });

  it('renderItem receives node.isLoading=true while loadChildren is pending', async () => {
    const user = userEvent.setup();
    let resolveLoad!: () => void;
    const loadPromise = new Promise<void>((r) => {
      resolveLoad = r;
    });
    const loadChildren = vi.fn().mockReturnValue(loadPromise);
    const renderItemSpy = vi.fn(renderItem);

    const lazyData: FileItem[] = [{ path: '/lazy', name: 'lazy', type: 'directory' }];

    renderWithTheme(
      <TestTree items={lazyData} loadChildren={loadChildren} renderItem={renderItemSpy} />,
    );

    const toggle = screen.getByRole('button', { name: /expand/i });
    await user.click(toggle);

    // While the promise is pending, renderItem should see isLoading=true
    await vi.waitFor(() => {
      const lastCall = renderItemSpy.mock.calls[renderItemSpy.mock.calls.length - 1];
      expect(lastCall).toBeDefined();
      const nodeMeta = lastCall![1] as TreeNodeMeta;
      expect(nodeMeta.isLoading).toBe(true);
    });

    await act(async () => {
      resolveLoad();
      await loadPromise;
    });
  });

  it('calls onLoadError when loadChildren rejects', async () => {
    const user = userEvent.setup();
    const error = new Error('network failure');
    const loadChildren = vi.fn().mockRejectedValue(error);
    const onLoadError = vi.fn();

    const lazyData: FileItem[] = [{ path: '/lazy', name: 'lazy', type: 'directory' }];

    renderWithTheme(
      <TestTree items={lazyData} loadChildren={loadChildren} onLoadError={onLoadError} />,
    );

    const toggle = screen.getByRole('button', { name: /expand/i });
    await user.click(toggle);

    // Wait for the rejection to be handled
    await vi.waitFor(() => {
      expect(onLoadError).toHaveBeenCalledWith(
        error,
        '/lazy',
        expect.objectContaining({ path: '/lazy' }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Empty / Loading states
  // -------------------------------------------------------------------------

  it('renders empty state', () => {
    renderWithTheme(
      <TreeList.Root
        items={[] as FileItem[]}
        itemKey={(item: FileItem) => item.path}
        getChildren={(item: FileItem) => item.children}
        renderItem={renderItem}
      >
        <TreeList.Viewport />
        <TreeList.Empty>No items</TreeList.Empty>
      </TreeList.Root>,
    );
    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    renderWithTheme(
      <TreeList.Root
        items={[] as FileItem[]}
        itemKey={(item: FileItem) => item.path}
        getChildren={(item: FileItem) => item.children}
        renderItem={renderItem}
        loading
      >
        <TreeList.Viewport />
        <TreeList.Loading>Loading items...</TreeList.Loading>
      </TreeList.Root>,
    );
    expect(screen.getByText('Loading items...')).toBeInTheDocument();
  });
});
