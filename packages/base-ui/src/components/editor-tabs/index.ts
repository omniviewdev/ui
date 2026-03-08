export { EditorTabs } from './EditorTabs';
export type { EditorTabsProps } from './EditorTabs';
export type {
  TabDescriptor,
  TabGroupDescriptor,
  TabId,
  TabGroupId,
  TabSegments,
  ReorderMeta,
  DetachCommit,
  AttachCommit,
  DragMode,
} from './types';
export { computeTabSegments } from './utils/computeTabSegments';
export { useEditorTabsContext } from './context/EditorTabsContext';
export { TabDragBrokerProvider, useTabDragBroker } from './context/TabDragBroker';
