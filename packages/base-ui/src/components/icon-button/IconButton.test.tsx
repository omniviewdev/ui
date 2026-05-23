import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { IconButton } from './IconButton';

const TestIcon = () => (
  <svg aria-hidden viewBox="0 0 16 16"><path d="M1 1h14v14H1z" /></svg>
);

describe('IconButton', () => {
  it('renders with style attributes', () => {
    renderWithTheme(
      <IconButton aria-label="Search" size="lg" variant="outline" color="brand">
        <TestIcon />
      </IconButton>,
    );
    const button = screen.getByRole('button', { name: 'Search' });
    expect(button).toHaveAttribute('data-ov-size', 'lg');
    expect(button).toHaveAttribute('data-ov-variant', 'outline');
    expect(button).toHaveAttribute('data-ov-color', 'brand');
  });

  it('renders with xs size', () => {
    renderWithTheme(
      <IconButton aria-label="Tiny" size="xs"><TestIcon /></IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Tiny' })).toHaveAttribute('data-ov-size', 'xs');
  });

  it('renders with xl size', () => {
    renderWithTheme(
      <IconButton aria-label="Big" size="xl"><TestIcon /></IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Big' })).toHaveAttribute('data-ov-size', 'xl');
  });

  it('does not accept dense prop', () => {
    // @ts-expect-error dense prop was removed
    renderWithTheme(<IconButton aria-label="X" dense><TestIcon /></IconButton>);
  });
});
