import { createRef } from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { ConfirmButton } from './ConfirmButton';

describe('ConfirmButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with default label', () => {
    renderWithTheme(<ConfirmButton onConfirm={vi.fn()}>Delete</ConfirmButton>);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('first click changes to confirm state', () => {
    renderWithTheme(<ConfirmButton onConfirm={vi.fn()}>Delete</ConfirmButton>);
    const button = screen.getByRole('button', { name: 'Delete' });

    fireEvent.click(button);

    expect(button).toHaveTextContent('Confirm');
    expect(button).toHaveAttribute('data-ov-confirming', 'true');
  });

  it('second click fires onConfirm', () => {
    const onConfirm = vi.fn();
    renderWithTheme(<ConfirmButton onConfirm={onConfirm}>Delete</ConfirmButton>);
    const button = screen.getByRole('button', { name: 'Delete' });

    fireEvent.click(button);
    fireEvent.click(button);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(button).toHaveTextContent('Delete');
    expect(button).not.toHaveAttribute('data-ov-confirming');
  });

  it('timeout reverts to default state', () => {
    renderWithTheme(
      <ConfirmButton onConfirm={vi.fn()} confirmTimeout={2000}>
        Delete
      </ConfirmButton>,
    );
    const button = screen.getByRole('button', { name: 'Delete' });

    fireEvent.click(button);
    expect(button).toHaveTextContent('Confirm');

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(button).toHaveTextContent('Delete');
    expect(button).not.toHaveAttribute('data-ov-confirming');
  });

  it('custom confirmLabel is displayed', () => {
    renderWithTheme(
      <ConfirmButton onConfirm={vi.fn()} confirmLabel="Are you sure?">
        Remove
      </ConfirmButton>,
    );
    const button = screen.getByRole('button', { name: 'Remove' });

    fireEvent.click(button);

    expect(button).toHaveTextContent('Are you sure?');
  });

  it('custom confirmColor is applied', () => {
    renderWithTheme(
      <ConfirmButton onConfirm={vi.fn()} confirmColor="warning" color="neutral">
        Remove
      </ConfirmButton>,
    );
    const button = screen.getByRole('button', { name: 'Remove' });

    expect(button).toHaveAttribute('data-ov-color', 'neutral');

    fireEvent.click(button);

    expect(button).toHaveAttribute('data-ov-color', 'warning');
  });

  it('disabled state prevents interaction', () => {
    const onConfirm = vi.fn();
    renderWithTheme(
      <ConfirmButton onConfirm={onConfirm} disabled>
        Delete
      </ConfirmButton>,
    );
    const button = screen.getByRole('button', { name: 'Delete' });

    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Delete');
    expect(button).not.toHaveAttribute('data-ov-confirming');
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('merges className', () => {
    renderWithTheme(
      <ConfirmButton onConfirm={vi.fn()} className="custom-class">
        Delete
      </ConfirmButton>,
    );
    const button = screen.getByRole('button', { name: 'Delete' });

    expect(button.className).toContain('custom-class');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLButtonElement>();
    renderWithTheme(
      <ConfirmButton ref={ref} onConfirm={vi.fn()}>
        Delete
      </ConfirmButton>,
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.textContent).toBe('Delete');
  });

  it('cleans up timeout on unmount', () => {
    const onConfirm = vi.fn();
    const { unmount } = renderWithTheme(
      <ConfirmButton onConfirm={onConfirm} confirmTimeout={3000}>
        Delete
      </ConfirmButton>,
    );
    const button = screen.getByRole('button', { name: 'Delete' });

    fireEvent.click(button);
    expect(button).toHaveAttribute('data-ov-confirming', 'true');

    unmount();

    // Timer should have been cleared
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(3000);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
