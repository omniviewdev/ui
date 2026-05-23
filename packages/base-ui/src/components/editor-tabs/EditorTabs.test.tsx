import { fireEvent, screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { EditorTabs } from './EditorTabs';
import type { TabDescriptor, TabGroupDescriptor } from './types';

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
});
