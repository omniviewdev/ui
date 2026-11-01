import { act, fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { TreeList } from './TreeList';
import { useTreeActions } from './context/TreeContext';
import type { TreeListRootProps, TreeNodeMeta } from './types';

interface Entry {
  id: string;
  children?: Entry[];
  disabled?: boolean;
  branch?: boolean;
}

const itemKey = (item: Entry) => item.id;
const getChildren = (item: Entry) => item.children;
const getTextValue = (item: Entry) => item.id;
const renderItem = (item: Entry, node: TreeNodeMeta) => (
  <TreeList.Item itemKey={node.key} disabled={item.disabled} textValue={item.id}>
    <TreeList.ItemToggle itemKey={node.key} />
    <TreeList.ItemLabel>{item.id}</TreeList.ItemLabel>
  </TreeList.Item>
);

function ActionButtons() {
  const actions = useTreeActions();
  return (
    <>
      <button onClick={() => actions.select('blocked')}>Select blocked</button>
      <button onClick={() => actions.deselect('blocked')}>Deselect blocked</button>
      <button onClick={() => actions.toggle('blocked')}>Toggle blocked</button>
      <button onClick={() => actions.selectRange('blocked')}>Range to blocked</button>
      <button onClick={() => actions.setActiveKey('blocked')}>Focus blocked</button>
      <button onClick={actions.expandAll}>Expand all</button>
      <button onClick={() => void actions.expandAllAsync()}>Expand all async</button>
      <button onClick={actions.collapseAll}>Collapse all</button>
    </>
  );
}

function Example(props: Partial<TreeListRootProps<Entry>>) {
  return (
    <TreeList.Root<Entry>
      items={[]}
      itemKey={itemKey}
      getChildren={getChildren}
      getTextValue={getTextValue}
      renderItem={renderItem}
      {...props}
    >
      <TreeList.Viewport />
      <ActionButtons />
    </TreeList.Root>
  );
}

function row(label: string) {
  return screen.getByText(label, { selector: 'span' }).closest('[role="treeitem"]')!;
}

function expectActive(label: string) {
  expect(screen.getByRole('tree')).toHaveAttribute('aria-activedescendant', row(label).id);
}

function press(key: string, modifiers = {}) {
  fireEvent.keyDown(screen.getByRole('tree'), { key, ...modifiers });
}

function toggle(label: string) {
  fireEvent.click(within(row(label) as HTMLElement).getByRole('button'));
}

describe('TreeList keyboard and state regressions', () => {
  it('ArrowRight skips disabled direct children and their descendants for an enabled direct child', () => {
    renderWithTheme(
      <Example
        items={[
          {
            id: 'parent',
            children: [
              { id: 'blocked', disabled: true, children: [{ id: 'grandchild' }] },
              { id: 'child' },
            ],
          },
          { id: 'sibling' },
        ]}
        defaultExpandedKeys={['parent', 'blocked']}
        defaultActiveKey="parent"
      />,
    );

    press('ArrowRight');

    expectActive('child');
  });

  it.each([false, true])(
    'ArrowRight never leaves its branch when its only child is disabled (expanded child: %s)',
    (expandedChild) => {
      renderWithTheme(
        <Example
          items={[
            {
              id: 'parent',
              children: [{ id: 'blocked', children: [{ id: 'grandchild' }] }],
            },
            { id: 'sibling' },
          ]}
          disabledKeys={['blocked']}
          defaultExpandedKeys={expandedChild ? ['parent', 'blocked'] : ['parent']}
          defaultActiveKey="parent"
        />,
      );

      press('ArrowRight');

      expectActive('parent');
    },
  );

  it('ArrowLeft does not focus a disabled parent', () => {
    renderWithTheme(
      <Example
        items={[{ id: 'blocked', disabled: true, children: [{ id: 'child' }] }]}
        defaultExpandedKeys={['blocked']}
        defaultActiveKey="child"
      />,
    );

    press('ArrowLeft');

    expectActive('child');
  });

  it('uses filtered displayed expansion for ArrowRight and ArrowLeft without saving revealed ancestors', () => {
    const onExpandedKeysChange = vi.fn();
    renderWithTheme(
      <Example
        items={[{ id: 'parent', children: [{ id: 'match' }] }]}
        filterText="match"
        defaultActiveKey="parent"
        onExpandedKeysChange={onExpandedKeysChange}
      />,
    );

    press('ArrowRight');
    expectActive('match');
    expect(onExpandedKeysChange).not.toHaveBeenCalled();
    press('ArrowLeft');
    expectActive('parent');
    press('ArrowLeft');
    expect(onExpandedKeysChange).toHaveBeenCalledExactlyOnceWith(new Set());
  });

  it('does not enter a sibling when filtering hides all children of a saved expanded branch', () => {
    renderWithTheme(
      <Example
        items={[{ id: 'parent', children: [{ id: 'hidden' }] }, { id: 'sibling' }]}
        filterText="visible"
        filterFn={(item) => item.id !== 'hidden'}
        expandedKeys={new Set(['parent'])}
        defaultActiveKey="parent"
      />,
    );

    expect(row('parent')).toHaveAttribute('aria-expanded', 'false');
    press('ArrowRight');
    expectActive('parent');
  });

  it('proposes all enabled loaded sibling branches in one controlled expansion update', () => {
    const onExpandedKeysChange = vi.fn();
    renderWithTheme(
      <Example
        items={[
          { id: 'alpha', children: [{ id: 'nested', children: [{ id: 'deep' }] }] },
          { id: 'beta', children: [{ id: 'beta-child' }] },
          { id: 'blocked', disabled: true, children: [{ id: 'blocked-child' }] },
          { id: 'leaf' },
        ]}
        expandedKeys={new Set(['nested'])}
        defaultActiveKey="alpha"
        onExpandedKeysChange={onExpandedKeysChange}
      />,
    );

    press('*');

    expect(onExpandedKeysChange).toHaveBeenCalledExactlyOnceWith(
      new Set(['nested', 'alpha', 'beta']),
    );
  });

  it('batches loaded siblings while lazy siblings load once and expand only after completion', async () => {
    const lazy: Entry = { id: 'lazy', branch: true };
    const blocked: Entry = { id: 'blocked', branch: true, disabled: true };
    let finishLoad!: () => void;
    const loadChildren = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishLoad = () => {
            lazy.children = [{ id: 'lazy-child' }];
            resolve();
          };
        }),
    );
    const onExpandedKeysChange = vi.fn();
    renderWithTheme(
      <Example
        items={[
          { id: 'alpha', branch: true, children: [{ id: 'alpha-child' }] },
          { id: 'empty', branch: true, children: [] },
          lazy,
          blocked,
        ]}
        isBranch={(item) => item.branch === true}
        loadChildren={loadChildren}
        defaultActiveKey="alpha"
        onExpandedKeysChange={onExpandedKeysChange}
      />,
    );

    press('*');

    expect(onExpandedKeysChange).toHaveBeenCalledExactlyOnceWith(new Set(['alpha', 'empty']));
    expect(loadChildren).toHaveBeenCalledExactlyOnceWith('lazy', lazy);
    expect(row('lazy')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('alpha-child')).toBeInTheDocument();
    press('*');
    expect(loadChildren).toHaveBeenCalledTimes(1);
    await act(async () => finishLoad());
    expect(row('lazy')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('lazy-child')).toBeInTheDocument();
    expect(row('blocked')).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not expand a lazy branch that becomes disabled before loading finishes', async () => {
    let finishLoad!: () => void;
    const pendingLoad = new Promise<void>((resolve) => {
      finishLoad = resolve;
    });
    const loadChildren = vi.fn(() => pendingLoad);
    const onExpandedKeysChange = vi.fn();
    const items: Entry[] = [{ id: 'lazy', branch: true }];
    const props = {
      items,
      isBranch: (item: Entry) => item.branch === true,
      loadChildren,
      onExpandedKeysChange,
    };
    const { rerender } = renderWithTheme(<Example {...props} />);

    toggle('lazy');
    expect(loadChildren).toHaveBeenCalledExactlyOnceWith('lazy', items[0]);
    rerender(<Example {...props} disabledKeys={['lazy']} />);
    await act(async () => finishLoad());

    expect(onExpandedKeysChange).not.toHaveBeenCalled();
    expect(row('lazy')).toHaveAttribute('aria-expanded', 'false');
  });

  it.each(['root', 'local'] as const)(
    'guards direct selection, range targets, and focus for %s disabled rows',
    (disabledSource) => {
      const onSelectedKeysChange = vi.fn();
      const onActiveKeyChange = vi.fn();
      renderWithTheme(
        <Example
          items={[{ id: 'start' }, { id: 'blocked', disabled: disabledSource === 'local' }]}
          disabledKeys={disabledSource === 'root' ? ['blocked'] : []}
          selectionMode="multiple"
          defaultSelectedKeys={['start']}
          defaultActiveKey="start"
          onSelectedKeysChange={onSelectedKeysChange}
          onActiveKeyChange={onActiveKeyChange}
        />,
      );

      for (const name of [
        'Select blocked',
        'Deselect blocked',
        'Toggle blocked',
        'Range to blocked',
        'Focus blocked',
      ]) {
        fireEvent.click(screen.getByRole('button', { name }));
      }

      expect(onSelectedKeysChange).not.toHaveBeenCalled();
      expect(onActiveKeyChange).not.toHaveBeenCalled();
      expectActive('start');
      expect(row('blocked')).not.toHaveAttribute('aria-selected', 'true');
    },
  );

  it.each(['root', 'local'] as const)(
    'blocks keyboard actions on a controlled %s disabled active branch',
    (disabledSource) => {
      const onSelectedKeysChange = vi.fn();
      const onExpandedKeysChange = vi.fn();
      const onActiveKeyChange = vi.fn();
      renderWithTheme(
        <Example
          items={[
            { id: 'blocked', disabled: disabledSource === 'local', children: [{ id: 'child' }] },
            { id: 'sibling', children: [{ id: 'hidden' }] },
          ]}
          disabledKeys={disabledSource === 'root' ? ['blocked'] : []}
          activeKey="blocked"
          defaultExpandedKeys={['blocked']}
          onSelectedKeysChange={onSelectedKeysChange}
          onExpandedKeysChange={onExpandedKeysChange}
          onActiveKeyChange={onActiveKeyChange}
        />,
      );
      onActiveKeyChange.mockClear();

      for (const key of ['Enter', ' ', 'ArrowRight', 'ArrowLeft', '*']) press(key);

      expect(onSelectedKeysChange).not.toHaveBeenCalled();
      expect(onExpandedKeysChange).not.toHaveBeenCalled();
      expect(onActiveKeyChange).not.toHaveBeenCalled();
      expect(screen.queryByText('hidden')).not.toBeInTheDocument();
    },
  );

  it('range selection and selectAll exclude both root and item-local disabled rows', () => {
    renderWithTheme(
      <Example
        items={[{ id: 'start' }, { id: 'local', disabled: true }, { id: 'root' }, { id: 'finish' }]}
        disabledKeys={['root']}
        selectionMode="multiple"
      />,
    );

    fireEvent.click(row('start'));
    fireEvent.click(row('finish'), { shiftKey: true });
    expect(row('start')).toHaveAttribute('aria-selected', 'true');
    expect(row('finish')).toHaveAttribute('aria-selected', 'true');
    expect(row('local')).not.toHaveAttribute('aria-selected', 'true');
    expect(row('root')).not.toHaveAttribute('aria-selected', 'true');
    fireEvent.click(row('start'));
    press('a', { ctrlKey: true });
    expect(row('finish')).toHaveAttribute('aria-selected', 'true');
    expect(row('local')).not.toHaveAttribute('aria-selected', 'true');
    expect(row('root')).not.toHaveAttribute('aria-selected', 'true');
  });

  it.each(['ArrowDown', 'ArrowUp', 'Home', 'End'])('%s skips item-local disabled rows', (key) => {
    const backwards = key === 'ArrowUp' || key === 'End';
    renderWithTheme(
      <Example
        items={[
          { id: 'disabled-first', disabled: true },
          { id: 'first' },
          { id: 'disabled-middle', disabled: true },
          { id: 'last' },
          { id: 'disabled-last', disabled: true },
        ]}
        defaultActiveKey={backwards ? 'last' : 'first'}
      />,
    );

    press(key);

    expectActive(key === 'ArrowUp' || key === 'Home' ? 'first' : 'last');
  });

  it.each(['root', 'local'] as const)(
    'blocks expansion and collapse of %s disabled branches',
    (disabledSource) => {
      const onExpandedKeysChange = vi.fn();
      renderWithTheme(
        <Example
          items={[
            { id: 'closed', disabled: disabledSource === 'local', children: [{ id: 'hidden' }] },
            { id: 'open', disabled: disabledSource === 'local', children: [{ id: 'visible' }] },
          ]}
          disabledKeys={disabledSource === 'root' ? ['closed', 'open'] : []}
          defaultExpandedKeys={['open']}
          onExpandedKeysChange={onExpandedKeysChange}
        />,
      );

      toggle('closed');
      toggle('open');

      expect(onExpandedKeysChange).not.toHaveBeenCalled();
      expect(screen.queryByText('hidden')).not.toBeInTheDocument();
      expect(screen.getByText('visible')).toBeInTheDocument();
    },
  );

  it('bulk expansion skips disabled branches and bulk collapse preserves their saved state', async () => {
    renderWithTheme(
      <Example
        items={[
          { id: 'enabled', children: [{ id: 'enabled-child' }] },
          { id: 'closed', disabled: true, children: [{ id: 'hidden' }] },
          { id: 'open', children: [{ id: 'visible' }] },
        ]}
        disabledKeys={['open']}
        defaultExpandedKeys={['open']}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Expand all' }));
    expect(screen.getByText('enabled-child')).toBeInTheDocument();
    expect(screen.queryByText('hidden')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Collapse all' }));
    expect(screen.queryByText('enabled-child')).not.toBeInTheDocument();
    expect(screen.getByText('visible')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Expand all async' }));
    });
    expect(screen.getByText('enabled-child')).toBeInTheDocument();
    expect(screen.queryByText('hidden')).not.toBeInTheDocument();
    expect(screen.getByText('visible')).toBeInTheDocument();
  });

  it('treats known empty children as leaves unless isBranch explicitly declares a branch', () => {
    const onExpandedKeysChange = vi.fn();
    renderWithTheme(
      <Example
        items={[{ id: 'empty', children: [] }]}
        defaultActiveKey="empty"
        onExpandedKeysChange={onExpandedKeysChange}
      />,
    );

    expect(row('empty')).not.toHaveAttribute('aria-expanded');
    press('ArrowRight');
    expect(onExpandedKeysChange).not.toHaveBeenCalled();
  });
});
