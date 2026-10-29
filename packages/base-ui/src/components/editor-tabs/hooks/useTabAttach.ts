import { useEffect } from 'react';
import { useTabDragBroker } from '../context/TabDragBroker';
import type { AttachCommit, TabDragType } from '../types';

export interface UseTabAttachOptions {
  instanceId: string;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  onAttachTab?: (commit: AttachCommit) => void;
  /** Only sessions of this type can drop here. Defaults to `'editor-tab'`. */
  dragType?: TabDragType;
}

export interface UseTabAttachReturn {
  isDropTarget: boolean;
  insertIndex: number | null;
}

export function useTabAttach({
  instanceId,
  viewportRef,
  onAttachTab,
  dragType,
}: UseTabAttachOptions): UseTabAttachReturn {
  const broker = useTabDragBroker();
  const registerDropZone = broker?.registerDropZone;
  const unregisterDropZone = broker?.unregisterDropZone;

  // Register this instance as a drop zone
  useEffect(() => {
    if (!registerDropZone || !unregisterDropZone || !onAttachTab) return;

    registerDropZone({
      instanceId,
      getRect: () => viewportRef.current?.getBoundingClientRect() ?? null,
      getElement: () => viewportRef.current,
      onAttach: onAttachTab,
      dragType,
    });

    return () => {
      unregisterDropZone(instanceId);
    };
  }, [registerDropZone, unregisterDropZone, instanceId, viewportRef, onAttachTab, dragType]);

  if (!broker || broker.hoverInstanceId !== instanceId) {
    return { isDropTarget: false, insertIndex: null };
  }

  return { isDropTarget: true, insertIndex: broker.hoverInsertIndex };
}
