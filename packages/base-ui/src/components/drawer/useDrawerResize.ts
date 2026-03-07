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

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      handle.setPointerCapture(e.pointerId);

      const { anchor } = optsRef.current;
      const rect = root.getBoundingClientRect();
      startPos = isVertical(anchor) ? e.clientY : e.clientX;
      startSize = isVertical(anchor) ? rect.height : rect.width;

      // Kill transitions during drag for zero-latency feedback
      root.style.transition = 'none';
      root.setAttribute('data-ov-resizing', 'true');
      e.preventDefault();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const { anchor, minSize, maxSize } = optsRef.current;
        const currentPos = isVertical(anchor) ? e.clientY : e.clientX;
        const diff = currentPos - startPos;

        // For bottom/right anchors, dragging toward the edge shrinks;
        // for top/left, dragging away from the edge shrinks.
        const sign = anchor === 'bottom' || anchor === 'right' ? -1 : 1;
        const newSize = Math.min(maxSize, Math.max(minSize, startSize + diff * sign));

        root.style.setProperty('--_ov-size', `${newSize}px`);
      });
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      handle.releasePointerCapture(e.pointerId);
      cancelAnimationFrame(rafId);

      // Restore transitions
      root.style.transition = '';
      root.removeAttribute('data-ov-resizing');

      // Notify React of the final size
      const computed = root.style.getPropertyValue('--_ov-size');
      const parsed = parseFloat(computed);
      if (Number.isFinite(parsed)) {
        optsRef.current.onSizeChange?.(parsed);
      }
    };

    handle.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

    return () => {
      cancelAnimationFrame(rafId);
      handle.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };
  }, [rootRef, handleRef, options.enabled]);
}
