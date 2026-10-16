import { describe } from 'vitest';
import { TreeList } from '@omniviewdev/base-ui';
import type { Key, TreeNodeMeta, TreeOrder } from '@omniviewdev/base-ui';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';

// ---------------------------------------------------------------------------
// Data factories
// ---------------------------------------------------------------------------

interface TreeItem {
  id: string;
  label: string;
  children?: TreeItem[];
}

function makeFlatItems(count: number): TreeItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    label: `Item ${i}`,
  }));
}

function makeNestedItems(parents: number, childrenPerParent: number): TreeItem[] {
  return Array.from({ length: parents }, (_, i) => ({
    id: `parent-${i}`,
    label: `Parent ${i}`,
    children: Array.from({ length: childrenPerParent }, (_, j) => ({
      id: `parent-${i}-child-${j}`,
      label: `Child ${i}-${j}`,
    })),
  }));
}

const itemKey = (item: TreeItem) => item.id;
const getChildren = (item: TreeItem) => item.children ?? [];
const isBranch = (item: TreeItem) => (item.children?.length ?? 0) > 0;
const getTextValue = (item: TreeItem) => item.label;
const renderItem = (item: TreeItem, node: TreeNodeMeta) => (
  <TreeList.Item itemKey={node.key} textValue={item.label}>
    <TreeList.ItemIndent depth={node.depth} />
    {node.isBranch && <TreeList.ItemToggle itemKey={node.key} />}
    <TreeList.ItemLabel>{item.label}</TreeList.ItemLabel>
  </TreeList.Item>
);

// Pre-generate data
const flat500 = makeFlatItems(500);
const nested50x2 = makeNestedItems(50, 2);
const flat100 = makeFlatItems(100);
const flat150 = makeFlatItems(150);

// Keep all ordering setup outside measured callbacks.
const nestedExpanded = new Set<Key>(nested50x2.map(itemKey));
const nestedOrder: TreeOrder = new Map<Key | null, readonly Key[]>([
  [null, nested50x2.map(itemKey)],
  ...nested50x2.map((parent): [Key, readonly Key[]] => [
    parent.id,
    parent.children!.map(itemKey),
  ]),
]);
const changedNestedOrder = new Map(nestedOrder);
changedNestedOrder.set('parent-0', ['parent-0-child-1', 'parent-0-child-0']);
const renderReorderableItem = (item: TreeItem, node: TreeNodeMeta) => (
  <TreeList.ReorderableItem itemKey={node.key} textValue={item.label}>
    <TreeList.ItemDragHandle aria-label={`Reorder ${item.label}`}>⋮⋮</TreeList.ItemDragHandle>
    <TreeList.ItemIndent depth={node.depth} />
    {node.isBranch && <TreeList.ItemToggle itemKey={node.key} />}
    <TreeList.ItemLabel>{item.label}</TreeList.ItemLabel>
  </TreeList.ReorderableItem>
);

function OrderedTreeListBench({ order, reorderable = false }: { order?: TreeOrder; reorderable?: boolean }) {
  return (
    <TreeList
      items={nested50x2}
      itemKey={itemKey}
      getChildren={getChildren}
      isBranch={isBranch}
      getTextValue={getTextValue}
      renderItem={reorderable ? renderReorderableItem : renderItem}
      defaultExpandedKeys={nestedExpanded}
      order={order}
      reorderable={reorderable}
    >
      <TreeList.Viewport />
    </TreeList>
  );
}
// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

function TreeListBench({ items }: { items: TreeItem[] }) {
  return (
    <TreeList
      items={items}
      itemKey={itemKey}
      getChildren={getChildren}
      isBranch={isBranch}
      getTextValue={getTextValue}
      renderItem={renderItem}
    >
      <TreeList.Viewport />
    </TreeList>
  );
}

// ---------------------------------------------------------------------------
// Benchmarks
// ---------------------------------------------------------------------------

describe('TreeList', () => {
  benchRender('mount 500 flat nodes', () => <TreeListBench items={flat500} />, TIER_1_OPTIONS);

  benchRender(
    'mount nested (50 parents x 2 children)',
    () => <TreeListBench items={nested50x2} />,
    TIER_1_OPTIONS,
  );

  benchRerender(
    'data change (100 -> 150 nodes)',
    { initialProps: { items: flat100 }, updatedProps: { items: flat150 } },
    (props) => <TreeListBench {...props} />,
    TIER_1_OPTIONS,
  );

  benchRender(
    'mount static expanded nested (50 parents x 2 children)',
    () => <OrderedTreeListBench />,
    TIER_1_OPTIONS,
  );

  benchRender(
    'mount ordered nested (50 parents x 2 children)',
    () => <OrderedTreeListBench order={nestedOrder} />,
    TIER_1_OPTIONS,
  );

  benchRender(
    'mount reorderable nested (50 parents x 2 children)',
    () => <OrderedTreeListBench order={nestedOrder} reorderable />,
    TIER_1_OPTIONS,
  );

  benchRerender(
    'reorder one nested sibling group',
    { initialProps: { order: nestedOrder }, updatedProps: { order: changedNestedOrder } },
    (props) => <OrderedTreeListBench {...props} reorderable />,
    TIER_1_OPTIONS,
  );
});
