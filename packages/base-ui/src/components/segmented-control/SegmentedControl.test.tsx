import { createRef } from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { SegmentedControl } from './SegmentedControl';

describe('SegmentedControl', () => {
  it('renders items', () => {
    renderWithTheme(
      <SegmentedControl aria-label="View">
        <SegmentedControl.Item value="list">List</SegmentedControl.Item>
        <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
      </SegmentedControl>,
    );

    expect(screen.getByText('List')).toBeVisible();
    expect(screen.getByText('Grid')).toBeVisible();
  });

  it('has role="radiogroup"', () => {
    renderWithTheme(
      <SegmentedControl aria-label="View">
        <SegmentedControl.Item value="a">A</SegmentedControl.Item>
      </SegmentedControl>,
    );

    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders radio inputs for each item', () => {
    renderWithTheme(
      <SegmentedControl aria-label="View">
        <SegmentedControl.Item value="a">A</SegmentedControl.Item>
        <SegmentedControl.Item value="b">B</SegmentedControl.Item>
      </SegmentedControl>,
    );

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
  });

  it('selects the controlled value', () => {
    renderWithTheme(
      <SegmentedControl value="grid" aria-label="View">
        <SegmentedControl.Item value="list">List</SegmentedControl.Item>
        <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
      </SegmentedControl>,
    );

    const gridRadio = screen.getByRole('radio', { name: 'Grid' });
    expect(gridRadio).toBeChecked();
  });

  it('calls onValueChange when an item is clicked', () => {
    const handleChange = vi.fn();
    renderWithTheme(
      <SegmentedControl value="list" onValueChange={handleChange} aria-label="View">
        <SegmentedControl.Item value="list">List</SegmentedControl.Item>
        <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
      </SegmentedControl>,
    );

    fireEvent.click(screen.getByText('Grid'));
    expect(handleChange).toHaveBeenCalledWith('grid');
  });

  it('works uncontrolled with defaultValue', () => {
    renderWithTheme(
      <SegmentedControl defaultValue="grid" aria-label="View">
        <SegmentedControl.Item value="list">List</SegmentedControl.Item>
        <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
      </SegmentedControl>,
    );

    expect(screen.getByRole('radio', { name: 'Grid' })).toBeChecked();

    fireEvent.click(screen.getByText('List'));
    expect(screen.getByRole('radio', { name: 'List' })).toBeChecked();
  });

  it('applies size data attribute', () => {
    renderWithTheme(
      <SegmentedControl size="sm" aria-label="View">
        <SegmentedControl.Item value="a">A</SegmentedControl.Item>
      </SegmentedControl>,
    );

    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-ov-size', 'sm');
  });

  it('defaults size to md', () => {
    renderWithTheme(
      <SegmentedControl aria-label="View">
        <SegmentedControl.Item value="a">A</SegmentedControl.Item>
      </SegmentedControl>,
    );

    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-ov-size', 'md');
  });

  it('disables all items when root is disabled', () => {
    renderWithTheme(
      <SegmentedControl disabled aria-label="View">
        <SegmentedControl.Item value="a">A</SegmentedControl.Item>
        <SegmentedControl.Item value="b">B</SegmentedControl.Item>
      </SegmentedControl>,
    );

    const radios = screen.getAllByRole('radio');
    radios.forEach((radio) => expect(radio).toBeDisabled());
  });

  it('disables individual items', () => {
    renderWithTheme(
      <SegmentedControl aria-label="View">
        <SegmentedControl.Item value="a">A</SegmentedControl.Item>
        <SegmentedControl.Item value="b" disabled>B</SegmentedControl.Item>
      </SegmentedControl>,
    );

    expect(screen.getByRole('radio', { name: 'A' })).not.toBeDisabled();
    expect(screen.getByRole('radio', { name: 'B' })).toBeDisabled();
  });

  it('forwards ref on root', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(
      <SegmentedControl ref={ref} aria-label="View">
        <SegmentedControl.Item value="a">A</SegmentedControl.Item>
      </SegmentedControl>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderWithTheme(
      <SegmentedControl className="custom" aria-label="View">
        <SegmentedControl.Item value="a">A</SegmentedControl.Item>
      </SegmentedControl>,
    );

    expect(screen.getByRole('radiogroup')).toHaveClass('custom');
  });

  it('renders xs and xl sizes', () => {
    const { rerender } = renderWithTheme(
      <SegmentedControl size="xs" aria-label="View">
        <SegmentedControl.Item value="a">A</SegmentedControl.Item>
      </SegmentedControl>,
    );
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-ov-size', 'xs');

    rerender(
      <SegmentedControl size="xl" aria-label="View">
        <SegmentedControl.Item value="a">A</SegmentedControl.Item>
      </SegmentedControl>,
    );
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-ov-size', 'xl');
  });
});
