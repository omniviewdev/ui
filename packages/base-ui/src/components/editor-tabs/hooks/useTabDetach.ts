import { useCallback, useRef, useState } from 'react';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import type { TabDescriptor, DetachCommit, DragMode, TabId } from '../types';

export interface UseTabDetachOptions {
  detachable: boolean;
  detachThresholdPx: number;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  tabs: TabDescriptor[];
  onDetachCommit?: (commit: DetachCommit) => void;
  /** Called when transitioning to detach-armed (pointer still down). */
  onDetachArmed?: (tabId: TabId, screenX: number, screenY: number) => void;
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
  onDetachArmed,
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

        // Vertical escape
        const above = e.clientY < rect.top - threshold;
        const below = e.clientY > rect.bottom + threshold;
        // Horizontal escape
        const pastLeft = e.clientX < rect.left - threshold;
        const pastRight = e.clientX > rect.right + threshold;

        const currentMode = dragModeRef.current;

        if (currentMode === 'reorder' && (above || below || pastLeft || pastRight)) {
          updateMode('detach-armed');
          onDetachArmed?.(activeIdRef.current!, e.screenX, e.screenY);
        } else if (currentMode === 'detach-armed' && !onDetachArmed) {
          // Hysteresis: must come back within half-threshold on BOTH axes to revert.
          const withinY =
            e.clientY >= rect.top - hysteresis && e.clientY <= rect.bottom + hysteresis;
          const withinX =
            e.clientX >= rect.left - hysteresis && e.clientX <= rect.right + hysteresis;
          if (withinX && withinY) {
            updateMode('reorder');
          }
        }
      };

      listenerRef.current = onPointerMove;
      document.addEventListener('pointermove', onPointerMove);
    },
    [detachable, detachThresholdPx, viewportRef, updateMode, onDetachArmed],
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
