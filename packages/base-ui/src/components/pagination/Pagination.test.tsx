import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Pagination } from './Pagination';
import { buildPaginationRange } from './usePaginationRange';

/* ── Unit: buildPaginationRange ────────────────────────────────── */

describe('buildPaginationRange', () => {
  it('returns all pages when count is small', () => {
    expect(buildPaginationRange(5, 3, 1, 1)).toEqual([1, 2, 3, 4, 5]);
  });

  it('places right ellipsis when current page is near start', () => {
    const range = buildPaginationRange(10, 2, 1, 1);
    expect(range).toContain('ellipsis');
    expect(range[0]).toBe(1);
    expect(range[range.length - 1]).toBe(10);
  });

  it('places left ellipsis when current page is near end', () => {
    const range = buildPaginationRange(10, 9, 1, 1);
    expect(range).toContain('ellipsis');
    expect(range[0]).toBe(1);
    expect(range[range.length - 1]).toBe(10);
  });

  it('places both ellipses when current page is in the middle', () => {
    const range = buildPaginationRange(20, 10, 1, 1);
    const ellipses = range.filter((item) => item === 'ellipsis');
    expect(ellipses).toHaveLength(2);
  });

  it('respects siblingCount', () => {
    const range = buildPaginationRange(20, 10, 2, 1);
    expect(range).toContain(8);
    expect(range).toContain(9);
    expect(range).toContain(10);
    expect(range).toContain(11);
    expect(range).toContain(12);
  });

  it('respects boundaryCount', () => {
    const range = buildPaginationRange(20, 10, 1, 2);
    expect(range).toContain(1);
    expect(range).toContain(2);
    expect(range).toContain(19);
    expect(range).toContain(20);
  });
});

/* ── Component: Pagination ─────────────────────────────────────── */

describe('Pagination', () => {
  it('renders correct page number buttons', () => {
    renderWithTheme(<Pagination count={5} page={3} onChange={() => {}} />);

    for (let i = 1; i <= 5; i++) {
      expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument();
    }
  });

  it('renders ellipsis with many pages', () => {
    const { container } = renderWithTheme(<Pagination count={20} page={10} onChange={() => {}} />);

    // Target the actual ellipsis wrappers (the span.Ellipsis elements), not nav icon aria-hidden
    const ellipses = container.querySelectorAll('span[aria-hidden="true"]');
    expect(ellipses.length).toBeGreaterThanOrEqual(2);
  });

  it('does not emit onChange when the active page is clicked', () => {
    const onChange = vi.fn();
    renderWithTheme(<Pagination count={5} page={3} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '3' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('fires onChange with the correct page number', () => {
    const onChange = vi.fn();
    renderWithTheme(<Pagination count={5} page={3} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '5' }));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('highlights current page with data-ov-active', () => {
    renderWithTheme(<Pagination count={5} page={3} onChange={() => {}} />);

    const currentButton = screen.getByRole('button', { name: '3' });
    expect(currentButton).toHaveAttribute('data-ov-active', 'true');
    expect(currentButton).toHaveAttribute('aria-current', 'page');
  });

  it('disables Prev on first page', () => {
    renderWithTheme(<Pagination count={5} page={1} onChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeDisabled();
  });

  it('disables Next on last page', () => {
    renderWithTheme(<Pagination count={5} page={5} onChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled();
  });

  it('disables First button on first page', () => {
    renderWithTheme(<Pagination count={5} page={1} onChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Go to first page' })).toBeDisabled();
  });

  it('disables Last button on last page', () => {
    renderWithTheme(<Pagination count={5} page={5} onChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Go to last page' })).toBeDisabled();
  });

  it('hides first/last buttons when showFirstLast is false', () => {
    renderWithTheme(<Pagination count={5} page={3} onChange={() => {}} showFirstLast={false} />);

    expect(screen.queryByRole('button', { name: 'Go to first page' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Go to last page' })).not.toBeInTheDocument();
  });

  it('applies size data attribute', () => {
    const { container } = renderWithTheme(
      <Pagination count={5} page={1} onChange={() => {}} size="sm" />,
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveAttribute('data-ov-size', 'sm');
  });

  it('navigates to previous page on Prev click', () => {
    const onChange = vi.fn();
    renderWithTheme(<Pagination count={5} page={3} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Go to previous page' }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('navigates to next page on Next click', () => {
    const onChange = vi.fn();
    renderWithTheme(<Pagination count={5} page={3} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
