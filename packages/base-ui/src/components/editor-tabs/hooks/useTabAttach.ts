import { useEffect } from 'react';
import { useTabDragBroker } from '../context/TabDragBroker';
import type { AttachCommit } from '../types';

export interface UseTabAttachOptions {
  instanceId: string;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  onAttachTab?: (commit: AttachCommit) => void;
}

export interface UseTabAttachReturn {
  isDropTarget: boolean;
  insertIndex: number | null;
}

export function useTabAttach({
  instanceId,
  viewportRef,
  onAttachTab,
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
    });

    return () => {
      unregisterDropZone(instanceId);
    };
  }, [registerDropZone, unregisterDropZone, instanceId, viewportRef, onAttachTab]);

  const isDropTarget = broker?.hoverInstanceId === instanceId;

  const insertIndex = isDropTarget ? (broker?.hoverInsertIndex ?? null) : null;

  if (!broker) {
    return { isDropTarget: false, insertIndex: null };
  }

  return { isDropTarget, insertIndex };
}
