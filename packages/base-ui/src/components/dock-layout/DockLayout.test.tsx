import { createRef } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { DockLayout, type DockLeaf, type DockNode, type DockSplit } from './DockLayout';

const singleLeaf: DockLeaf = {
  type: 'leaf',
  id: 'leaf-1',
  tabs: [
    { id: 'tab-1', title: 'File 1', content: 'Content 1' },
    { id: 'tab-2', title: 'File 2', content: 'Content 2' },
  ],
  activeTab: 'tab-1',
};

const horizontalSplit: DockSplit = {
  type: 'split',
  direction: 'horizontal',
  children: [
    {
      type: 'leaf',
      id: 'leaf-a',
      tabs: [{ id: 'tab-a', title: 'Editor', content: 'Editor content' }],
    },
    {
      type: 'leaf',
      id: 'leaf-b',
      tabs: [{ id: 'tab-b', title: 'Preview', content: 'Preview content' }],
    },
  ],
};

const nestedLayout: DockSplit = {
  type: 'split',
  direction: 'horizontal',
  children: [
    {
      type: 'leaf',
      id: 'sidebar',
      tabs: [{ id: 'nav', title: 'Navigator', content: 'Nav content' }],
    },
    {
      type: 'split',
      direction: 'vertical',
      children: [
        {
          type: 'leaf',
          id: 'editor',
          tabs: [{ id: 'code', title: 'Code', content: 'Code content' }],
        },
        {
          type: 'leaf',
          id: 'terminal',
          tabs: [{ id: 'term', title: 'Terminal', content: 'Terminal content' }],
        },
      ],
    },
  ],
};

describe('DockLayout', () => {
  it('renders a simple single-leaf layout', () => {
    renderWithTheme(<DockLayout layout={singleLeaf} data-testid="dock" />);

    expect(screen.getByTestId('dock')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'File 1' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'File 2' })).toBeInTheDocument();
  });

  it('renders a horizontal split with two leaves', () => {
    renderWithTheme(<DockLayout layout={horizontalSplit} data-testid="dock" />);

    expect(screen.getByText('Editor content')).toBeInTheDocument();
    expect(screen.getByText('Preview content')).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('renders nested splits', () => {
    renderWithTheme(<DockLayout layout={nestedLayout} data-testid="dock" />);

    expect(screen.getByText('Nav content')).toBeInTheDocument();
    expect(screen.getByText('Code content')).toBeInTheDocument();
    expect(screen.getByText('Terminal content')).toBeInTheDocument();
  });

  it('shows correct content for active tab', () => {
    renderWithTheme(<DockLayout layout={singleLeaf} />);

    expect(screen.getByText('Content 1')).toBeInTheDocument();
    // Content 2 should not be visible (only active tab content rendered)
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('switches active tab on click', () => {
    const onChange = vi.fn();
    renderWithTheme(<DockLayout layout={singleLeaf} onLayoutChange={onChange} />);

    fireEvent.click(screen.getByRole('tab', { name: 'File 2' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const newLayout = onChange.mock.calls[0][0] as DockLeaf;
    expect(newLayout.activeTab).toBe('tab-2');
  });

  it('closes tab on close button click', () => {
    const onChange = vi.fn();
    renderWithTheme(<DockLayout layout={singleLeaf} onLayoutChange={onChange} />);

    const closeButtons = screen.getAllByRole('button', { name: /Close/ });
    fireEvent.click(closeButtons[0]);

    expect(onChange).toHaveBeenCalledTimes(1);
    const newLayout = onChange.mock.calls[0][0] as DockLeaf;
    expect(newLayout.type).toBe('leaf');
    expect(newLayout.tabs).toHaveLength(1);
    expect(newLayout.tabs[0].id).toBe('tab-2');
  });

  it('fires onLayoutChange on tab click', () => {
    const onChange = vi.fn();
    renderWithTheme(
      <DockLayout layout={horizontalSplit} onLayoutChange={onChange} />,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Editor' }));
    expect(onChange).toHaveBeenCalled();
  });

  it('works as uncontrolled component without onLayoutChange', () => {
    renderWithTheme(<DockLayout layout={singleLeaf} data-testid="dock" />);

    // Should render without errors
    expect(screen.getByTestId('dock')).toBeInTheDocument();

    // Click tab 2 — should update internal state
    fireEvent.click(screen.getByRole('tab', { name: 'File 2' }));
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('serialized layout can be restored', () => {
    const layout: DockNode = JSON.parse(JSON.stringify(nestedLayout));
    // Content is ReactNode so we need to re-add it
    const restored: DockSplit = {
      ...layout as DockSplit,
      children: [
        {
          type: 'leaf',
          id: 'sidebar',
          tabs: [{ id: 'nav', title: 'Navigator', content: 'Restored nav' }],
        },
        {
          type: 'split',
          direction: 'vertical',
          children: [
            {
              type: 'leaf',
              id: 'editor',
              tabs: [{ id: 'code', title: 'Code', content: 'Restored code' }],
            },
            {
              type: 'leaf',
              id: 'terminal',
              tabs: [{ id: 'term', title: 'Terminal', content: 'Restored term' }],
            },
          ],
        },
      ],
    };

    renderWithTheme(<DockLayout layout={restored} />);
    expect(screen.getByText('Restored nav')).toBeInTheDocument();
    expect(screen.getByText('Restored code')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(<DockLayout ref={ref} layout={singleLeaf} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderWithTheme(
      <DockLayout className="custom" layout={singleLeaf} data-testid="dock" />,
    );
    expect(screen.getByTestId('dock')).toHaveClass('custom');
  });

  it('renders tab with aria-selected', () => {
    renderWithTheme(<DockLayout layout={singleLeaf} />);

    const tab1 = screen.getByRole('tab', { name: 'File 1' });
    const tab2 = screen.getByRole('tab', { name: 'File 2' });

    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(tab2).toHaveAttribute('aria-selected', 'false');
  });

  it('handles non-closable tabs', () => {
    const layout: DockLeaf = {
      type: 'leaf',
      id: 'leaf-1',
      tabs: [
        { id: 'tab-1', title: 'Permanent', closable: false, content: 'Permanent content' },
      ],
    };

    renderWithTheme(<DockLayout layout={layout} />);
    expect(screen.queryByRole('button', { name: /Close/ })).not.toBeInTheDocument();
  });
});
