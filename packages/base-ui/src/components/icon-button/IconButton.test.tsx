import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('renders icon-only button with style attributes', () => {
    renderWithTheme(
      <IconButton aria-label="Search" size="lg" variant="outline" color="brand">
        <svg aria-hidden viewBox="0 0 16 16">
          <path d="M1 1h14v14H1z" />
        </svg>
      </IconButton>,
    );

    const button = screen.getByRole('button', { name: 'Search' });
    expect(button).toHaveAttribute('data-ov-size', 'lg');
    expect(button).toHaveAttribute('data-ov-variant', 'outline');
    expect(button).toHaveAttribute('data-ov-color', 'brand');
  });
});
