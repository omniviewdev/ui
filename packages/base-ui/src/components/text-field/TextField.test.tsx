import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { TextField } from './TextField';

describe('TextField', () => {
  it('renders and connects label to input', () => {
    renderWithTheme(
      <TextField.Root variant="outline" color="brand" size="md">
        <TextField.Label>Workspace</TextField.Label>
        <TextField.Control placeholder="name" />
      </TextField.Root>,
    );

    const input = screen.getByLabelText('Workspace');
    expect(input).toBeInTheDocument();
    expect(input.closest('[data-ov-color]')).toHaveAttribute('data-ov-color', 'brand');
  });

  it('accepts input changes', () => {
    renderWithTheme(
      <TextField.Root>
        <TextField.Label>Workspace</TextField.Label>
        <TextField.Control placeholder="name" />
      </TextField.Root>,
    );

    const input = screen.getByPlaceholderText('name');
    fireEvent.change(input, { target: { value: 'dev-cluster' } });
    expect(input).toHaveValue('dev-cluster');
  });
});
