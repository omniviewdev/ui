import { useEffect, useMemo } from 'react';
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

  const insertIndex = useMemo(() => {
    if (!isDropTarget || !broker || !viewportRef.current) return null;

    const viewport = viewportRef.current;
    const tabEls = viewport.querySelectorAll<HTMLElement>('[data-tab-id]');
    if (tabEls.length === 0) return 0;

    const sorted = Array.from(tabEls).sort(
      (a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left,
    );

    for (let i = 0; i < sorted.length; i++) {
      const rect = sorted[i]!.getBoundingClientRect();
      const midpoint = rect.left + rect.width / 2;
      if (broker.pointerX < midpoint) return i;
    }
    return sorted.length;
  }, [isDropTarget, broker, viewportRef, broker?.pointerX]);

  if (!broker) {
    return { isDropTarget: false, insertIndex: null };
  }

  return { isDropTarget, insertIndex };
}
