import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Container } from './Container';

describe('Container', () => {
  it('renders with default max-width lg', () => {
    renderWithTheme(<Container data-testid="container">Content</Container>);

    const el = screen.getByTestId('container');
    expect(el).toHaveAttribute('data-ov-max-width', 'lg');
    expect(el).toHaveAttribute('data-ov-gutters', 'true');
    expect(el).not.toHaveAttribute('data-ov-fixed');
    expect(el).toHaveTextContent('Content');
  });

  it('applies custom max-width', () => {
    renderWithTheme(<Container maxWidth="sm" data-testid="container" />);

    expect(screen.getByTestId('container')).toHaveAttribute('data-ov-max-width', 'sm');
  });

  it('sets data-ov-gutters to false when disableGutters is true', () => {
    renderWithTheme(<Container disableGutters data-testid="container" />);

    expect(screen.getByTestId('container')).toHaveAttribute('data-ov-gutters', 'false');
  });

  it('applies fixed mode', () => {
    renderWithTheme(<Container fixed data-testid="container" />);

    expect(screen.getByTestId('container')).toHaveAttribute('data-ov-fixed', 'true');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(<Container ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderWithTheme(<Container className="custom-class" data-testid="container" />);

    expect(screen.getByTestId('container')).toHaveClass('custom-class');
  });
});
