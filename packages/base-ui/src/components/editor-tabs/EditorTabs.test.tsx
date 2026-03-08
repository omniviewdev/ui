import { fireEvent, screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { EditorTabs } from './EditorTabs';
import type { TabDescriptor, TabGroupDescriptor } from './types';

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
    expect(screen.getByRole('tab', { name: 'index.ts' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
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
    renderWithTheme(
      <EditorTabs tabs={tabs} activeId="file1" onActiveChange={onActiveChange} />,
    );

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
});
