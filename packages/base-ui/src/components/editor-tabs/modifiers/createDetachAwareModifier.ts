import type { Modifier } from '@dnd-kit/core';
import type { DragMode } from '../types';

export function createDetachAwareModifier(dragModeRef: React.RefObject<DragMode>): Modifier {
  return ({ transform, draggingNodeRect, scrollableAncestorRects }) => {
    if (dragModeRef.current === 'detach-armed') {
      return transform;
    }

    // Reorder mode: restrict to horizontal axis + clamp to visible scroll area
    const ancestor = scrollableAncestorRects[0];
    let clampedX = transform.x;

    if (draggingNodeRect && ancestor) {
      clampedX = Math.min(
        Math.max(transform.x, ancestor.left - draggingNodeRect.left),
        ancestor.right - draggingNodeRect.right,
      );
    }

    return {
      ...transform,
      x: clampedX,
      y: 0,
    };
  };
}
