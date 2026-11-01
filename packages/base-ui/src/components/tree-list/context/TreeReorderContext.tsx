import { createContext } from 'react';
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';
import type { Key, TreeStore } from '../types';

export interface TreeReorderContextValue {
  store: TreeStore;
  draggedKey: Key | null;
  proposeMove: (
    siblingKeys: readonly Key[],
    parentKey: Key | null,
    activeKey: Key,
    overKey: Key,
  ) => void;
}

export interface TreeItemActivatorContextValue {
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  disabled: boolean;
  isDragging: boolean;
}

export const TreeReorderContext = createContext<TreeReorderContextValue | null>(null);
export const TreeItemActivatorContext = createContext<TreeItemActivatorContextValue | null>(null);
