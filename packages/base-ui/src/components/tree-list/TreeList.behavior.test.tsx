import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { TreeList } from './TreeList';
import type { TreeListRootProps, TreeNodeMeta } from './types';

interface Entry {
  id: string;
  children?: Entry[];
  disabled?: boolean;
}

const entries: Entry[] = [
  { id: 'parent', children: [{ id: 'first' }, { id: 'second' }] },
  { id: 'last' },
];
const itemKey = (item: Entry) => item.id;
const getChildren = (item: Entry) => item.children;
const getTextValue = (item: Entry) => item.id;
const renderItem = (item: Entry, node: TreeNodeMeta) => (
  <TreeList.Item itemKey={node.key} disabled={item.disabled}>
    <TreeList.ItemToggle itemKey={node.key} />
    <TreeList.ItemLabel>{item.id}</TreeList.ItemLabel>
    <span data-testid={`metadata-${item.id}`}>{String(node.isExpanded)}</span>
  </TreeList.Item>
);

function Example(props: Partial<TreeListRootProps<Entry>>) {
  return (
    <TreeList
      items={entries}
      itemKey={itemKey}
      getChildren={getChildren}
      getTextValue={getTextValue}
      renderItem={renderItem}
      {...props}
    >
      <TreeList.Viewport />
    </TreeList>
  );
}

function activeText() {
  const id = screen.getByRole('tree').getAttribute('aria-activedescendant');
  return id ? document.getElementById(id)?.textContent : null;
}

function row(label: string) {
  return screen.getByText(label, { selector: 'span' }).closest('[role="treeitem"]')!;
}

describe('TreeList focus and displayed structure', () => {
  it('restores focus to a visible ancestor after external collapse', () => {
    const { rerender } = renderWithTheme(
      <Example defaultActiveKey="second" expandedKeys={new Set(['parent'])} />,
    );
    expect(activeText()).toContain('second');

    rerender(<Example defaultActiveKey="second" expandedKeys={new Set()} />);

    expect(activeText()).toContain('parent');
    expect(screen.queryByText('second')).not.toBeInTheDocument();
  });

  it('moves focus to a surviving neighbor after source removal and clears an empty tree', () => {
    const { rerender } = renderWithTheme(<Example defaultActiveKey="parent" />);

    rerender(<Example items={[{ id: 'last' }]} defaultActiveKey="parent" />);
    expect(activeText()).toContain('last');

    rerender(<Example items={[]} defaultActiveKey="parent" />);
    expect(screen.getByRole('tree')).not.toHaveAttribute('aria-activedescendant');
  });

  it('does not reference an absent controlled active row when its owner rejects repair', () => {
    const onActiveKeyChange = vi.fn();
    renderWithTheme(<Example activeKey="missing" onActiveKeyChange={onActiveKeyChange} />);

    expect(screen.getByRole('tree')).not.toHaveAttribute('aria-activedescendant');
    expect(onActiveKeyChange).toHaveBeenCalledWith('parent');
  });

  it('reports filtered expansion and sibling positions without changing saved expansion', () => {
    const onExpandedKeysChange = vi.fn();
    const { rerender } = renderWithTheme(
      <Example filterText="second" onExpandedKeysChange={onExpandedKeysChange} />,
    );

    expect(row('parent')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('metadata-parent')).toHaveTextContent('true');
    expect(row('parent')).toHaveAttribute('aria-posinset', '1');
    expect(row('parent')).toHaveAttribute('aria-setsize', '1');
    expect(row('second')).toHaveAttribute('aria-posinset', '1');
    expect(row('second')).toHaveAttribute('aria-setsize', '1');
    expect(onExpandedKeysChange).not.toHaveBeenCalled();

    rerender(<Example filterText="" onExpandedKeysChange={onExpandedKeysChange} />);
    expect(row('parent')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('second')).not.toBeInTheDocument();
    expect(row('last')).toHaveAttribute('aria-posinset', '2');
    expect(row('last')).toHaveAttribute('aria-setsize', '2');
  });

  it('skips item-local disabled rows for keyboard focus and blocks their toggle', () => {
    const items: Entry[] = [
      { id: 'start' },
      { id: 'disabled', disabled: true, children: [{ id: 'hidden' }] },
      { id: 'finish' },
    ];
    renderWithTheme(<Example items={items} defaultActiveKey="start" />);

    fireEvent.keyDown(screen.getByRole('tree'), { key: 'ArrowDown' });
    expect(activeText()).toContain('finish');
    fireEvent.click(row('disabled').querySelector('button')!);
    expect(screen.queryByText('hidden')).not.toBeInTheDocument();
  });

  it('reconciles keyboard focus after filtering out the active row', () => {
    const { rerender } = renderWithTheme(<Example defaultActiveKey="parent" />);

    rerender(<Example defaultActiveKey="parent" filterText="last" />);

    expect(activeText()).toContain('last');
  });

  it('updates sibling metadata even when consumers reuse row elements', () => {
    const lastRow = (
      <TreeList.Item itemKey="last">
        <span>last</span>
      </TreeList.Item>
    );
    const firstRow = (
      <TreeList.Item itemKey="parent">
        <span>parent</span>
      </TreeList.Item>
    );
    const stableRenderItem = (item: Entry) => (item.id === 'last' ? lastRow : firstRow);
    const { rerender } = renderWithTheme(<Example renderItem={stableRenderItem} />);
    expect(row('last')).toHaveAttribute('aria-posinset', '2');
    expect(row('last')).toHaveAttribute('aria-setsize', '2');

    rerender(<Example renderItem={stableRenderItem} filterText="last" />);

    expect(row('last')).toHaveAttribute('aria-posinset', '1');
    expect(row('last')).toHaveAttribute('aria-setsize', '1');
  });

  it('moves active focus when a root-level disabled update makes its row unavailable', () => {
    const { rerender } = renderWithTheme(<Example defaultActiveKey="parent" />);

    rerender(<Example defaultActiveKey="parent" disabledKeys={['parent']} />);

    expect(activeText()).toContain('last');
    fireEvent.keyDown(screen.getByRole('tree'), { key: 'Enter' });
    expect(row('last')).toHaveAttribute('aria-selected', 'true');
    expect(row('parent')).not.toHaveAttribute('aria-selected', 'true');
  });
});
