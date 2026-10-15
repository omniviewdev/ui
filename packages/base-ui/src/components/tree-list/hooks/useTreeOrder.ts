import { useCallback, useRef, useState } from 'react';
import { moveSibling } from '../order';
import type { Key, TreeOrder, TreeReorderEvent } from '../types';

interface UseTreeOrderOptions {
  order?: TreeOrder;
  defaultOrder?: TreeOrder;
  onOrderChange?: (order: TreeOrder, event: TreeReorderEvent) => void;
}

interface UseTreeOrderReturn {
  currentOrder: TreeOrder;
  proposeMove: (
    siblingKeys: readonly Key[],
    parentKey: Key | null,
    activeKey: Key,
    overKey: Key,
  ) => void;
}

export function useTreeOrder({
  order,
  defaultOrder,
  onOrderChange,
}: UseTreeOrderOptions): UseTreeOrderReturn {
  const [internalOrder, setInternalOrder] = useState<TreeOrder>(() => defaultOrder ?? new Map());
  const isControlled = order !== undefined;
  const currentOrder = isControlled ? order : internalOrder;

  const currentOrderRef = useRef(currentOrder);
  currentOrderRef.current = currentOrder;
  const isControlledRef = useRef(isControlled);
  isControlledRef.current = isControlled;
  const onOrderChangeRef = useRef(onOrderChange);
  onOrderChangeRef.current = onOrderChange;

  const proposeMove = useCallback(
    (
      siblingKeys: readonly Key[],
      parentKey: Key | null,
      activeKey: Key,
      overKey: Key,
    ) => {
      const proposal = moveSibling(
        currentOrderRef.current,
        siblingKeys,
        parentKey,
        activeKey,
        overKey,
      );
      if (proposal === null) return;

      if (!isControlledRef.current) {
        currentOrderRef.current = proposal.order;
        setInternalOrder(proposal.order);
      }
      onOrderChangeRef.current?.(proposal.order, proposal.event);
    },
    [],
  );

  return { currentOrder, proposeMove };
}
