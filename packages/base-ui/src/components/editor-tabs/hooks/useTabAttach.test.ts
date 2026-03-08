import { renderHook, act } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createElement, type ReactNode } from 'react';
import { useTabAttach } from './useTabAttach';
import { TabDragBrokerProvider, useTabDragBroker } from '../context/TabDragBroker';
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

describe('useTabAttach', () => {
  it('returns isDropTarget false and insertIndex null without broker', () => {
    const viewportRef = { current: document.createElement('div') };
    const { result } = renderHook(() =>
      useTabAttach({
        instanceId: 'test',
        viewportRef,
      }),
    );

    expect(result.current.isDropTarget).toBe(false);
    expect(result.current.insertIndex).toBeNull();
  });

  it('returns stable values across re-renders without broker', () => {
    const viewportRef = { current: document.createElement('div') };
    const { result, rerender } = renderHook(() =>
      useTabAttach({
        instanceId: 'test',
        viewportRef,
      }),
    );

    const first = result.current;
    rerender();
    expect(result.current.isDropTarget).toBe(first.isDropTarget);
    expect(result.current.insertIndex).toBe(first.insertIndex);
  });

  it('registers drop zone with broker and computes insertIndex on pointerup', () => {
    // Create a viewport with two tab elements at known positions
    const viewport = document.createElement('div');
    const tab1 = document.createElement('div');
    tab1.setAttribute('data-tab-id', 'a');
    const tab2 = document.createElement('div');
    tab2.setAttribute('data-tab-id', 'b');
    viewport.appendChild(tab1);
    viewport.appendChild(tab2);

    // Tab A: left=0, width=100  → midpoint=50
    // Tab B: left=100, width=100 → midpoint=150
    tab1.getBoundingClientRect = () => ({
      left: 0, right: 100, top: 0, bottom: 30, width: 100, height: 30, x: 0, y: 0, toJSON: () => {},
    });
    tab2.getBoundingClientRect = () => ({
      left: 100, right: 200, top: 0, bottom: 30, width: 100, height: 30, x: 100, y: 0, toJSON: () => {},
    });
    viewport.getBoundingClientRect = () => ({
      left: 0, right: 200, top: 0, bottom: 30, width: 200, height: 30, x: 0, y: 0, toJSON: () => {},
    });

    const viewportRef = { current: viewport };
    const onAttachTab = vi.fn();
    const fakeTab: TabDescriptor = { id: 'x', title: 'x.ts' };

    const addSpy = vi.spyOn(document, 'addEventListener');

    function wrapper({ children }: { children: ReactNode }) {
      return createElement(TabDragBrokerProvider, null, children);
    }

    const { result } = renderHook(
      () => ({
        attach: useTabAttach({ instanceId: 'target', viewportRef, onAttachTab }),
        broker: useTabDragBroker(),
      }),
      { wrapper },
    );

    // Start a broker session from a different instance
    act(() => {
      result.current.broker!.beginSession(
        { tab: fakeTab, sourceInstanceId: 'other' },
        30,
        15,
      );
    });

    // Grab the pointerup handler the broker registered
    const upCall = addSpy.mock.calls.find((c) => c[0] === 'pointerup');
    expect(upCall).toBeDefined();
    const upHandler = upCall![1] as (e: PointerEvent) => void;

    // Drop at x=30 which is left of tab A midpoint (50) → insertIndex 0
    act(() => {
      upHandler(new PointerEvent('pointerup', { clientX: 30, clientY: 15 }));
    });

    expect(onAttachTab).toHaveBeenCalledWith(
      expect.objectContaining({
        tab: fakeTab,
        sourceInstanceId: 'other',
        insertIndex: 0,
      }),
    );
    expect(result.current.attach.isDropTarget).toBe(false); // Session cleared after commit

    addSpy.mockRestore();
  });

  it('computes correct insertIndex for various pointer positions on drop', () => {
    const viewport = document.createElement('div');
    const tab1 = document.createElement('div');
    tab1.setAttribute('data-tab-id', 'a');
    const tab2 = document.createElement('div');
    tab2.setAttribute('data-tab-id', 'b');
    viewport.appendChild(tab1);
    viewport.appendChild(tab2);

    tab1.getBoundingClientRect = () => ({
      left: 0, right: 100, top: 0, bottom: 30, width: 100, height: 30, x: 0, y: 0, toJSON: () => {},
    });
    tab2.getBoundingClientRect = () => ({
      left: 100, right: 200, top: 0, bottom: 30, width: 100, height: 30, x: 100, y: 0, toJSON: () => {},
    });
    viewport.getBoundingClientRect = () => ({
      left: 0, right: 200, top: 0, bottom: 30, width: 200, height: 30, x: 0, y: 0, toJSON: () => {},
    });

    const viewportRef = { current: viewport };
    const onAttachTab = vi.fn();
    const fakeTab: TabDescriptor = { id: 'x', title: 'x.ts' };

    const addSpy = vi.spyOn(document, 'addEventListener');

    function wrapper({ children }: { children: ReactNode }) {
      return createElement(TabDragBrokerProvider, null, children);
    }

    const { result } = renderHook(
      () => ({
        attach: useTabAttach({ instanceId: 'target', viewportRef, onAttachTab }),
        broker: useTabDragBroker(),
      }),
      { wrapper },
    );

    // Drop at x=60 — past tab A midpoint (50) but before tab B midpoint (150) → insertIndex 1
    act(() => {
      result.current.broker!.beginSession(
        { tab: fakeTab, sourceInstanceId: 'other' },
        60, 15,
      );
    });

    const upCall1 = addSpy.mock.calls.find((c) => c[0] === 'pointerup');
    const upHandler1 = upCall1![1] as (e: PointerEvent) => void;

    act(() => {
      upHandler1(new PointerEvent('pointerup', { clientX: 60, clientY: 15 }));
    });

    expect(onAttachTab).toHaveBeenLastCalledWith(
      expect.objectContaining({ insertIndex: 1 }),
    );

    // Drop at x=160 — past tab B midpoint (150) → insertIndex 2
    addSpy.mockClear();
    act(() => {
      result.current.broker!.beginSession(
        { tab: fakeTab, sourceInstanceId: 'other' },
        160, 15,
      );
    });

    const upCall2 = addSpy.mock.calls.find((c) => c[0] === 'pointerup');
    const upHandler2 = upCall2![1] as (e: PointerEvent) => void;

    act(() => {
      upHandler2(new PointerEvent('pointerup', { clientX: 160, clientY: 15 }));
    });

    expect(onAttachTab).toHaveBeenLastCalledWith(
      expect.objectContaining({ insertIndex: 2 }),
    );

    addSpy.mockRestore();
  });
});
