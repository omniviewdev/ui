import { renderHook, act } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TabDragBrokerProvider,
  useTabDragBroker,
  type DropZoneRegistration,
} from './TabDragBroker';
import type { TabDescriptor, TabDragPointer, TabDragTransport } from '../types';
import { createFakeTabDragTransport } from '../../../test/fakeTabDragTransport';

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

beforeEach(() => {
  // Flush the broker's rAF-batched hover updates synchronously.
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const fakeTab: TabDescriptor = { id: 'tab1', title: 'index.ts' };

const startPointer: TabDragPointer = { clientX: 100, clientY: 200, screenX: 1100, screenY: 1200 };

function rect(left: number, top: number, right: number, bottom: number): DOMRect {
  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
    x: left,
    y: top,
    toJSON: () => ({}),
  };
}

function dropZone(
  instanceId: string,
  zoneRect: DOMRect,
  overrides: Partial<DropZoneRegistration> = {},
): DropZoneRegistration {
  return {
    instanceId,
    getRect: () => zoneRect,
    getElement: () => document.createElement('div'),
    onAttach: vi.fn(),
    ...overrides,
  };
}

function firePointer(type: 'pointermove' | 'pointerup', init: PointerEventInit) {
  act(() => {
    document.dispatchEvent(new PointerEvent(type, init));
  });
}

function renderBroker({
  onCancel,
  transport,
}: { onCancel?: () => void; transport?: TabDragTransport } = {}) {
  return renderHook(() => useTabDragBroker()!, {
    wrapper: ({ children }) => (
      <TabDragBrokerProvider onCancel={onCancel} transport={transport}>
        {children}
      </TabDragBrokerProvider>
    ),
  });
}

describe('TabDragBroker', () => {
  it('returns null outside provider', () => {
    const { result } = renderHook(() => useTabDragBroker());
    expect(result.current).toBeNull();
  });

  it('returns broker value inside provider', () => {
    const { result } = renderBroker();
    expect(result.current.activeSession).toBeNull();
    expect(result.current.hoverInsertIndex).toBeNull();
  });

  it('beginSession sets the active session and ignores a second session', () => {
    const { result } = renderBroker();

    act(() => {
      result.current.beginSession({ tab: fakeTab, sourceInstanceId: 'src' }, startPointer);
    });
    act(() => {
      result.current.beginSession(
        { tab: { id: 'tab2', title: 'other.ts' }, sourceInstanceId: 'other' },
        startPointer,
      );
    });

    expect(result.current.activeSession!.tab.id).toBe('tab1');

    act(() => {
      result.current.clearSession();
    });
  });

  it('cancelSession calls onCancel and reports a cancelled outcome', () => {
    const onCancel = vi.fn();
    const onOutcome = vi.fn();
    const { transport } = createFakeTabDragTransport();
    const { result } = renderBroker({ onCancel, transport });

    act(() => {
      result.current.beginSession(
        { tab: fakeTab, sourceInstanceId: 'src', onOutcome },
        startPointer,
      );
    });
    act(() => {
      result.current.cancelSession();
    });

    expect(result.current.activeSession).toBeNull();
    expect(onCancel).toHaveBeenCalledWith(expect.objectContaining({ tab: fakeTab }));
    expect(onOutcome).toHaveBeenCalledExactlyOnceWith({ type: 'cancelled' });
    expect(transport.cancel).toHaveBeenCalledWith(transport.begin.mock.calls[0]![0]);
  });

  it('clearSession ends the session without onCancel or an outcome', () => {
    const onCancel = vi.fn();
    const onOutcome = vi.fn();
    const { result } = renderBroker({ onCancel });

    act(() => {
      result.current.beginSession(
        { tab: fakeTab, sourceInstanceId: 'src', onOutcome },
        startPointer,
      );
    });
    act(() => {
      result.current.clearSession();
    });

    expect(result.current.activeSession).toBeNull();
    expect(onCancel).not.toHaveBeenCalled();
    expect(onOutcome).not.toHaveBeenCalled();
  });

  it('Escape cancels the session', () => {
    const onCancel = vi.fn();
    const onOutcome = vi.fn();
    const { result } = renderBroker({ onCancel });

    act(() => {
      result.current.beginSession(
        { tab: fakeTab, sourceInstanceId: 'src', onOutcome },
        startPointer,
      );
    });
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(result.current.activeSession).toBeNull();
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOutcome).toHaveBeenCalledExactlyOnceWith({ type: 'cancelled' });

    // The session is over: a later release does nothing.
    firePointer('pointerup', { clientX: 500, clientY: 500 });
    expect(onOutcome).toHaveBeenCalledTimes(1);
  });

  describe('release without a transport', () => {
    it('over a local zone attaches the tab and reports a transfer', () => {
      const onCancel = vi.fn();
      const onOutcome = vi.fn();
      const zone = dropZone('target', rect(50, 50, 250, 100));
      const { result } = renderBroker({ onCancel });

      act(() => {
        result.current.registerDropZone(zone);
        result.current.beginSession(
          { tab: fakeTab, sourceInstanceId: 'src', onOutcome },
          startPointer,
        );
      });
      // clientY=140 is outside the raw rect but inside the default 60px expansion.
      firePointer('pointerup', { clientX: 100, clientY: 140 });

      expect(zone.onAttach).toHaveBeenCalledWith({
        tab: fakeTab,
        sourceInstanceId: 'src',
        insertIndex: 0,
      });
      expect(onOutcome).toHaveBeenCalledExactlyOnceWith({
        type: 'transferred',
        targetInstanceId: 'target',
      });
      expect(onCancel).not.toHaveBeenCalled();
      expect(result.current.activeSession).toBeNull();
    });

    it('over nothing tears off when the source allows it', () => {
      const onOutcome = vi.fn();
      const { result } = renderBroker();

      act(() => {
        result.current.beginSession(
          { tab: fakeTab, sourceInstanceId: 'src', allowTearOff: true, onOutcome },
          startPointer,
        );
      });
      firePointer('pointerup', { clientX: 500, clientY: 500, screenX: 1500, screenY: 1600 });

      expect(onOutcome).toHaveBeenCalledExactlyOnceWith({
        type: 'torn-off',
        clientX: 500,
        clientY: 500,
        screenX: 1500,
        screenY: 1600,
      });
    });

    it('over nothing cancels when the source cannot tear off', () => {
      const onCancel = vi.fn();
      const onOutcome = vi.fn();
      const { result } = renderBroker({ onCancel });

      act(() => {
        result.current.beginSession(
          { tab: fakeTab, sourceInstanceId: 'src', onOutcome },
          startPointer,
        );
      });
      firePointer('pointerup', { clientX: 500, clientY: 500 });

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onOutcome).toHaveBeenCalledExactlyOnceWith({ type: 'cancelled' });
    });
  });

  describe('hit-testing', () => {
    it('only matches zones of the session drag type', () => {
      const onOutcome = vi.fn();
      const otherTypeZone = dropZone('other-type', rect(0, 0, 400, 100), {
        dragType: 'other-type',
      });
      const { result } = renderBroker();

      act(() => {
        result.current.registerDropZone(otherTypeZone);
        result.current.beginSession(
          { tab: fakeTab, sourceInstanceId: 'src', onOutcome },
          startPointer,
        );
      });
      firePointer('pointermove', { clientX: 100, clientY: 50 });
      expect(result.current.hoverInstanceId).toBeNull();

      firePointer('pointerup', { clientX: 100, clientY: 50 });
      expect(otherTypeZone.onAttach).not.toHaveBeenCalled();
      expect(onOutcome).toHaveBeenCalledWith({ type: 'cancelled' });
    });

    it('matches a zone with a custom drag type for sessions of that type', () => {
      const zone = dropZone('drawer', rect(0, 0, 400, 100), { dragType: 'drawer-tab' });
      const { result } = renderBroker();

      act(() => {
        result.current.registerDropZone(zone);
        result.current.beginSession(
          { tab: fakeTab, sourceInstanceId: 'src', dragType: 'drawer-tab' },
          startPointer,
        );
      });
      firePointer('pointermove', { clientX: 100, clientY: 50 });

      expect(result.current.hoverInstanceId).toBe('drawer');
      expect(result.current.hoverInsertIndex).toBe(0);
    });

    it('prefers a raw rect hit over an expanded rect hit', () => {
      const upperZone = dropZone('upper', rect(0, 0, 400, 30));
      const lowerZone = dropZone('lower', rect(0, 60, 400, 90));
      const { result } = renderBroker();

      act(() => {
        result.current.registerDropZone(upperZone);
        result.current.registerDropZone(lowerZone);
        result.current.beginSession({ tab: fakeTab, sourceInstanceId: 'src' }, startPointer);
      });
      // Inside upper's expansion, inside lower's raw rect.
      firePointer('pointermove', { clientX: 100, clientY: 70 });

      expect(result.current.hoverInstanceId).toBe('lower');
    });

    it('uses the zone expandY for the second pass', () => {
      const zone = dropZone('tight', rect(0, 0, 400, 30), { expandY: 5 });
      const { result } = renderBroker();

      act(() => {
        result.current.registerDropZone(zone);
        result.current.beginSession({ tab: fakeTab, sourceInstanceId: 'src' }, startPointer);
      });
      firePointer('pointermove', { clientX: 100, clientY: 34 });
      expect(result.current.hoverInstanceId).toBe('tight');

      firePointer('pointermove', { clientX: 100, clientY: 50 });
      expect(result.current.hoverInstanceId).toBeNull();

      act(() => {
        result.current.clearSession();
      });
    });

    it('never matches the source zone', () => {
      const sourceZone = dropZone('src', rect(0, 0, 400, 100));
      const { result } = renderBroker();

      act(() => {
        result.current.registerDropZone(sourceZone);
        result.current.beginSession({ tab: fakeTab, sourceInstanceId: 'src' }, startPointer);
      });
      firePointer('pointermove', { clientX: 100, clientY: 50 });
      expect(result.current.hoverInstanceId).toBeNull();

      act(() => {
        result.current.clearSession();
      });
    });
  });

  it('hides the source ghost while the pointer is outside the viewport', () => {
    const { result } = renderBroker();

    act(() => {
      result.current.beginSession({ tab: fakeTab, sourceInstanceId: 'src' }, startPointer);
    });
    expect(document.querySelector('[data-tab-drag-ghost]')).not.toBeNull();

    firePointer('pointermove', { clientX: -20, clientY: 100 });
    expect(document.querySelector('[data-tab-drag-ghost]')).toBeNull();

    firePointer('pointermove', { clientX: 20, clientY: 100 });
    expect(document.querySelector('[data-tab-drag-ghost]')).not.toBeNull();

    act(() => {
      result.current.clearSession();
    });
  });

  describe('source side with a transport', () => {
    it('sends a serializable payload on begin and every pointer move', () => {
      const { transport } = createFakeTabDragTransport();
      const { result } = renderBroker({ transport });

      act(() => {
        result.current.beginSession(
          {
            tab: { ...fakeTab, icon: <span />, payload: { path: '/src/index.ts' } },
            sourceInstanceId: 'src',
            ghostStyle: { '--_ov-tab-height': '28px', opacity: 0.5 } as React.CSSProperties,
          },
          startPointer,
        );
      });

      const [sessionId, payload, point] = transport.begin.mock.calls[0]!;
      expect(point).toEqual(startPointer);
      expect(payload).toEqual({
        tab: { id: 'tab1', title: 'index.ts', icon: undefined, payload: { path: '/src/index.ts' } },
        sourceInstanceId: 'src',
        dragType: 'editor-tab',
        ghostStyle: { '--_ov-tab-height': '28px', opacity: '0.5' },
      });

      firePointer('pointermove', { clientX: 1, clientY: 2, screenX: 3, screenY: 4 });
      firePointer('pointermove', { clientX: 5, clientY: 6, screenX: 7, screenY: 8 });
      expect(transport.move.mock.calls).toEqual([
        [sessionId, { clientX: 1, clientY: 2, screenX: 3, screenY: 4 }],
        [sessionId, { clientX: 5, clientY: 6, screenX: 7, screenY: 8 }],
      ]);

      act(() => {
        result.current.clearSession();
      });
      expect(transport.cancel).toHaveBeenCalledWith(sessionId);
    });

    it('a local zone wins without asking the transport', () => {
      const onOutcome = vi.fn();
      const { transport } = createFakeTabDragTransport({ targetInstanceId: 'remote' });
      const zone = dropZone('target', rect(0, 0, 400, 100));
      const { result } = renderBroker({ transport });

      act(() => {
        result.current.registerDropZone(zone);
        result.current.beginSession(
          { tab: fakeTab, sourceInstanceId: 'src', onOutcome },
          startPointer,
        );
      });
      firePointer('pointerup', { clientX: 100, clientY: 50 });

      expect(transport.drop).not.toHaveBeenCalled();
      expect(transport.cancel).toHaveBeenCalledTimes(1);
      expect(zone.onAttach).toHaveBeenCalledTimes(1);
      expect(onOutcome).toHaveBeenCalledExactlyOnceWith({
        type: 'transferred',
        targetInstanceId: 'target',
      });
    });

    it('reports a transfer when a remote document accepts the drop', async () => {
      const onCancel = vi.fn();
      const onOutcome = vi.fn();
      const { transport } = createFakeTabDragTransport({ targetInstanceId: 'remote-strip' });
      const { result } = renderBroker({ onCancel, transport });

      act(() => {
        result.current.beginSession(
          { tab: fakeTab, sourceInstanceId: 'src', allowTearOff: true, onOutcome },
          startPointer,
        );
      });
      firePointer('pointerup', { clientX: 2000, clientY: 50, screenX: 2100, screenY: 150 });

      const sessionId = transport.begin.mock.calls[0]![0];
      expect(transport.drop).toHaveBeenCalledWith(sessionId, {
        clientX: 2000,
        clientY: 50,
        screenX: 2100,
        screenY: 150,
      });
      await act(async () => {});

      expect(onOutcome).toHaveBeenCalledExactlyOnceWith({
        type: 'transferred',
        targetInstanceId: 'remote-strip',
      });
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('tears off when no remote document accepts the drop', async () => {
      const onOutcome = vi.fn();
      const { transport } = createFakeTabDragTransport(null);
      const { result } = renderBroker({ transport });

      act(() => {
        result.current.beginSession(
          { tab: fakeTab, sourceInstanceId: 'src', allowTearOff: true, onOutcome },
          startPointer,
        );
      });
      firePointer('pointerup', { clientX: 2000, clientY: 50, screenX: 2100, screenY: 150 });
      await act(async () => {});

      expect(onOutcome).toHaveBeenCalledExactlyOnceWith({
        type: 'torn-off',
        clientX: 2000,
        clientY: 50,
        screenX: 2100,
        screenY: 150,
      });
    });

    it('ignores a second release, Escape and new sessions while the drop is pending', async () => {
      const onCancel = vi.fn();
      const onOutcome = vi.fn();
      const { transport } = createFakeTabDragTransport();
      let resolveDrop: (result: { targetInstanceId: string } | null) => void = () => {};
      transport.drop.mockReturnValue(
        new Promise((resolve) => {
          resolveDrop = resolve;
        }),
      );
      const { result } = renderBroker({ onCancel, transport });

      act(() => {
        result.current.beginSession(
          { tab: fakeTab, sourceInstanceId: 'src', onOutcome },
          startPointer,
        );
      });
      firePointer('pointerup', { clientX: 2000, clientY: 50 });
      firePointer('pointerup', { clientX: 2000, clientY: 50 });
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        result.current.cancelSession();
        result.current.beginSession({ tab: fakeTab, sourceInstanceId: 'src' }, startPointer);
      });

      expect(transport.drop).toHaveBeenCalledTimes(1);
      expect(transport.begin).toHaveBeenCalledTimes(1);
      expect(result.current.activeSession).toBeNull();
      expect(onOutcome).not.toHaveBeenCalled();

      await act(async () => {
        resolveDrop({ targetInstanceId: 'remote-strip' });
      });

      expect(onCancel).not.toHaveBeenCalled();
      expect(onOutcome).toHaveBeenCalledExactlyOnceWith({
        type: 'transferred',
        targetInstanceId: 'remote-strip',
      });
    });

    it.each([
      [
        'throws synchronously',
        () => {
          throw new Error('bridge unavailable');
        },
      ],
      ['rejects', () => Promise.reject(new Error('bridge unavailable'))],
    ])('cancels and accepts a new session when the transport drop %s', async (_, failingDrop) => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onCancel = vi.fn();
      const onOutcome = vi.fn();
      const { transport } = createFakeTabDragTransport();
      transport.drop.mockImplementation(failingDrop);
      const { result } = renderBroker({ onCancel, transport });

      act(() => {
        result.current.beginSession(
          { tab: fakeTab, sourceInstanceId: 'src', allowTearOff: true, onOutcome },
          startPointer,
        );
      });
      firePointer('pointerup', { clientX: 2000, clientY: 50 });
      await act(async () => {});

      expect(onOutcome).toHaveBeenCalledExactlyOnceWith({ type: 'cancelled' });
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenCalledWith(
        'TabDragTransport.drop failed',
        new Error('bridge unavailable'),
      );

      act(() => {
        result.current.beginSession({ tab: fakeTab, sourceInstanceId: 'src' }, startPointer);
      });
      expect(transport.begin).toHaveBeenCalledTimes(2);
      expect(result.current.activeSession).not.toBeNull();
      consoleError.mockRestore();
    });

    it('drops the outcome when the provider unmounts while the drop is pending', async () => {
      const onOutcome = vi.fn();
      const { transport } = createFakeTabDragTransport();
      let resolveDrop: (result: { targetInstanceId: string } | null) => void = () => {};
      transport.drop.mockReturnValue(
        new Promise((resolve) => {
          resolveDrop = resolve;
        }),
      );
      const { result, unmount } = renderBroker({ transport });

      act(() => {
        result.current.beginSession(
          { tab: fakeTab, sourceInstanceId: 'src', onOutcome },
          startPointer,
        );
      });
      firePointer('pointerup', { clientX: 2000, clientY: 50 });
      unmount();

      await act(async () => {
        resolveDrop({ targetInstanceId: 'remote-strip' });
      });

      expect(transport.cancel).not.toHaveBeenCalled();
      expect(onOutcome).not.toHaveBeenCalled();
    });

    it('cancels the transport session when unmounted mid-drag', () => {
      const { transport } = createFakeTabDragTransport();
      const { result, unmount } = renderBroker({ transport });

      act(() => {
        result.current.beginSession({ tab: fakeTab, sourceInstanceId: 'src' }, startPointer);
      });
      unmount();

      expect(transport.cancel).toHaveBeenCalledWith(transport.begin.mock.calls[0]![0]);
    });
  });

  describe('target side with a transport', () => {
    const remotePayload = {
      tab: { id: 'remote-tab', title: 'remote.ts' },
      sourceInstanceId: 'other-window-strip',
      dragType: 'editor-tab',
      ghostStyle: { '--_ov-tab-height': '28px' },
    };

    it('hover sets the hover target and renders the ghost; leave clears it', () => {
      const { transport, emitRemoteEvent } = createFakeTabDragTransport();
      const { result } = renderBroker({ transport });

      act(() => {
        result.current.registerDropZone(dropZone('target', rect(0, 0, 400, 30)));
      });
      act(() => {
        emitRemoteEvent({
          type: 'hover',
          sessionId: 's1',
          payload: remotePayload,
          clientX: 120,
          clientY: 10,
        });
      });

      expect(result.current.hoverInstanceId).toBe('target');
      expect(result.current.hoverInsertIndex).toBe(0);
      expect(result.current.pointerX).toBe(120);
      expect(result.current.activeSession).toBeNull();
      expect(document.querySelector('[data-tab-drag-ghost]')?.textContent).toBe('remote.ts');

      act(() => {
        emitRemoteEvent({ type: 'leave', sessionId: 's1' });
      });

      expect(result.current.hoverInstanceId).toBeNull();
      expect(result.current.hoverInsertIndex).toBeNull();
      expect(document.querySelector('[data-tab-drag-ghost]')).toBeNull();
    });

    it('end clears the remote hover', () => {
      const { transport, emitRemoteEvent } = createFakeTabDragTransport();
      const { result } = renderBroker({ transport });

      act(() => {
        result.current.registerDropZone(dropZone('target', rect(0, 0, 400, 30)));
        emitRemoteEvent({
          type: 'hover',
          sessionId: 's1',
          payload: remotePayload,
          clientX: 120,
          clientY: 10,
        });
      });
      act(() => {
        emitRemoteEvent({ type: 'end', sessionId: 's1' });
      });

      expect(result.current.hoverInstanceId).toBeNull();
      expect(document.querySelector('[data-tab-drag-ghost]')).toBeNull();
    });

    it('hover ignores zones of another drag type', () => {
      const { transport, emitRemoteEvent } = createFakeTabDragTransport();
      const { result } = renderBroker({ transport });

      act(() => {
        result.current.registerDropZone(
          dropZone('typed', rect(0, 0, 400, 30), { dragType: 'other-type' }),
        );
        emitRemoteEvent({
          type: 'hover',
          sessionId: 's1',
          payload: remotePayload,
          clientX: 120,
          clientY: 10,
        });
      });

      expect(result.current.hoverInstanceId).toBeNull();
    });

    it('drop over a zone attaches the tab and responds with the zone id', () => {
      const { transport, emitRemoteEvent } = createFakeTabDragTransport();
      const zone = dropZone('target', rect(0, 0, 400, 30));
      const respond = vi.fn();
      const { result } = renderBroker({ transport });

      act(() => {
        result.current.registerDropZone(zone);
      });
      act(() => {
        emitRemoteEvent({
          type: 'drop',
          sessionId: 's1',
          payload: remotePayload,
          clientX: 120,
          clientY: 10,
          respond,
        });
      });

      expect(zone.onAttach).toHaveBeenCalledWith({
        tab: remotePayload.tab,
        sourceInstanceId: 'other-window-strip',
        insertIndex: 0,
      });
      expect(respond).toHaveBeenCalledExactlyOnceWith({ targetInstanceId: 'target' });
    });

    it('drop over nothing responds null', () => {
      const { transport, emitRemoteEvent } = createFakeTabDragTransport();
      const zone = dropZone('target', rect(0, 0, 400, 30));
      const respond = vi.fn();
      const { result } = renderBroker({ transport });

      act(() => {
        result.current.registerDropZone(zone);
      });
      act(() => {
        emitRemoteEvent({
          type: 'drop',
          sessionId: 's1',
          payload: remotePayload,
          clientX: 120,
          clientY: 500,
          respond,
        });
      });

      expect(zone.onAttach).not.toHaveBeenCalled();
      expect(respond).toHaveBeenCalledExactlyOnceWith(null);
    });

    it('unsubscribes from the transport on unmount', () => {
      const { transport, getSubscriberCount } = createFakeTabDragTransport();
      const { unmount } = renderBroker({ transport });

      expect(getSubscriberCount()).toBe(1);
      unmount();
      expect(getSubscriberCount()).toBe(0);
    });
  });
});
