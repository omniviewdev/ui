import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with default props', () => {
    renderWithTheme(<Spinner />);
    const el = screen.getByRole('status');
    expect(el).toBeVisible();
    expect(el).toHaveAttribute('aria-label', 'Loading');
    expect(el).toHaveAttribute('data-ov-size', 'md');
    expect(el).toHaveAttribute('data-ov-color', 'neutral');
    expect(el.children).toHaveLength(8);
  });

  it('accepts size, color, and custom aria-label', () => {
    renderWithTheme(<Spinner size="lg" color="brand" aria-label="Please wait" />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('data-ov-size', 'lg');
    expect(el).toHaveAttribute('data-ov-color', 'brand');
    expect(el).toHaveAttribute('aria-label', 'Please wait');
  });
});
