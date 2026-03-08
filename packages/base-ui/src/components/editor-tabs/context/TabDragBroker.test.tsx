import { renderHook, act } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { TabDragBrokerProvider, useTabDragBroker } from './TabDragBroker';
import type { TabDescriptor } from '../types';

const OriginalResizeObserver = globalThis.ResizeObserver;

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterAll(() => {
  globalThis.ResizeObserver = OriginalResizeObserver;
});

const fakeTab: TabDescriptor = { id: 'tab1', title: 'index.ts' };

function wrapper({ children }: { children: React.ReactNode }) {
  return <TabDragBrokerProvider>{children}</TabDragBrokerProvider>;
}

describe('TabDragBroker', () => {
  it('returns null outside provider', () => {
    const { result } = renderHook(() => useTabDragBroker());
    expect(result.current).toBeNull();
  });

  it('returns broker value inside provider', () => {
    const { result } = renderHook(() => useTabDragBroker(), { wrapper });
    expect(result.current).not.toBeNull();
    expect(result.current!.activeSession).toBeNull();
  });

  it('beginSession sets active session and attaches listeners', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const { result } = renderHook(() => useTabDragBroker(), { wrapper });

    act(() => {
      result.current!.beginSession({ tab: fakeTab, sourceInstanceId: 'src' }, 100, 200);
    });

    expect(result.current!.activeSession).not.toBeNull();
    expect(result.current!.activeSession!.tab.id).toBe('tab1');

    const moveListeners = addSpy.mock.calls.filter((c) => c[0] === 'pointermove');
    const upListeners = addSpy.mock.calls.filter((c) => c[0] === 'pointerup');
    expect(moveListeners.length).toBeGreaterThanOrEqual(1);
    expect(upListeners.length).toBeGreaterThanOrEqual(1);

    // Clean up
    act(() => {
      result.current!.clearSession();
    });
    addSpy.mockRestore();
  });

  it('beginSession is no-op if already active', () => {
    const { result } = renderHook(() => useTabDragBroker(), { wrapper });

    act(() => {
      result.current!.beginSession({ tab: fakeTab, sourceInstanceId: 'src' }, 100, 200);
    });

    act(() => {
      result.current!.beginSession(
        { tab: { id: 'tab2', title: 'other.ts' }, sourceInstanceId: 'other' },
        300,
        400,
      );
    });

    // Still the first session
    expect(result.current!.activeSession!.tab.id).toBe('tab1');

    act(() => {
      result.current!.clearSession();
    });
  });

  it('cancelSession clears state and calls onCancel', () => {
    const onCancel = vi.fn();
    const cancelWrapper = ({ children }: { children: React.ReactNode }) => (
      <TabDragBrokerProvider onCancel={onCancel}>{children}</TabDragBrokerProvider>
    );

    const { result } = renderHook(() => useTabDragBroker(), { wrapper: cancelWrapper });

    act(() => {
      result.current!.beginSession({ tab: fakeTab, sourceInstanceId: 'src' }, 100, 200);
    });

    expect(result.current!.activeSession).not.toBeNull();

    act(() => {
      result.current!.cancelSession();
    });

    expect(result.current!.activeSession).toBeNull();
    expect(onCancel).toHaveBeenCalledWith(
      expect.objectContaining({ tab: fakeTab, sourceInstanceId: 'src' }),
    );
  });

  it('clearSession clears state without calling onCancel', () => {
    const onCancel = vi.fn();
    const cancelWrapper = ({ children }: { children: React.ReactNode }) => (
      <TabDragBrokerProvider onCancel={onCancel}>{children}</TabDragBrokerProvider>
    );

    const { result } = renderHook(() => useTabDragBroker(), { wrapper: cancelWrapper });

    act(() => {
      result.current!.beginSession({ tab: fakeTab, sourceInstanceId: 'src' }, 100, 200);
    });

    act(() => {
      result.current!.clearSession();
    });

    expect(result.current!.activeSession).toBeNull();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('pointerup outside zones calls onCancel', () => {
    const onCancel = vi.fn();
    const cancelWrapper = ({ children }: { children: React.ReactNode }) => (
      <TabDragBrokerProvider onCancel={onCancel}>{children}</TabDragBrokerProvider>
    );

    const addSpy = vi.spyOn(document, 'addEventListener');
    const { result } = renderHook(() => useTabDragBroker(), { wrapper: cancelWrapper });

    act(() => {
      result.current!.beginSession({ tab: fakeTab, sourceInstanceId: 'src' }, 100, 200);
    });

    const upCall = addSpy.mock.calls.find((c) => c[0] === 'pointerup');
    expect(upCall).toBeDefined();
    const upHandler = upCall![1] as (e: PointerEvent) => void;

    act(() => {
      upHandler(new PointerEvent('pointerup', { clientX: 500, clientY: 500 }));
    });

    expect(result.current!.activeSession).toBeNull();
    expect(onCancel).toHaveBeenCalled();

    addSpy.mockRestore();
  });

  it('pointerup over registered drop zone calls onAttach', () => {
    const onAttach = vi.fn();
    const addSpy = vi.spyOn(document, 'addEventListener');
    const { result } = renderHook(() => useTabDragBroker(), { wrapper });

    act(() => {
      result.current!.registerDropZone({
        instanceId: 'target',
        getRect: () => ({ left: 50, right: 250, top: 50, bottom: 100 }) as DOMRect,
        getElement: () => document.createElement('div'),
        onAttach,
      });
    });

    act(() => {
      result.current!.beginSession({ tab: fakeTab, sourceInstanceId: 'src' }, 100, 75);
    });

    const upCall = addSpy.mock.calls.find((c) => c[0] === 'pointerup');
    const upHandler = upCall![1] as (e: PointerEvent) => void;

    act(() => {
      // clientY=75 is within expanded zone (top: 50-60=−10, bottom: 100+60=160)
      upHandler(new PointerEvent('pointerup', { clientX: 100, clientY: 75 }));
    });

    expect(onAttach).toHaveBeenCalledWith(
      expect.objectContaining({
        tab: fakeTab,
        sourceInstanceId: 'src',
      }),
    );
    expect(result.current!.activeSession).toBeNull();

    addSpy.mockRestore();
  });

  it('register and unregister drop zones', () => {
    const { result } = renderHook(() => useTabDragBroker(), { wrapper });

    act(() => {
      result.current!.registerDropZone({
        instanceId: 'zone1',
        getRect: () => ({ left: 0, right: 100, top: 0, bottom: 50 }) as DOMRect,
        getElement: () => document.createElement('div'),
        onAttach: vi.fn(),
      });
    });

    act(() => {
      result.current!.unregisterDropZone('zone1');
    });

    expect(result.current!.hoverInstanceId).toBeNull();
  });
});
