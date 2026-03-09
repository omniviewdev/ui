import { createRef } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { DockLayout, type DockLeaf, type DockSplit } from './DockLayout';

const singleLeaf: DockLeaf = {
  type: 'leaf',
  id: 'leaf-1',
  tabs: [
    { id: 'tab-1', title: 'File 1', content: 'Content 1' },
    { id: 'tab-2', title: 'File 2', content: 'Content 2' },
    { id: 'tab-3', title: 'File 3', content: 'Content 3' },
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
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('switches active tab on click', () => {
    const onChange = vi.fn();
    renderWithTheme(<DockLayout layout={singleLeaf} onLayoutChange={onChange} />);

    fireEvent.click(screen.getByRole('tab', { name: 'File 2' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const newLayout = onChange.mock.calls[0]![0] as DockLeaf;
    expect(newLayout.activeTab).toBe('tab-2');
  });

  it('closes tab on close button click', () => {
    const onChange = vi.fn();
    renderWithTheme(<DockLayout layout={singleLeaf} onLayoutChange={onChange} />);

    const closeButtons = screen.getAllByRole('button', { name: /Close/ });
    fireEvent.click(closeButtons[0]!);

    expect(onChange).toHaveBeenCalledTimes(1);
    const newLayout = onChange.mock.calls[0]![0] as DockLeaf;
    expect(newLayout.type).toBe('leaf');
    expect(newLayout.tabs).toHaveLength(2);
    expect(newLayout.tabs[0]!.id).toBe('tab-2');
  });

  it('keeps activeTab unchanged when clicking the already-active tab', () => {
    const onChange = vi.fn();
    renderWithTheme(
      <DockLayout layout={singleLeaf} onLayoutChange={onChange} />,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'File 1' }));

    expect(onChange).toHaveBeenCalled();
    const newLayout = onChange.mock.calls[0]![0] as DockLeaf;
    expect(newLayout.activeTab).toBe('tab-1');
  });

  it('works as uncontrolled component without onLayoutChange', () => {
    renderWithTheme(<DockLayout layout={singleLeaf} data-testid="dock" />);

    expect(screen.getByTestId('dock')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'File 2' }));
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('serialized layout can be restored', () => {
    const restored: DockSplit = {
      type: 'split',
      direction: 'horizontal',
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

  it('links tab to panel via aria-controls', () => {
    renderWithTheme(<DockLayout layout={singleLeaf} />);

    const activeTab = screen.getByRole('tab', { name: 'File 1' });
    const panel = screen.getByRole('tabpanel');

    expect(activeTab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', activeTab.id);
  });

  it('navigates tabs with arrow keys and moves focus', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DockLayout layout={singleLeaf} data-testid="dock" />);

    const tab1 = screen.getByRole('tab', { name: 'File 1' });
    tab1.focus();
    expect(tab1).toHaveFocus();

    // ArrowRight moves to next tab and focus follows
    await user.keyboard('{ArrowRight}');
    expect(await screen.findByText('Content 2')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'File 2' })).toHaveFocus();

    // ArrowRight again moves to third tab
    await user.keyboard('{ArrowRight}');
    expect(await screen.findByText('Content 3')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'File 3' })).toHaveFocus();
  });

  it('wraps tab navigation with arrow keys and moves focus', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DockLayout layout={singleLeaf} data-testid="dock" />);

    const tab1 = screen.getByRole('tab', { name: 'File 1' });
    tab1.focus();

    // ArrowLeft from first tab wraps to last and focus follows
    await user.keyboard('{ArrowLeft}');
    expect(await screen.findByText('Content 3')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'File 3' })).toHaveFocus();
  });

  it('navigates to first/last tab with Home/End and moves focus', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DockLayout layout={{ ...singleLeaf, activeTab: 'tab-2' }} data-testid="dock" />);

    const tab2 = screen.getByRole('tab', { name: 'File 2' });
    tab2.focus();

    // Home moves to first tab
    await user.keyboard('{Home}');
    expect(await screen.findByText('Content 1')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'File 1' })).toHaveFocus();

    // End moves to last tab
    await user.keyboard('{End}');
    expect(await screen.findByText('Content 3')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'File 3' })).toHaveFocus();
  });

  it('removes empty leaf from split when last tab is closed', () => {
    const twoLeafSplit: DockSplit = {
      type: 'split',
      direction: 'horizontal',
      children: [
        {
          type: 'leaf',
          id: 'left',
          tabs: [{ id: 'only-tab', title: 'Only Tab', content: 'Only content' }],
        },
        {
          type: 'leaf',
          id: 'right',
          tabs: [{ id: 'other', title: 'Other', content: 'Other content' }],
        },
      ],
    };

    const onChange = vi.fn();
    renderWithTheme(<DockLayout layout={twoLeafSplit} onLayoutChange={onChange} />);

    // Close the only tab in the left leaf
    const closeButton = screen.getAllByRole('button', { name: /Close/ })[0]!;
    fireEvent.click(closeButton);

    expect(onChange).toHaveBeenCalledTimes(1);
    // When left leaf becomes empty, the split collapses to just the right leaf
    const newLayout = onChange.mock.calls[0]![0] as DockLeaf;
    expect(newLayout.type).toBe('leaf');
    expect(newLayout.id).toBe('right');
  });

  it('renders tablist role on tab bar', () => {
    renderWithTheme(<DockLayout layout={singleLeaf} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });
});
