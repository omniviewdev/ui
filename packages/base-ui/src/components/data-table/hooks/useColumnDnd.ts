import { useCallback } from 'react';
import type { Table } from '@tanstack/react-table';
import type { DragEndEvent } from '@dnd-kit/core';

/**
 * Provides a DnD end handler that reorders columns.
 * Used with @dnd-kit/core DndContext in the DataTable root.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useColumnDnd(table: Table<any>) {
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const currentOrder = table.getState().columnOrder.length
        ? table.getState().columnOrder
        : table.getAllLeafColumns().map((c) => c.id);

      const oldIndex = currentOrder.indexOf(active.id as string);
      const newIndex = currentOrder.indexOf(over.id as string);

      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = [...currentOrder];
      const [removed] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, removed!);

      table.setColumnOrder(newOrder);
    },
    [table],
  );

  return { handleDragEnd };
}
