import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTabDetach } from './useTabDetach';
import type { TabDescriptor } from '../types';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';

function createMockViewportRef(rect: Partial<DOMRect> = {}) {
  const el = document.createElement('div');
  el.getBoundingClientRect = () => ({
    top: 100,
    bottom: 140,
    left: 0,
    right: 800,
    width: 800,
    height: 40,
    x: 0,
    y: 100,
    toJSON: () => {},
    ...rect,
  });
  return { current: el };
}

const tabs: TabDescriptor[] = [
  { id: 'tab1', title: 'Tab 1', payload: { file: 'a.ts' } },
  { id: 'tab2', title: 'Tab 2' },
];

function makeDragStartEvent(id: string): DragStartEvent {
  return {
    active: { id, data: { current: undefined }, rect: { current: { initial: null, translated: null } } },
    activatorEvent: new PointerEvent('pointerdown'),
  } as unknown as DragStartEvent;
}

function makeDragEndEvent(id: string): DragEndEvent {
  return {
    active: { id, data: { current: undefined }, rect: { current: { initial: null, translated: null } } },
    activatorEvent: new PointerEvent('pointerup'),
    collisions: null,
    delta: { x: 0, y: 0 },
    over: null,
  } as unknown as DragEndEvent;
}

describe('useTabDetach', () => {
  let addSpy: ReturnType<typeof vi.spyOn>;
  let removeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addSpy = vi.spyOn(document, 'addEventListener');
    removeSpy = vi.spyOn(document, 'removeEventListener');
  });

  afterEach(() => {
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('starts in idle mode', () => {
    const viewportRef = createMockViewportRef();
    const { result } = renderHook(() =>
      useTabDetach({ detachable: true, detachThresholdPx: 18, viewportRef, tabs }),
    );
    expect(result.current.dragMode).toBe('idle');
  });

  it('stays idle when detachable is false', () => {
    const viewportRef = createMockViewportRef();
    const { result } = renderHook(() =>
      useTabDetach({ detachable: false, detachThresholdPx: 18, viewportRef, tabs }),
    );

    act(() => {
      result.current.handleDetachDragStart(makeDragStartEvent('tab1'));
    });

    expect(result.current.dragMode).toBe('idle');
    expect(addSpy).not.toHaveBeenCalledWith('pointermove', expect.any(Function));
  });

  it('transitions to reorder on drag start', () => {
    const viewportRef = createMockViewportRef();
    const { result } = renderHook(() =>
      useTabDetach({ detachable: true, detachThresholdPx: 18, viewportRef, tabs }),
    );

    act(() => {
      result.current.handleDetachDragStart(makeDragStartEvent('tab1'));
    });

    expect(result.current.dragMode).toBe('reorder');
    expect(addSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
  });

  it('transitions to detach-armed when pointer exceeds threshold above strip', () => {
    const viewportRef = createMockViewportRef({ top: 100, bottom: 140 });
    const { result } = renderHook(() =>
      useTabDetach({ detachable: true, detachThresholdPx: 18, viewportRef, tabs }),
    );

    act(() => {
      result.current.handleDetachDragStart(makeDragStartEvent('tab1'));
    });

    // Simulate pointer move above threshold (100 - 18 - 1 = 81)
    const pointerMoveHandler = addSpy.mock.calls.find(
      (call) => call[0] === 'pointermove',
    )?.[1] as EventListener;
    expect(pointerMoveHandler).toBeDefined();

    act(() => {
      pointerMoveHandler(new PointerEvent('pointermove', { clientY: 81, screenX: 500, screenY: 200 }));
    });

    // The ref is updated synchronously; state update is batched via rAF
    expect(result.current.dragModeRef.current).toBe('detach-armed');
  });

  it('stays in reorder when pointer is within threshold', () => {
    const viewportRef = createMockViewportRef({ top: 100, bottom: 140 });
    const { result } = renderHook(() =>
      useTabDetach({ detachable: true, detachThresholdPx: 18, viewportRef, tabs }),
    );

    act(() => {
      result.current.handleDetachDragStart(makeDragStartEvent('tab1'));
    });

    const pointerMoveHandler = addSpy.mock.calls.find(
      (call) => call[0] === 'pointermove',
    )?.[1] as EventListener;

    act(() => {
      // Pointer at 83 is within threshold (100 - 18 + 1 = 83)
      pointerMoveHandler(new PointerEvent('pointermove', { clientY: 83, screenX: 500, screenY: 200 }));
    });

    expect(result.current.dragModeRef.current).toBe('reorder');
  });

  it('calls onDetachCommit when drag ends in detach-armed mode', () => {
    const viewportRef = createMockViewportRef({ top: 100, bottom: 140 });
    const onDetachCommit = vi.fn();
    const { result } = renderHook(() =>
      useTabDetach({ detachable: true, detachThresholdPx: 18, viewportRef, tabs, onDetachCommit }),
    );

    act(() => {
      result.current.handleDetachDragStart(makeDragStartEvent('tab1'));
    });

    const pointerMoveHandler = addSpy.mock.calls.find(
      (call) => call[0] === 'pointermove',
    )?.[1] as EventListener;

    act(() => {
      pointerMoveHandler(new PointerEvent('pointermove', { clientY: 50, screenX: 500, screenY: 200 }));
    });

    expect(result.current.dragModeRef.current).toBe('detach-armed');

    act(() => {
      result.current.handleDetachDragEnd(makeDragEndEvent('tab1'));
    });

    expect(onDetachCommit).toHaveBeenCalledWith({
      id: 'tab1',
      payload: { file: 'a.ts' },
      screenX: 500,
      screenY: 200,
    });
  });

  it('does not call onDetachCommit when drag ends in reorder mode', () => {
    const viewportRef = createMockViewportRef();
    const onDetachCommit = vi.fn();
    const { result } = renderHook(() =>
      useTabDetach({ detachable: true, detachThresholdPx: 18, viewportRef, tabs, onDetachCommit }),
    );

    act(() => {
      result.current.handleDetachDragStart(makeDragStartEvent('tab1'));
    });

    act(() => {
      result.current.handleDetachDragEnd(makeDragEndEvent('tab1'));
    });

    expect(onDetachCommit).not.toHaveBeenCalled();
  });

  it('cleans up pointermove listener on cancel', () => {
    const viewportRef = createMockViewportRef();
    const { result } = renderHook(() =>
      useTabDetach({ detachable: true, detachThresholdPx: 18, viewportRef, tabs }),
    );

    act(() => {
      result.current.handleDetachDragStart(makeDragStartEvent('tab1'));
    });

    const pointerMoveHandler = addSpy.mock.calls.find(
      (call) => call[0] === 'pointermove',
    )?.[1];

    act(() => {
      result.current.handleDetachDragCancel();
    });

    expect(removeSpy).toHaveBeenCalledWith('pointermove', pointerMoveHandler);
    expect(result.current.dragMode).toBe('idle');
  });

  it('reverts to reorder when pointer returns within hysteresis zone', () => {
    const viewportRef = createMockViewportRef({ top: 100, bottom: 140 });
    const { result } = renderHook(() =>
      useTabDetach({ detachable: true, detachThresholdPx: 18, viewportRef, tabs }),
    );

    act(() => {
      result.current.handleDetachDragStart(makeDragStartEvent('tab1'));
    });

    const pointerMoveHandler = addSpy.mock.calls.find(
      (call) => call[0] === 'pointermove',
    )?.[1] as EventListener;

    // Move above threshold
    act(() => {
      pointerMoveHandler(new PointerEvent('pointermove', { clientY: 50, screenX: 0, screenY: 0 }));
    });
    expect(result.current.dragModeRef.current).toBe('detach-armed');

    // Move back within hysteresis (threshold/2 = 9, so within 100 - 9 = 91)
    act(() => {
      pointerMoveHandler(new PointerEvent('pointermove', { clientY: 92, screenX: 0, screenY: 0 }));
    });
    expect(result.current.dragModeRef.current).toBe('reorder');
  });
});
