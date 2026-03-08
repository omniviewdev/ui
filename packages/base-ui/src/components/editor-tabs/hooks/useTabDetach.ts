import { useCallback, useRef, useState } from 'react';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import type { TabDescriptor, DetachCommit, DragMode, TabId } from '../types';

export interface UseTabDetachOptions {
  detachable: boolean;
  detachThresholdPx: number;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  tabs: TabDescriptor[];
  onDetachCommit?: (commit: DetachCommit) => void;
}

export interface UseTabDetachReturn {
  dragMode: DragMode;
  dragModeRef: React.RefObject<DragMode>;
  handleDetachDragStart: (event: DragStartEvent) => void;
  handleDetachDragEnd: (event: DragEndEvent) => void;
  handleDetachDragCancel: () => void;
}

export function useTabDetach({
  detachable,
  detachThresholdPx,
  viewportRef,
  tabs,
  onDetachCommit,
}: UseTabDetachOptions): UseTabDetachReturn {
  const [dragMode, setDragMode] = useState<DragMode>('idle');
  const dragModeRef = useRef<DragMode>('idle');
  const stripRectRef = useRef<DOMRect | null>(null);
  const pointerRef = useRef<{ screenX: number; screenY: number }>({ screenX: 0, screenY: 0 });
  const activeIdRef = useRef<TabId | null>(null);
  const rafRef = useRef<number>(0);
  const listenerRef = useRef<((e: PointerEvent) => void) | null>(null);

  const updateMode = useCallback((nextMode: DragMode) => {
    if (dragModeRef.current === nextMode) return;
    dragModeRef.current = nextMode;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setDragMode(nextMode);
    });
  }, []);

  const cleanup = useCallback(() => {
    if (listenerRef.current) {
      document.removeEventListener('pointermove', listenerRef.current);
      listenerRef.current = null;
    }
    cancelAnimationFrame(rafRef.current);
    dragModeRef.current = 'idle';
    setDragMode('idle');
    stripRectRef.current = null;
    activeIdRef.current = null;
  }, []);

  const handleDetachDragStart = useCallback(
    (event: DragStartEvent) => {
      if (!detachable) return;

      activeIdRef.current = String(event.active.id);
      const viewport = viewportRef.current;
      if (!viewport) return;

      stripRectRef.current = viewport.getBoundingClientRect();
      dragModeRef.current = 'reorder';
      setDragMode('reorder');

      const threshold = detachThresholdPx;
      const hysteresis = threshold / 2;

      const onPointerMove = (e: PointerEvent) => {
        pointerRef.current = { screenX: e.screenX, screenY: e.screenY };
        const rect = stripRectRef.current;
        if (!rect) return;

        const above = e.clientY < rect.top - threshold;
        const below = e.clientY > rect.bottom + threshold;
        const currentMode = dragModeRef.current;

        if (currentMode === 'reorder' && (above || below)) {
          updateMode('detach-armed');
        } else if (currentMode === 'detach-armed') {
          // Hysteresis: must come back closer than half threshold to revert
          const withinHysteresis =
            e.clientY >= rect.top - hysteresis && e.clientY <= rect.bottom + hysteresis;
          if (withinHysteresis) {
            updateMode('reorder');
          }
        }
      };

      listenerRef.current = onPointerMove;
      document.addEventListener('pointermove', onPointerMove);
    },
    [detachable, detachThresholdPx, viewportRef, updateMode],
  );

  const handleDetachDragEnd = useCallback(
    (_event: DragEndEvent) => {
      if (dragModeRef.current === 'detach-armed' && activeIdRef.current && onDetachCommit) {
        const tab = tabs.find((t) => t.id === activeIdRef.current);
        onDetachCommit({
          id: activeIdRef.current,
          payload: tab?.payload,
          screenX: pointerRef.current.screenX,
          screenY: pointerRef.current.screenY,
        });
      }
      cleanup();
    },
    [tabs, onDetachCommit, cleanup],
  );

  const handleDetachDragCancel = useCallback(() => {
    cleanup();
  }, [cleanup]);

  return {
    dragMode,
    dragModeRef,
    handleDetachDragStart,
    handleDetachDragEnd,
    handleDetachDragCancel,
  };
}
