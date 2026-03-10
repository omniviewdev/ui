import { createRef } from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { FilterBar } from './FilterBar';

describe('FilterBar', () => {
  it('renders children', () => {
    renderWithTheme(
      <FilterBar>
        <FilterBar.Chip>Status: Running</FilterBar.Chip>
      </FilterBar>,
    );

    expect(screen.getByText('Status: Running')).toBeVisible();
  });

  it('applies size data attribute', () => {
    renderWithTheme(<FilterBar data-testid="fb" size="sm">content</FilterBar>);
    expect(screen.getByTestId('fb')).toHaveAttribute('data-ov-size', 'sm');
  });

  it('defaults size to md', () => {
    renderWithTheme(<FilterBar data-testid="fb">content</FilterBar>);
    expect(screen.getByTestId('fb')).toHaveAttribute('data-ov-size', 'md');
  });

  it('renders chip backed by Chip component with outline variant', () => {
    renderWithTheme(
      <FilterBar>
        <FilterBar.Chip data-testid="chip">NS: default</FilterBar.Chip>
      </FilterBar>,
    );

    const chip = screen.getByTestId('chip');
    expect(chip).toHaveAttribute('data-ov-variant', 'outline');
    expect(chip).toHaveAttribute('data-ov-size', 'md');
  });

  it('propagates size from root to chips', () => {
    renderWithTheme(
      <FilterBar size="sm">
        <FilterBar.Chip data-testid="chip">NS: default</FilterBar.Chip>
      </FilterBar>,
    );

    expect(screen.getByTestId('chip')).toHaveAttribute('data-ov-size', 'sm');
  });

  it('renders chip with remove button', () => {
    const onRemove = vi.fn();
    renderWithTheme(
      <FilterBar>
        <FilterBar.Chip onRemove={onRemove}>NS: default</FilterBar.Chip>
      </FilterBar>,
    );

    const removeBtn = screen.getByRole('button', { name: 'Remove filter' });
    fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('does not render remove button when onRemove is not provided', () => {
    renderWithTheme(
      <FilterBar>
        <FilterBar.Chip>Label</FilterBar.Chip>
      </FilterBar>,
    );

    expect(screen.queryByRole('button', { name: 'Remove filter' })).not.toBeInTheDocument();
  });

  it('renders add button', () => {
    renderWithTheme(
      <FilterBar>
        <FilterBar.Add />
      </FilterBar>,
    );

    expect(screen.getByRole('button', { name: 'Add filter' })).toBeVisible();
  });

  it('calls onClick on add button', () => {
    const onClick = vi.fn();
    renderWithTheme(
      <FilterBar>
        <FilterBar.Add onClick={onClick} />
      </FilterBar>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add filter' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders clear button and calls onClick', () => {
    const onClear = vi.fn();
    renderWithTheme(
      <FilterBar>
        <FilterBar.Chip>A</FilterBar.Chip>
        <FilterBar.Clear onClick={onClear} />
      </FilterBar>,
    );

    const clearBtn = screen.getByRole('button', { name: 'Clear all' });
    fireEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('forwards ref on root', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(<FilterBar ref={ref}>content</FilterBar>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderWithTheme(<FilterBar data-testid="fb" className="custom">content</FilterBar>);
    expect(screen.getByTestId('fb')).toHaveClass('custom');
  });
});
