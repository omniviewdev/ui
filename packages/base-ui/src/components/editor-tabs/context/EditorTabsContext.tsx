import { createContext, useContext } from 'react';
import type { DragMode, TabGroupId, TabId } from '../types';

export interface ScrollState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

export interface EditorTabsContextValue {
  activeId: TabId;
  onActiveChange: (id: TabId) => void;
  onCloseTab?: (id: TabId) => void;
  onContextMenuTab?: (id: TabId, ev: React.MouseEvent) => void;
  onToggleGroupCollapsed?: (groupId: TabGroupId) => void;
  onGroupContextMenu?: (groupId: TabGroupId, ev: React.MouseEvent) => void;
  scrollState: ScrollState;
  scrollTo: (direction: 'left' | 'right') => void;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  tabs: TabId[];
  dragActiveId: TabId | null;
  dragMode: DragMode;
}

const EditorTabsContext = createContext<EditorTabsContextValue | null>(null);

export function useEditorTabsContext(): EditorTabsContextValue {
  const ctx = useContext(EditorTabsContext);
  if (!ctx) {
    throw new Error('useEditorTabsContext must be used within an EditorTabs.Root');
  }
  return ctx;
}

export { EditorTabsContext };
