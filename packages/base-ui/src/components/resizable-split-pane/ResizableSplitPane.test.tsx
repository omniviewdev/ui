import { createRef } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { ResizableSplitPane } from './ResizableSplitPane';

describe('ResizableSplitPane', () => {
  it('renders two panes with a handle', () => {
    renderWithTheme(
      <ResizableSplitPane data-testid="split">
        {['Left', 'Right']}
      </ResizableSplitPane>,
    );

    const el = screen.getByTestId('split');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-ov-direction', 'horizontal');
    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('applies vertical direction', () => {
    renderWithTheme(
      <ResizableSplitPane direction="vertical" data-testid="split">
        {['Top', 'Bottom']}
      </ResizableSplitPane>,
    );

    expect(screen.getByTestId('split')).toHaveAttribute('data-ov-direction', 'vertical');
  });

  it('sets default size as CSS custom property', () => {
    renderWithTheme(
      <ResizableSplitPane defaultSize={300} data-testid="split">
        {['A', 'B']}
      </ResizableSplitPane>,
    );

    const el = screen.getByTestId('split');
    expect(el.style.getPropertyValue('--_ov-split-size')).toBe('300px');
  });

  it('calls onResize during pointer drag', () => {
    const onResize = vi.fn();
    renderWithTheme(
      <ResizableSplitPane defaultSize={200} onResize={onResize} data-testid="split">
        {['A', 'B']}
      </ResizableSplitPane>,
    );

    const handle = screen.getByRole('separator');

    fireEvent.pointerDown(handle, { clientX: 200, clientY: 0 });
    fireEvent.pointerMove(handle, { clientX: 250, clientY: 0 });

    expect(onResize).toHaveBeenCalledWith(250);
  });

  it('updates CSS custom property directly during drag', () => {
    renderWithTheme(
      <ResizableSplitPane defaultSize={200} data-testid="split">
        {['A', 'B']}
      </ResizableSplitPane>,
    );

    const el = screen.getByTestId('split');
    const handle = screen.getByRole('separator');

    fireEvent.pointerDown(handle, { clientX: 200, clientY: 0 });
    fireEvent.pointerMove(handle, { clientX: 300, clientY: 0 });

    // Size should be updated via direct DOM manipulation
    expect(el.style.getPropertyValue('--_ov-split-size')).toBe('300px');
  });

  it('enforces minSize constraint', () => {
    const onResize = vi.fn();
    renderWithTheme(
      <ResizableSplitPane defaultSize={200} minSize={150} onResize={onResize}>
        {['A', 'B']}
      </ResizableSplitPane>,
    );

    const handle = screen.getByRole('separator');
    fireEvent.pointerDown(handle, { clientX: 200, clientY: 0 });
    fireEvent.pointerMove(handle, { clientX: 50, clientY: 0 });

    expect(onResize).toHaveBeenCalledWith(150);
  });

  it('enforces maxSize constraint', () => {
    const onResize = vi.fn();
    renderWithTheme(
      <ResizableSplitPane defaultSize={200} maxSize={400} onResize={onResize}>
        {['A', 'B']}
      </ResizableSplitPane>,
    );

    const handle = screen.getByRole('separator');
    fireEvent.pointerDown(handle, { clientX: 200, clientY: 0 });
    fireEvent.pointerMove(handle, { clientX: 700, clientY: 0 });

    expect(onResize).toHaveBeenCalledWith(400);
  });

  it('resets to default size on double-click', () => {
    const onResize = vi.fn();
    renderWithTheme(
      <ResizableSplitPane defaultSize={200} onResize={onResize}>
        {['A', 'B']}
      </ResizableSplitPane>,
    );

    const handle = screen.getByRole('separator');

    // Drag to change size
    fireEvent.pointerDown(handle, { clientX: 200, clientY: 0 });
    fireEvent.pointerMove(handle, { clientX: 350, clientY: 0 });
    fireEvent.pointerUp(handle);

    // Double-click to reset
    fireEvent.doubleClick(handle);
    expect(onResize).toHaveBeenLastCalledWith(200);
  });

  it('supports keyboard resize with arrow keys', () => {
    const onResize = vi.fn();
    renderWithTheme(
      <ResizableSplitPane defaultSize={200} onResize={onResize}>
        {['A', 'B']}
      </ResizableSplitPane>,
    );

    const handle = screen.getByRole('separator');
    handle.focus();

    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(onResize).toHaveBeenCalledWith(210);

    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(onResize).toHaveBeenCalledWith(200);
  });

  it('supports vertical keyboard resize', () => {
    const onResize = vi.fn();
    renderWithTheme(
      <ResizableSplitPane direction="vertical" defaultSize={200} onResize={onResize}>
        {['A', 'B']}
      </ResizableSplitPane>,
    );

    const handle = screen.getByRole('separator');
    handle.focus();

    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(onResize).toHaveBeenCalledWith(210);
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(
      <ResizableSplitPane ref={ref}>
        {['A', 'B']}
      </ResizableSplitPane>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderWithTheme(
      <ResizableSplitPane className="custom" data-testid="split">
        {['A', 'B']}
      </ResizableSplitPane>,
    );

    expect(screen.getByTestId('split')).toHaveClass('custom');
  });

  it('renders handle with correct aria attributes', () => {
    renderWithTheme(
      <ResizableSplitPane defaultSize={200} minSize={50} maxSize={500}>
        {['A', 'B']}
      </ResizableSplitPane>,
    );

    const handle = screen.getByRole('separator');
    expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    expect(handle).toHaveAttribute('tabindex', '0');
    expect(handle).toHaveAttribute('aria-valuenow', '200');
    expect(handle).toHaveAttribute('aria-valuemin', '50');
    expect(handle).toHaveAttribute('aria-valuemax', '500');
  });

  it('renders vertical handle with horizontal aria-orientation', () => {
    renderWithTheme(
      <ResizableSplitPane direction="vertical">
        {['A', 'B']}
      </ResizableSplitPane>,
    );

    const handle = screen.getByRole('separator');
    expect(handle).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('does not override user resize when defaultSize has not changed', () => {
    const onResize = vi.fn();
    renderWithTheme(
      <ResizableSplitPane defaultSize={200} onResize={onResize} data-testid="split">
        {['A', 'B']}
      </ResizableSplitPane>,
    );

    const handle = screen.getByRole('separator');

    // User drags to 350
    fireEvent.pointerDown(handle, { clientX: 200, clientY: 0 });
    fireEvent.pointerMove(handle, { clientX: 350, clientY: 0 });
    fireEvent.pointerUp(handle);

    // Size should remain at 350, not reset to 200
    const el = screen.getByTestId('split');
    expect(el.style.getPropertyValue('--_ov-split-size')).toBe('350px');
  });

  it('sets data-ov-dragging during drag and removes after', () => {
    renderWithTheme(
      <ResizableSplitPane data-testid="split">
        {['A', 'B']}
      </ResizableSplitPane>,
    );

    const el = screen.getByTestId('split');
    const handle = screen.getByRole('separator');

    expect(el).not.toHaveAttribute('data-ov-dragging');

    fireEvent.pointerDown(handle, { clientX: 200, clientY: 0 });
    expect(el).toHaveAttribute('data-ov-dragging');

    fireEvent.pointerUp(handle);
    expect(el).not.toHaveAttribute('data-ov-dragging');
  });
});
