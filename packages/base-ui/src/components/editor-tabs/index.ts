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
  TabDragType,
  TabTransferCommit,
  TabDragScreenPoint,
  TabDragPointer,
  TabDragPayload,
  RemoteTabDropResult,
  RemoteTabDragEvent,
  TabDragTransport,
} from './types';
export { computeTabSegments } from './utils/computeTabSegments';
export { useEditorTabsContext } from './context/EditorTabsContext';
export {
  DEFAULT_TAB_DRAG_TYPE,
  TabDragBrokerProvider,
  useTabDragBroker,
} from './context/TabDragBroker';
export type {
  DropZoneRegistration,
  TabDragBrokerProviderProps,
  TabDragBrokerValue,
  TabDragOutcome,
  TabDragSession,
} from './context/TabDragBroker';
