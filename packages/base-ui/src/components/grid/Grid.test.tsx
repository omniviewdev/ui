import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Grid } from './Grid';

describe('Grid', () => {
  it('renders with default columns=12 and spacing=2', () => {
    renderWithTheme(<Grid data-testid="grid">Content</Grid>);

    const el = screen.getByTestId('grid');
    expect(el).toHaveAttribute('data-ov-grid-mode', 'fixed');
    expect(el).toHaveAttribute('data-ov-columns', '12');
    expect(el).toHaveAttribute('data-ov-spacing', '2');
    expect(el).toHaveTextContent('Content');
  });

  it('applies fixed columns mode with custom column count', () => {
    renderWithTheme(<Grid columns={3} data-testid="grid" />);

    const el = screen.getByTestId('grid');
    expect(el).toHaveAttribute('data-ov-grid-mode', 'fixed');
    expect(el).toHaveAttribute('data-ov-columns', '3');
  });

  it('applies auto-responsive mode with minChildWidth', () => {
    renderWithTheme(<Grid minChildWidth="200px" data-testid="grid" />);

    const el = screen.getByTestId('grid');
    expect(el).toHaveAttribute('data-ov-grid-mode', 'auto');
    expect(el).not.toHaveAttribute('data-ov-columns');
    expect(el.style.getPropertyValue('--_ov-min-child-width')).toBe('200px');
  });

  it('applies static span on Grid.Item', () => {
    renderWithTheme(
      <Grid columns={6}>
        <Grid.Item span={3} rowSpan={2} data-testid="item" />
      </Grid>,
    );

    const item = screen.getByTestId('item');
    expect(item).toHaveAttribute('data-ov-span', '3');
    expect(item).toHaveAttribute('data-ov-row-span', '2');
  });

  it('applies responsive span data attributes on Grid.Item', () => {
    renderWithTheme(
      <Grid columns={12}>
        <Grid.Item span={{ xs: 12, md: 6, xl: 4 }} data-testid="item" />
      </Grid>,
    );

    const item = screen.getByTestId('item');
    expect(item).toHaveAttribute('data-ov-span-xs', '12');
    expect(item).toHaveAttribute('data-ov-span-md', '6');
    expect(item).toHaveAttribute('data-ov-span-xl', '4');
    // Should not have attrs for breakpoints not specified
    expect(item).not.toHaveAttribute('data-ov-span-sm');
    expect(item).not.toHaveAttribute('data-ov-span-lg');
    // Should not have the static span attr
    expect(item).not.toHaveAttribute('data-ov-span');
  });

  it('applies rowSpacing and columnSpacing', () => {
    renderWithTheme(<Grid rowSpacing={1} columnSpacing={4} data-testid="grid" />);

    const el = screen.getByTestId('grid');
    expect(el).toHaveAttribute('data-ov-row-spacing', '1');
    expect(el).toHaveAttribute('data-ov-column-spacing', '4');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(<Grid ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderWithTheme(<Grid className="custom-class" data-testid="grid" />);

    expect(screen.getByTestId('grid')).toHaveClass('custom-class');
  });
});
