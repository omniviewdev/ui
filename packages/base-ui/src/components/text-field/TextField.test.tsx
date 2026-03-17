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

  it('renders with xs size', () => {
    renderWithTheme(
      <TextField.Root size="xs">
        <TextField.Control placeholder="xs-field" />
      </TextField.Root>,
    );

    const input = screen.getByPlaceholderText('xs-field');
    expect(input.closest('[data-ov-size]')).toHaveAttribute('data-ov-size', 'xs');
  });

  it('renders with xl size', () => {
    renderWithTheme(
      <TextField.Root size="xl">
        <TextField.Control placeholder="xl-field" />
      </TextField.Root>,
    );

    const input = screen.getByPlaceholderText('xl-field');
    expect(input.closest('[data-ov-size]')).toHaveAttribute('data-ov-size', 'xl');
  });

  it('renders with discovery color', () => {
    renderWithTheme(
      <TextField.Root color="discovery">
        <TextField.Control placeholder="discovery-field" />
      </TextField.Root>,
    );

    const input = screen.getByPlaceholderText('discovery-field');
    expect(input.closest('[data-ov-color]')).toHaveAttribute('data-ov-color', 'discovery');
  });

  it('renders with secondary color', () => {
    renderWithTheme(
      <TextField.Root color="secondary">
        <TextField.Control placeholder="secondary-field" />
      </TextField.Root>,
    );

    const input = screen.getByPlaceholderText('secondary-field');
    expect(input.closest('[data-ov-color]')).toHaveAttribute('data-ov-color', 'secondary');
  });
});
