import { act, fireEvent, screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { createFakeTabDragTransport } from '../../test/fakeTabDragTransport';
import { EditorTabs } from './EditorTabs';
import { TabDragBrokerProvider } from './context/TabDragBroker';
import type { TabDescriptor, TabGroupDescriptor, TabDragTransport } from './types';

const OriginalResizeObserver = globalThis.ResizeObserver;
const OriginalMatchMedia = window.matchMedia;

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterAll(() => {
  globalThis.ResizeObserver = OriginalResizeObserver;
  window.matchMedia = OriginalMatchMedia;
});

const baseTabs: TabDescriptor[] = [
  { id: 'file1', title: 'index.ts' },
  { id: 'file2', title: 'App.tsx' },
  { id: 'file3', title: 'styles.css' },
];

describe('EditorTabs', () => {
  it('renders tabs and selects on click', () => {
    const onActiveChange = vi.fn();
    renderWithTheme(
      <EditorTabs tabs={baseTabs} activeId="file1" onActiveChange={onActiveChange} />,
    );

    expect(screen.getByRole('tab', { name: 'index.ts' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(screen.getByRole('tab', { name: 'App.tsx' }));
    expect(onActiveChange).toHaveBeenCalledWith('file2');
  });

  it('works in uncontrolled mode', () => {
    renderWithTheme(<EditorTabs tabs={baseTabs} defaultActiveId="file1" />);

    expect(screen.getByRole('tab', { name: 'index.ts' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(screen.getByRole('tab', { name: 'App.tsx' }));
    expect(screen.getByRole('tab', { name: 'App.tsx' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'index.ts' })).toHaveAttribute('aria-selected', 'false');
  });

  it('close button fires onCloseTab without onActiveChange', () => {
    const onCloseTab = vi.fn();
    const onActiveChange = vi.fn();
    const tabs: TabDescriptor[] = [
      { id: 'file1', title: 'index.ts', closable: true },
      { id: 'file2', title: 'App.tsx', closable: true },
    ];
    renderWithTheme(
      <EditorTabs
        tabs={tabs}
        activeId="file1"
        onActiveChange={onActiveChange}
        onCloseTab={onCloseTab}
      />,
    );

    const closeButtons = screen.getAllByLabelText(/^Close /);
    fireEvent.click(closeButtons[0]!);

    expect(onCloseTab).toHaveBeenCalledWith('file1');
    expect(onActiveChange).not.toHaveBeenCalled();
  });

  it('names each tab list so strips on one page can be told apart', () => {
    renderWithTheme(
      <>
        <EditorTabs aria-label="Page tabs" tabs={[{ id: 'home', title: 'Home' }]} />
        <EditorTabs aria-label="Terminal tabs" tabs={[{ id: 'shell', title: 'zsh' }]} />
      </>,
    );

    expect(
      screen.getByRole('tab', { name: 'zsh' }).closest('[role="tablist"]'),
    ).toBe(screen.getByRole('tablist', { name: 'Terminal tabs' }));
    expect(screen.getByRole('tablist', { name: 'Page tabs' })).toContainElement(
      screen.getByRole('tab', { name: 'Home' }),
    );
  });

  it('renders pinned segment separately', () => {
    const tabs: TabDescriptor[] = [
      { id: 'pinned1', title: 'Pinned', pinned: true },
      { id: 'file1', title: 'Regular' },
    ];
    renderWithTheme(<EditorTabs tabs={tabs} activeId="pinned1" />);

    const segments = document.querySelectorAll('[data-segment]');
    expect(segments.length).toBeGreaterThanOrEqual(2);
    expect(segments[0]).toHaveAttribute('data-segment', 'pinned');
  });

  it('renders groups with group color', () => {
    const tabs: TabDescriptor[] = [
      { id: 'file1', title: 'Component.tsx', groupId: 'frontend' },
      { id: 'file2', title: 'api.ts', groupId: 'backend' },
      { id: 'file3', title: 'README.md' },
    ];
    const groups: TabGroupDescriptor[] = [
      { id: 'frontend', title: 'Frontend', color: '#4CAF50' },
      { id: 'backend', title: 'Backend', color: '#2196F3' },
    ];
    renderWithTheme(<EditorTabs tabs={tabs} groups={groups} activeId="file1" />);

    const groupSegments = document.querySelectorAll('[data-segment="group"]');
    expect(groupSegments).toHaveLength(2);
  });

  it('applies data attributes correctly', () => {
    const tabs: TabDescriptor[] = [
      { id: 'file1', title: 'index.ts', dirty: true },
      { id: 'file2', title: 'App.tsx', pinned: true },
    ];
    renderWithTheme(<EditorTabs tabs={tabs} activeId="file1" />);

    const dirtyTab = screen.getByRole('tab', { name: 'index.ts' });
    expect(dirtyTab).toHaveAttribute('data-active');
    expect(dirtyTab).toHaveAttribute('data-dirty');

    const pinnedTab = document.querySelector('[data-pinned]');
    expect(pinnedTab).toBeInTheDocument();
  });

  it('disabled tabs have aria-disabled and do not respond to click', () => {
    const onActiveChange = vi.fn();
    const tabs: TabDescriptor[] = [
      { id: 'file1', title: 'index.ts' },
      { id: 'file2', title: 'disabled.ts', disabled: true },
    ];
    renderWithTheme(<EditorTabs tabs={tabs} activeId="file1" onActiveChange={onActiveChange} />);

    const disabledTab = screen.getByRole('tab', { name: 'disabled.ts' });
    expect(disabledTab).toHaveAttribute('aria-disabled', 'true');
    expect(disabledTab).toHaveAttribute('data-disabled');

    fireEvent.click(disabledTab);
    expect(onActiveChange).not.toHaveBeenCalled();
  });

  it('keyboard navigation moves focus between tabs', () => {
    renderWithTheme(<EditorTabs tabs={baseTabs} activeId="file1" />);

    const firstTab = screen.getByRole('tab', { name: 'index.ts' });
    firstTab.focus();

    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });

    const secondTab = screen.getByRole('tab', { name: 'App.tsx' });
    expect(document.activeElement).toBe(secondTab);
  });

  it('renders normally with detachable={false}', () => {
    renderWithTheme(<EditorTabs tabs={baseTabs} activeId="file1" detachable={false} />);

    expect(screen.getByRole('tab', { name: 'index.ts' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'App.tsx' })).toBeInTheDocument();
  });

  it('does not apply data-detach-source during normal render', () => {
    renderWithTheme(<EditorTabs tabs={baseTabs} activeId="file1" />);

    const detachSource = document.querySelector('[data-detach-source]');
    expect(detachSource).not.toBeInTheDocument();
  });

  it('accepts onDetachCommit prop without error', () => {
    const onDetachCommit = vi.fn();
    renderWithTheme(
      <EditorTabs tabs={baseTabs} activeId="file1" onDetachCommit={onDetachCommit} />,
    );

    expect(screen.getByRole('tab', { name: 'index.ts' })).toBeInTheDocument();
    expect(onDetachCommit).not.toHaveBeenCalled();
  });

  it('detachable={false} does not attach pointermove listener on pointerdown', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const onDetachCommit = vi.fn();
    const tabs: TabDescriptor[] = [
      { id: 'file1', title: 'index.ts', payload: { path: '/src/index.ts' } },
      { id: 'file2', title: 'App.tsx' },
    ];
    renderWithTheme(
      <EditorTabs
        tabs={tabs}
        activeId="file1"
        detachable={false}
        onDetachCommit={onDetachCommit}
      />,
    );

    const tab = screen.getByRole('tab', { name: 'index.ts' });
    fireEvent.pointerDown(tab, { clientX: 100, clientY: 120, pointerId: 1 });

    const pointermoveCalls = addSpy.mock.calls.filter((call) => call[0] === 'pointermove');
    // No pointermove listener should be added for detach tracking
    expect(pointermoveCalls).toHaveLength(0);

    expect(onDetachCommit).not.toHaveBeenCalled();
    expect(document.querySelector('[data-detach-source]')).not.toBeInTheDocument();

    addSpy.mockRestore();
  });

  it('accepts onAttachTab prop without error', () => {
    const onAttachTab = vi.fn();
    renderWithTheme(
      <EditorTabs
        tabs={baseTabs}
        activeId="file1"
        onAttachTab={onAttachTab}
        instanceId="test-instance"
      />,
    );

    expect(screen.getByRole('tab', { name: 'index.ts' })).toBeInTheDocument();
    expect(onAttachTab).not.toHaveBeenCalled();
  });

  it('data-attach-drop-target NOT present without active broker session', () => {
    renderWithTheme(
      <EditorTabs
        tabs={baseTabs}
        activeId="file1"
        onAttachTab={vi.fn()}
        instanceId="test-instance"
      />,
    );

    const dropTarget = document.querySelector('[data-attach-drop-target]');
    expect(dropTarget).not.toBeInTheDocument();
  });

  it('applies pill variant data attribute', () => {
    const tabs: TabDescriptor[] = [
      { id: '1', title: 'Tab 1' },
      { id: '2', title: 'Tab 2' },
    ];
    renderWithTheme(<EditorTabs tabs={tabs} variant="pill" />);
    const root = screen.getByRole('tablist');
    expect(root).toHaveAttribute('data-ov-variant', 'pill');
  });

  it('applies xs and xl size data attributes', () => {
    const tabs: TabDescriptor[] = [{ id: '1', title: 'Tab 1' }];
    const { rerender } = renderWithTheme(<EditorTabs tabs={tabs} size="xs" />);
    expect(screen.getByRole('tablist')).toHaveAttribute('data-ov-size', 'xs');

    rerender(<EditorTabs tabs={tabs} size="xl" />);
    expect(screen.getByRole('tablist')).toHaveAttribute('data-ov-size', 'xl');
  });

  it('applies discovery and secondary color data attributes', () => {
    const tabs: TabDescriptor[] = [{ id: '1', title: 'Tab 1' }];
    const { rerender } = renderWithTheme(<EditorTabs tabs={tabs} color="discovery" />);
    expect(screen.getByRole('tablist')).toHaveAttribute('data-ov-color', 'discovery');

    rerender(<EditorTabs tabs={tabs} color="secondary" />);
    expect(screen.getByRole('tablist')).toHaveAttribute('data-ov-color', 'secondary');
  });

  it('detachable tab wires onDetachCommit through without crashing', () => {
    // Full pointer drag simulation is not feasible in jsdom (dnd-kit requires
    // setPointerCapture, getBoundingClientRect, etc.). The useTabDetach hook
    // tests cover the threshold/commit logic directly. This test verifies
    // the component accepts and wires the props correctly.
    const onDetachCommit = vi.fn();
    const tabs: TabDescriptor[] = [
      { id: 'file1', title: 'index.ts', payload: { path: '/src/index.ts' } },
      { id: 'file2', title: 'App.tsx' },
    ];
    renderWithTheme(
      <EditorTabs
        tabs={tabs}
        activeId="file1"
        detachable
        detachThresholdPx={18}
        onDetachCommit={onDetachCommit}
      />,
    );

    // Verify component renders with detach props
    expect(screen.getByRole('tab', { name: 'index.ts' })).toBeInTheDocument();
    // No detach artifacts without an active drag
    expect(document.querySelector('[data-detach-source]')).not.toBeInTheDocument();
    expect(onDetachCommit).not.toHaveBeenCalled();
  });

  describe('broker mode', () => {
    const sourceTabs: TabDescriptor[] = [
      { id: 'file1', title: 'index.ts', payload: { path: '/src/index.ts' } },
      { id: 'file2', title: 'App.tsx' },
    ];
    const targetTabs: TabDescriptor[] = [{ id: 'other1', title: 'README.md' }];

    function renderSourceAndTarget({
      transport,
      targetDragType,
    }: { transport?: TabDragTransport; targetDragType?: string } = {}) {
      const callbacks = {
        onCancel: vi.fn(),
        onDetachCommit: vi.fn(),
        onTabTransferred: vi.fn(),
        onAttachTab: vi.fn(),
      };
      renderWithTheme(
        <TabDragBrokerProvider onCancel={callbacks.onCancel} transport={transport}>
          <EditorTabs
            tabs={sourceTabs}
            activeId="file1"
            instanceId="source"
            detachToBroker
            onDetachCommit={callbacks.onDetachCommit}
            onTabTransferred={callbacks.onTabTransferred}
          />
          <EditorTabs
            tabs={targetTabs}
            activeId="other1"
            instanceId="target"
            dragType={targetDragType}
            onAttachTab={callbacks.onAttachTab}
          />
        </TabDragBrokerProvider>,
      );

      // jsdom has no layout: place the target strip's viewport at y=300..330.
      const targetTab = screen.getByRole('tab', { name: 'README.md' });
      const targetViewport = Array.from(targetTab.closest('[role="tablist"]')!.children).find(
        (child) => child.contains(targetTab),
      )!;
      targetViewport.getBoundingClientRect = () =>
        ({ left: 0, top: 300, right: 800, bottom: 330, width: 800, height: 30 }) as DOMRect;

      return callbacks;
    }

    /** Drags `index.ts` far enough below its strip to arm the broker session. */
    function dragSourceTabOut() {
      const tab = screen.getByRole('tab', { name: 'index.ts' });
      const pointer = { pointerId: 1, isPrimary: true, button: 0 };
      fireEvent.pointerDown(tab, { ...pointer, clientX: 10, clientY: 10 });
      // Passes dnd-kit's 6px activation distance.
      fireEvent.pointerMove(document, { ...pointer, clientX: 10, clientY: 20 });
      // Passes the detach threshold: the broker session starts.
      fireEvent.pointerMove(document, { ...pointer, clientX: 100, clientY: 200 });
    }

    function release(init: PointerEventInit) {
      fireEvent.pointerUp(document, { pointerId: 1, isPrimary: true, button: 0, ...init });
    }

    it('local attach fires onAttachTab on the target and onTabTransferred on the source', () => {
      const callbacks = renderSourceAndTarget();

      dragSourceTabOut();
      release({ clientX: 100, clientY: 310 });

      expect(callbacks.onAttachTab).toHaveBeenCalledExactlyOnceWith({
        tab: sourceTabs[0],
        sourceInstanceId: 'source',
        insertIndex: 1,
      });
      expect(callbacks.onTabTransferred).toHaveBeenCalledExactlyOnceWith({
        id: 'file1',
        targetInstanceId: 'target',
      });
      expect(callbacks.onDetachCommit).not.toHaveBeenCalled();
      expect(callbacks.onCancel).not.toHaveBeenCalled();
    });

    it('does not attach to a strip of another drag type', () => {
      const callbacks = renderSourceAndTarget({ targetDragType: 'other-type' });

      dragSourceTabOut();
      release({ clientX: 100, clientY: 310, screenX: 1100, screenY: 1310 });

      expect(callbacks.onAttachTab).not.toHaveBeenCalled();
      expect(callbacks.onTabTransferred).not.toHaveBeenCalled();
      expect(callbacks.onDetachCommit).toHaveBeenCalledTimes(1);
    });

    it('remote acceptance fires onTabTransferred with the remote instance id', async () => {
      const { transport } = createFakeTabDragTransport({ targetInstanceId: 'remote-strip' });
      const callbacks = renderSourceAndTarget({ transport });

      dragSourceTabOut();
      release({ clientX: 500, clientY: 600, screenX: 2500, screenY: 600 });
      await act(async () => {});

      expect(transport.begin).toHaveBeenCalledTimes(1);
      expect(transport.drop).toHaveBeenCalledWith(transport.begin.mock.calls[0]![0], {
        clientX: 500,
        clientY: 600,
        screenX: 2500,
        screenY: 600,
      });
      expect(callbacks.onTabTransferred).toHaveBeenCalledExactlyOnceWith({
        id: 'file1',
        targetInstanceId: 'remote-strip',
      });
      expect(callbacks.onDetachCommit).not.toHaveBeenCalled();
      expect(callbacks.onCancel).not.toHaveBeenCalled();
    });

    it('releasing over nothing fires onDetachCommit with the release point', async () => {
      const { transport } = createFakeTabDragTransport(null);
      const callbacks = renderSourceAndTarget({ transport });

      dragSourceTabOut();
      release({ clientX: 500, clientY: 600, screenX: 1500, screenY: 1600 });
      await act(async () => {});

      expect(callbacks.onDetachCommit).toHaveBeenCalledExactlyOnceWith({
        id: 'file1',
        payload: { path: '/src/index.ts' },
        clientX: 500,
        clientY: 600,
        screenX: 1500,
        screenY: 1600,
      });
      expect(callbacks.onTabTransferred).not.toHaveBeenCalled();
      expect(callbacks.onCancel).not.toHaveBeenCalled();
    });

    it('Escape cancels: only onCancel fires', async () => {
      const callbacks = renderSourceAndTarget();

      dragSourceTabOut();
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      release({ clientX: 100, clientY: 310 });
      await act(async () => {});

      expect(callbacks.onCancel).toHaveBeenCalledTimes(1);
      expect(callbacks.onAttachTab).not.toHaveBeenCalled();
      expect(callbacks.onTabTransferred).not.toHaveBeenCalled();
      expect(callbacks.onDetachCommit).not.toHaveBeenCalled();
    });
  });
});
