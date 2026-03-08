import { describe, expect, it } from 'vitest';
import { createDetachAwareModifier } from './createDetachAwareModifier';
import type { DragMode } from '../types';

function makeModifierArgs(
  transform: { x: number; y: number; scaleX: number; scaleY: number },
  draggingNodeRect: { left: number; right: number } | null = null,
  ancestorRect: { left: number; right: number } | null = null,
) {
  return {
    transform,
    draggingNodeRect: draggingNodeRect
      ? { left: draggingNodeRect.left, right: draggingNodeRect.right, top: 0, bottom: 0, width: 0, height: 0 }
      : null,
    scrollableAncestorRects: ancestorRect
      ? [{ left: ancestorRect.left, right: ancestorRect.right, top: 0, bottom: 0, width: 0, height: 0 }]
      : [],
    active: null,
    activatorEvent: null,
    activeNodeRect: null,
    containerNodeRect: null,
    over: null,
    overlayNodeRect: null,
    windowRect: null,
  } as Parameters<ReturnType<typeof createDetachAwareModifier>>[0];
}

describe('createDetachAwareModifier', () => {
  it('zeroes Y and clamps X in reorder mode', () => {
    const modeRef = { current: 'reorder' as DragMode };
    const modifier = createDetachAwareModifier(modeRef);

    const result = modifier(
      makeModifierArgs(
        { x: 50, y: 30, scaleX: 1, scaleY: 1 },
        { left: 100, right: 200 },
        { left: 0, right: 800 },
      ),
    );

    expect(result.y).toBe(0);
    expect(result.x).toBe(50); // Within bounds, unchanged
  });

  it('clamps X to ancestor right edge in reorder mode', () => {
    const modeRef = { current: 'reorder' as DragMode };
    const modifier = createDetachAwareModifier(modeRef);

    // Dragging node at left:700, right:800, ancestor right: 800
    // transform.x = 100 would push right edge to 900, should clamp to 0
    const result = modifier(
      makeModifierArgs(
        { x: 100, y: 10, scaleX: 1, scaleY: 1 },
        { left: 700, right: 800 },
        { left: 0, right: 800 },
      ),
    );

    expect(result.y).toBe(0);
    expect(result.x).toBe(0); // Clamped: 800 - 800 = 0
  });

  it('clamps X to ancestor left edge in reorder mode', () => {
    const modeRef = { current: 'reorder' as DragMode };
    const modifier = createDetachAwareModifier(modeRef);

    // Dragging node at left:50, right:150, ancestor left: 0
    // transform.x = -100 would push left edge to -50, should clamp to -50
    const result = modifier(
      makeModifierArgs(
        { x: -100, y: 10, scaleX: 1, scaleY: 1 },
        { left: 50, right: 150 },
        { left: 0, right: 800 },
      ),
    );

    expect(result.y).toBe(0);
    expect(result.x).toBe(-50); // Clamped: 0 - 50 = -50
  });

  it('passes through full transform in detach-armed mode', () => {
    const modeRef = { current: 'detach-armed' as DragMode };
    const modifier = createDetachAwareModifier(modeRef);

    const result = modifier(
      makeModifierArgs(
        { x: 50, y: 80, scaleX: 1, scaleY: 1 },
        { left: 100, right: 200 },
        { left: 0, right: 800 },
      ),
    );

    expect(result.x).toBe(50);
    expect(result.y).toBe(80);
  });

  it('handles missing ancestor rects gracefully in reorder mode', () => {
    const modeRef = { current: 'reorder' as DragMode };
    const modifier = createDetachAwareModifier(modeRef);

    const result = modifier(
      makeModifierArgs({ x: 50, y: 30, scaleX: 1, scaleY: 1 }),
    );

    expect(result.y).toBe(0);
    expect(result.x).toBe(50); // No clamping without ancestor
  });
});
