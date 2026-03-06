import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Progress } from './Progress';

describe('Progress', () => {
  it('renders determinate progress', () => {
    renderWithTheme(<Progress value={60} aria-label="Upload progress" />);
    const el = screen.getByRole('progressbar');
    expect(el).toHaveAttribute('aria-valuenow', '60');
    expect(el).toHaveAttribute('aria-valuemin', '0');
    expect(el).toHaveAttribute('aria-valuemax', '100');
    expect(el).toHaveAttribute('data-ov-color', 'brand');
    expect(el).toHaveAttribute('data-ov-size', 'md');
  });

  it('clamps value to 0-100', () => {
    renderWithTheme(<Progress value={150} aria-label="Clamped" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('renders indeterminate when value is undefined', () => {
    renderWithTheme(<Progress aria-label="Loading" />);
    const el = screen.getByRole('progressbar');
    expect(el).not.toHaveAttribute('aria-valuenow');
    expect(el).toHaveAttribute('data-ov-indeterminate', 'true');
  });

  it('accepts color and size props', () => {
    renderWithTheme(<Progress value={30} color="success" size="lg" aria-label="Status" />);
    const el = screen.getByRole('progressbar');
    expect(el).toHaveAttribute('data-ov-color', 'success');
    expect(el).toHaveAttribute('data-ov-size', 'lg');
  });
});
