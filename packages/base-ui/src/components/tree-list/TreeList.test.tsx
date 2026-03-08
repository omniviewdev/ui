import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { TreeList } from './TreeList';
import type { TreeNodeMeta, TreeListRootProps } from './types';

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
      <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
      <TreeList.ItemToggle itemKey={node.key} />
      <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
    </TreeList.Item>
  );
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
    renderWithTheme(
      <TestTree defaultExpandedKeys={new Set(['/src', '/src/components'])} />,
    );
    expect(screen.getByText('App.tsx')).toBeInTheDocument();
    expect(screen.getByText('Header.tsx')).toBeInTheDocument();
  });

  it('supports controlled expandedKeys', () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TestTree expandedKeys={new Set(['/src'])} onExpandedKeysChange={onChange} />,
    );
    expect(screen.getByText('index.ts')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Selection
  // -------------------------------------------------------------------------

  it('selects an item on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(
      <TestTree selectionMode="single" onSelectedKeysChange={onChange} />,
    );

    await user.click(screen.getByText('README.md'));
    expect(onChange).toHaveBeenCalledWith(new Set(['/README.md']));
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

    renderWithTheme(
      <TestTree selectionMode="multiple" onSelectedKeysChange={onChange} />,
    );

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
      <TestTree
        defaultExpandedKeys={new Set(['/src'])}
        disabledKeys={['/src/components']}
      />,
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

    renderWithTheme(
      <TestTree selectionMode="single" onSelectedKeysChange={onChange} />,
    );

    const tree = screen.getByRole('tree');
    tree.focus();

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(new Set(['/src']));
  });

  it('selects all with Ctrl+A in multiple mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(
      <TestTree selectionMode="multiple" onSelectedKeysChange={onChange} />,
    );

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

    renderWithTheme(
      <TestTree disabledKeys={['/README.md']} />,
    );

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
    fireEvent.click(readme);
    expect(onChange).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Indentation
  // -------------------------------------------------------------------------

  it('sets --tree-depth CSS variable on ItemIndent', () => {
    renderWithTheme(
      <TestTree defaultExpandedKeys={new Set(['/src'])} />,
    );

    // /src is depth 0, components is depth 1
    const src = screen.getByText('src').closest('[role="treeitem"]');
    const srcIndent = src?.querySelector('[class*="ItemIndent"]');
    expect(srcIndent).toHaveStyle({ '--tree-depth': '0' });

    const components = screen.getByText('components').closest('[role="treeitem"]');
    const compIndent = components?.querySelector('[class*="ItemIndent"]');
    expect(compIndent).toHaveStyle({ '--tree-depth': '1' });
  });

  // -------------------------------------------------------------------------
  // Branch connectors
  // -------------------------------------------------------------------------

  describe('branch connectors', () => {
    function renderItemWithConnectors(item: FileItem, node: TreeNodeMeta) {
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

    it('renders guide segments when showBranchConnectors is enabled', () => {
      renderWithTheme(
        <TestTree
          defaultExpandedKeys={new Set(['/src', '/src/components'])}
          showBranchConnectors
          renderItem={renderItemWithConnectors}
        />,
      );

      // depth-1 item: should have 1 guide segment
      const components = screen.getByText('components').closest('[role="treeitem"]')!;
      const compIndent = components.querySelector('[class*="ItemIndent"]')!;
      expect(compIndent).toHaveAttribute('data-ov-guides');
      const compGuides = compIndent.querySelectorAll('[class*="ItemGuide"]');
      expect(compGuides).toHaveLength(1);
    });

    it('renders mid connector for non-last children', () => {
      renderWithTheme(
        <TestTree
          defaultExpandedKeys={new Set(['/src', '/src/components'])}
          showBranchConnectors
          renderItem={renderItemWithConnectors}
        />,
      );

      // App.tsx is NOT the last child of components → mid connector at column 1
      const appItem = screen.getByText('App.tsx').closest('[role="treeitem"]')!;
      const appGuides = appItem.querySelectorAll('[class*="ItemGuide"]');
      expect(appGuides).toHaveLength(2); // depth 2 = 2 guides

      // Column 1 (last) should be a mid connector
      expect(appGuides[1]).toHaveAttribute('data-ov-connector', 'mid');
    });

    it('renders last connector for last children', () => {
      renderWithTheme(
        <TestTree
          defaultExpandedKeys={new Set(['/src', '/src/components'])}
          showBranchConnectors
          renderItem={renderItemWithConnectors}
        />,
      );

      // Header.tsx is the last child of components → last connector at column 1
      const headerItem = screen.getByText('Header.tsx').closest('[role="treeitem"]')!;
      const headerGuides = headerItem.querySelectorAll('[class*="ItemGuide"]');
      expect(headerGuides).toHaveLength(2);
      expect(headerGuides[1]).toHaveAttribute('data-ov-connector', 'last');
    });

    it('renders vertical pass-through line when ancestor is not last', () => {
      renderWithTheme(
        <TestTree
          defaultExpandedKeys={new Set(['/src', '/src/components'])}
          showBranchConnectors
          renderItem={renderItemWithConnectors}
        />,
      );

      // App.tsx at depth 2: column 0 should show vertical line
      // because /src (depth 0) is NOT last root (README.md follows)
      const appItem = screen.getByText('App.tsx').closest('[role="treeitem"]')!;
      const appGuides = appItem.querySelectorAll('[class*="ItemGuide"]');
      expect(appGuides[0]).toHaveAttribute('data-ov-line');
    });

    it('does not render vertical line when ancestor is last', () => {
      // Use data where the root is the last item so ancestorIsLast[0] = true
      const singleRoot: FileItem[] = [
        {
          path: '/only',
          name: 'only',
          type: 'directory',
          children: [
            { path: '/only/child.ts', name: 'child.ts', type: 'file' },
          ],
        },
      ];

      renderWithTheme(
        <TestTree
          items={singleRoot}
          defaultExpandedKeys={new Set(['/only'])}
          showBranchConnectors
          renderItem={renderItemWithConnectors}
        />,
      );

      // child.ts at depth 1: only 1 guide (the connector), no pass-through needed
      const child = screen.getByText('child.ts').closest('[role="treeitem"]')!;
      const guides = child.querySelectorAll('[class*="ItemGuide"]');
      expect(guides).toHaveLength(1);
      // It should be a last connector (only child)
      expect(guides[0]).toHaveAttribute('data-ov-connector', 'last');
    });

    it('does not render guide segments when showBranchConnectors is false', () => {
      renderWithTheme(
        <TestTree
          defaultExpandedKeys={new Set(['/src', '/src/components'])}
          showBranchConnectors={false}
          renderItem={renderItemWithConnectors}
        />,
      );

      const appItem = screen.getByText('App.tsx').closest('[role="treeitem"]')!;
      const appIndent = appItem.querySelector('[class*="ItemIndent"]')!;
      // Should NOT have guide segments — uses simple CSS var indent instead
      expect(appIndent).not.toHaveAttribute('data-ov-guides');
      expect(appIndent.querySelectorAll('[class*="ItemGuide"]')).toHaveLength(0);
    });

    it('does not render guides for root-level items (depth 0)', () => {
      renderWithTheme(
        <TestTree
          defaultExpandedKeys={new Set(['/src'])}
          showBranchConnectors
          renderItem={renderItemWithConnectors}
        />,
      );

      // /src is depth 0 — no indent guides needed
      const src = screen.getByText('src').closest('[role="treeitem"]')!;
      const srcIndent = src.querySelector('[class*="ItemIndent"]')!;
      expect(srcIndent).not.toHaveAttribute('data-ov-guides');
    });
  });

  // -------------------------------------------------------------------------
  // Filtering
  // -------------------------------------------------------------------------

  describe('filtering', () => {
    it('filters items by text using getTextValue', () => {
      renderWithTheme(
        <TestTree
          defaultExpandedKeys={new Set(['/src', '/src/components'])}
          filterText="App"
        />,
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
      renderWithTheme(
        <TestTree filterText="App" />,
      );

      // Even without defaultExpandedKeys, filtering auto-expands to show App.tsx
      expect(screen.getByText('App.tsx')).toBeInTheDocument();
      expect(screen.getByText('components')).toBeInTheDocument();
      expect(screen.getByText('src')).toBeInTheDocument();
    });

    it('hides branches with no matching descendants', () => {
      renderWithTheme(
        <TestTree filterText="README" />,
      );

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
      renderWithTheme(
        <TestTree filterText="app" />,
      );

      expect(screen.getByText('App.tsx')).toBeInTheDocument();
    });

    it('supports custom filterFn', () => {
      const customFilter = (item: FileItem, text: string) =>
        item.path.endsWith(text);

      renderWithTheme(
        <TestTree filterText=".md" filterFn={customFilter} />,
      );

      expect(screen.getByText('README.md')).toBeInTheDocument();
      expect(screen.queryByText('src')).not.toBeInTheDocument();
    });

    it('uses controlled filterText', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <TestTree
          filterText="Header"
          onFilterTextChange={onChange}
        />,
      );

      // Only Header.tsx and its ancestors should be visible
      expect(screen.getByText('Header.tsx')).toBeInTheDocument();
      expect(screen.queryByText('App.tsx')).not.toBeInTheDocument();
    });

    it('uses uncontrolled defaultFilterText', () => {
      renderWithTheme(
        <TestTree defaultFilterText="index" />,
      );

      expect(screen.getByText('index.ts')).toBeInTheDocument();
      expect(screen.queryByText('App.tsx')).not.toBeInTheDocument();
    });

    it('shows all items when filterText is empty', () => {
      renderWithTheme(
        <TestTree
          filterText=""
          defaultExpandedKeys={new Set(['/src'])}
        />,
      );

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

    const lazyData: FileItem[] = [
      {
        path: '/lazy',
        name: 'lazy',
        type: 'directory',
        children: [],
      },
    ];

    renderWithTheme(
      <TestTree items={lazyData} loadChildren={loadChildren} />,
    );

    const toggle = screen.getByRole('button', { name: /expand/i });
    await user.click(toggle);

    expect(loadChildren).toHaveBeenCalledWith('/lazy', expect.objectContaining({ path: '/lazy' }));
  });

  it('shows children after async load and re-render', async () => {
    const user = userEvent.setup();

    const lazyData: FileItem[] = [
      {
        path: '/lazy',
        name: 'lazy',
        type: 'directory',
        children: [],
      },
    ];

    const withChildren: FileItem[] = [
      {
        path: '/lazy',
        name: 'lazy',
        type: 'directory',
        children: [
          { path: '/lazy/child.ts', name: 'child.ts', type: 'file' },
        ],
      },
    ];

    const { rerender } = renderWithTheme(
      <TestTree
        items={lazyData}
        loadChildren={async () => {}}
      />,
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

  it('calls onLoadError when loadChildren rejects', async () => {
    const user = userEvent.setup();
    const error = new Error('network failure');
    const loadChildren = vi.fn().mockRejectedValue(error);
    const onLoadError = vi.fn();

    const lazyData: FileItem[] = [
      { path: '/lazy', name: 'lazy', type: 'directory', children: [] },
    ];

    renderWithTheme(
      <TestTree items={lazyData} loadChildren={loadChildren} onLoadError={onLoadError} />,
    );

    const toggle = screen.getByRole('button', { name: /expand/i });
    await user.click(toggle);

    // Wait for the rejection to be handled
    await vi.waitFor(() => {
      expect(onLoadError).toHaveBeenCalledWith(error, '/lazy', expect.objectContaining({ path: '/lazy' }));
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
