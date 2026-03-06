import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  it('renders with themed style attributes', () => {
    renderWithTheme(
      <SearchInput
        placeholder="Search"
        defaultValue="runtime"
        variant="outline"
        color="brand"
        size="sm"
      />,
    );

    const input = screen.getByPlaceholderText('Search');
    const shell = input.closest('[data-ov-variant]');

    expect(shell).toHaveAttribute('data-ov-variant', 'outline');
    expect(shell).toHaveAttribute('data-ov-color', 'brand');
    expect(shell).toHaveAttribute('data-ov-size', 'sm');
  });

  it('updates value and clears content through clear button', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onClear = vi.fn();

    renderWithTheme(
      <SearchInput
        placeholder="Search"
        defaultValue="omniview"
        onValueChange={onValueChange}
        onClear={onClear}
      />,
    );

    expect(screen.getAllByRole('button', { name: 'Clear search' })).toHaveLength(1);
    const clearButton = screen.getByRole('button', { name: 'Clear search' });
    await user.click(clearButton);

    expect(onValueChange).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalledTimes(1);
    const input = screen.getByPlaceholderText('Search');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveValue('');
  });

  it('calls value callback while typing', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderWithTheme(<SearchInput placeholder="Filter" onValueChange={onValueChange} />);

    const input = screen.getByPlaceholderText('Filter');
    await user.type(input, 'abc');

    expect(onValueChange).toHaveBeenLastCalledWith('abc');
  });
});
