import type { Key, TreeOrder, TreeReorderEvent } from './types';

export function applySiblingOrder<TItem>(
  siblings: readonly TItem[],
  parentKey: Key | null,
  order: TreeOrder,
  itemKey: (item: TItem) => Key,
): readonly TItem[] {
  const orderedKeys = order.get(parentKey);
  if (orderedKeys === undefined) return siblings;

  const itemByKey = new Map<Key, TItem>();
  for (const item of siblings) itemByKey.set(itemKey(item), item);

  const result: TItem[] = [];
  const includedKeys = new Set<Key>();
  const explicitKeyCount = Math.min(orderedKeys.length, siblings.length);
  for (let index = 0; index < explicitKeyCount; index += 1) {
    const key = orderedKeys[index]!;
    if (itemByKey.has(key) && !includedKeys.has(key)) {
      result.push(itemByKey.get(key) as TItem);
      includedKeys.add(key);
    }
  }

  for (const item of siblings) {
    const key = itemKey(item);
    if (!includedKeys.has(key)) {
      result.push(item);
      includedKeys.add(key);
    }
  }

  return result;
}

export function moveSibling(
  order: TreeOrder,
  siblingKeys: readonly Key[],
  parentKey: Key | null,
  activeKey: Key,
  overKey: Key,
): { order: TreeOrder; event: TreeReorderEvent } | null {
  if (activeKey === overKey) return null;

  const fromIndex = siblingKeys.indexOf(activeKey);
  const toIndex = siblingKeys.indexOf(overKey);
  if (fromIndex < 0 || toIndex < 0) return null;

  const reorderedKeys = [...siblingKeys];
  reorderedKeys.splice(fromIndex, 1);
  reorderedKeys.splice(toIndex, 0, activeKey);

  const nextOrder = new Map(order);
  nextOrder.set(parentKey, reorderedKeys);

  return {
    order: nextOrder,
    event: { activeKey, overKey, parentKey, fromIndex, toIndex },
  };
}
