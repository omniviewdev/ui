import { useEffect, useRef, type RefObject } from 'react';

export type DrawerAnchor = 'left' | 'right' | 'top' | 'bottom';

interface UseDrawerResizeOptions {
  anchor: DrawerAnchor;
  minSize: number;
  maxSize: number;
  onSizeChange?: (size: number) => void;
  enabled?: boolean;
}

function isVertical(anchor: DrawerAnchor): boolean {
  return anchor === 'top' || anchor === 'bottom';
}

export function useDrawerResize(
  rootRef: RefObject<HTMLDivElement | null>,
  handleRef: RefObject<HTMLDivElement | null>,
  options: UseDrawerResizeOptions,
): void {
  const optsRef = useRef(options);
  optsRef.current = options;

  useEffect(() => {
    const handle = handleRef.current;
    const root = rootRef.current;
    if (!handle || !root || !optsRef.current.enabled) return;

    let dragging = false;
    let startPos = 0;
    let startSize = 0;
    let rafId = 0;
    let activePointerId = -1;
    let savedTransition = '';
    let lastPointerPos = 0;

    const applyResize = (pointerPos: number) => {
      const { anchor, minSize, maxSize } = optsRef.current;
      const diff = pointerPos - startPos;
      const sign = anchor === 'bottom' || anchor === 'right' ? -1 : 1;
      const newSize = Math.min(maxSize, Math.max(minSize, startSize + diff * sign));
      root.style.setProperty('--_ov-size', `${newSize}px`);
    };

    const finishDrag = () => {
      if (!dragging) return;
      dragging = false;

      // Flush any pending rAF so the last resize position is applied
      cancelAnimationFrame(rafId);
      applyResize(lastPointerPos);
      rafId = 0;

      // Restore transition
      root.style.transition = savedTransition;
      root.removeAttribute('data-ov-resizing');

      // Release pointer capture if still held
      if (activePointerId !== -1) {
        try {
          handle.releasePointerCapture(activePointerId);
        } catch {
          /* already released */
        }
        activePointerId = -1;
      }

      // Notify React of the final size
      const computed = root.style.getPropertyValue('--_ov-size');
      const parsed = parseFloat(computed);
      if (Number.isFinite(parsed)) {
        optsRef.current.onSizeChange?.(parsed);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      activePointerId = e.pointerId;
      handle.setPointerCapture(e.pointerId);

      const { anchor } = optsRef.current;
      const rect = root.getBoundingClientRect();
      startPos = isVertical(anchor) ? e.clientY : e.clientX;
      startSize = isVertical(anchor) ? rect.height : rect.width;
      lastPointerPos = startPos;

      // Save and kill transitions during drag for zero-latency feedback
      savedTransition = root.style.transition;
      root.style.transition = 'none';
      root.setAttribute('data-ov-resizing', 'true');
      e.preventDefault();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const { anchor } = optsRef.current;
      lastPointerPos = isVertical(anchor) ? e.clientY : e.clientX;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        applyResize(lastPointerPos);
      });
    };

    const onPointerUp = () => {
      finishDrag();
    };

    const onPointerCancel = () => {
      finishDrag();
    };

    const onLostPointerCapture = () => {
      finishDrag();
    };

    handle.addEventListener('pointerdown', onPointerDown);
    handle.addEventListener('lostpointercapture', onLostPointerCapture);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerCancel);

    return () => {
      // Clean up any in-flight drag
      if (dragging) {
        dragging = false;
        cancelAnimationFrame(rafId);
        root.style.transition = savedTransition;
        root.removeAttribute('data-ov-resizing');
      }
      handle.removeEventListener('pointerdown', onPointerDown);
      handle.removeEventListener('lostpointercapture', onLostPointerCapture);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [rootRef, handleRef, options.enabled, options.anchor]);
}
