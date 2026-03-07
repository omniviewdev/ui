import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Sheet, Paper } from './Sheet';

describe('Sheet', () => {
  it('renders with default props', () => {
    renderWithTheme(<Sheet>Content</Sheet>);
    const el = screen.getByText('Content');
    expect(el).toBeVisible();
    expect(el).toHaveAttribute('data-ov-variant', 'soft');
    expect(el).toHaveAttribute('data-ov-color', 'neutral');
    expect(el).toHaveAttribute('data-ov-size', 'md');
    expect(el).toHaveAttribute('data-ov-elevation', '0');
  });

  it('renders with custom props', () => {
    renderWithTheme(
      <Sheet variant="outline" color="brand" size="sm" elevation={2} as="section">
        Styled
      </Sheet>,
    );
    const el = screen.getByText('Styled');
    expect(el.tagName).toBe('SECTION');
    expect(el).toHaveAttribute('data-ov-variant', 'outline');
    expect(el).toHaveAttribute('data-ov-color', 'brand');
    expect(el).toHaveAttribute('data-ov-size', 'sm');
    expect(el).toHaveAttribute('data-ov-elevation', '2');
  });
});

describe('Paper', () => {
  it('defaults to elevation 1', () => {
    renderWithTheme(<Paper>Paper content</Paper>);
    const el = screen.getByText('Paper content');
    expect(el).toHaveAttribute('data-ov-elevation', '1');
  });
});
