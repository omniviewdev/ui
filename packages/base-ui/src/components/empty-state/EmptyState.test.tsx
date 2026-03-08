import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders title', () => {
    renderWithTheme(<EmptyState title="No results" />);
    expect(screen.getByText('No results')).toBeVisible();
  });

  it('renders icon when provided', () => {
    renderWithTheme(<EmptyState title="Empty" icon={<svg data-testid="icon" />} />);
    expect(screen.getByTestId('icon')).toBeVisible();
  });

  it('renders description when provided', () => {
    renderWithTheme(<EmptyState title="Empty" description="Try adjusting your filters" />);
    expect(screen.getByText('Try adjusting your filters')).toBeVisible();
  });

  it('renders action slot content', () => {
    renderWithTheme(<EmptyState title="Empty" action={<button type="button">Retry</button>} />);
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  it('size variants apply correct data attributes', () => {
    const { rerender } = renderWithTheme(<EmptyState title="Empty" size="sm" />);
    expect(screen.getByText('Empty').parentElement).toHaveAttribute('data-ov-size', 'sm');

    rerender(<EmptyState title="Empty" size="md" />);
    expect(screen.getByText('Empty').parentElement).toHaveAttribute('data-ov-size', 'md');

    rerender(<EmptyState title="Empty" size="lg" />);
    expect(screen.getByText('Empty').parentElement).toHaveAttribute('data-ov-size', 'lg');
  });

  it('defaults size to md', () => {
    renderWithTheme(<EmptyState title="Empty" />);
    expect(screen.getByText('Empty').parentElement).toHaveAttribute('data-ov-size', 'md');
  });

  it('className merge works', () => {
    renderWithTheme(<EmptyState title="Empty" className="custom-class" />);
    expect(screen.getByText('Empty').parentElement).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(<EmptyState ref={ref} title="Empty" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
