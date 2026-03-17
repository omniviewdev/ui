import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { NumberInput } from './NumberInput';

describe('NumberInput', () => {
  it('renders themed number field controls', () => {
    renderWithTheme(
      <NumberInput.Root defaultValue={3} variant="outline" color="success" size="sm">
        <NumberInput.Label>Retries</NumberInput.Label>
        <NumberInput.Group>
          <NumberInput.Decrement aria-label="Decrease" />
          <NumberInput.Input aria-label="Retries" />
          <NumberInput.Increment aria-label="Increase" />
        </NumberInput.Group>
      </NumberInput.Root>,
    );

    const input = screen.getByRole('textbox', { name: 'Retries' });
    const group = input.closest('[data-ov-variant]');

    expect(group).toHaveAttribute('data-ov-variant', 'outline');
    expect(group).toHaveAttribute('data-ov-color', 'success');
    expect(group).toHaveAttribute('data-ov-size', 'sm');
    expect(input).toHaveValue('3');
  });

  it('increments and decrements value via steppers', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <NumberInput.Root defaultValue={2} min={0} max={5}>
        <NumberInput.Group>
          <NumberInput.Decrement aria-label="Decrease" />
          <NumberInput.Input aria-label="Value" />
          <NumberInput.Increment aria-label="Increase" />
        </NumberInput.Group>
      </NumberInput.Root>,
    );

    const input = screen.getByRole('textbox', { name: 'Value' });

    await user.click(screen.getByRole('button', { name: 'Increase' }));
    expect(input).toHaveValue('3');

    await user.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(input).toHaveValue('2');
  });

  it('renders xs and xl sizes', () => {
    const { rerender } = renderWithTheme(
      <NumberInput.Root defaultValue={1} size="xs">
        <NumberInput.Group>
          <NumberInput.Decrement aria-label="Decrease" />
          <NumberInput.Input aria-label="Value" />
          <NumberInput.Increment aria-label="Increase" />
        </NumberInput.Group>
      </NumberInput.Root>,
    );
    const input = screen.getByRole('textbox', { name: 'Value' });
    expect(input.closest('[data-ov-size]')).toHaveAttribute('data-ov-size', 'xs');

    rerender(
      <NumberInput.Root defaultValue={1} size="xl">
        <NumberInput.Group>
          <NumberInput.Decrement aria-label="Decrease" />
          <NumberInput.Input aria-label="Value" />
          <NumberInput.Increment aria-label="Increase" />
        </NumberInput.Group>
      </NumberInput.Root>,
    );
    expect(screen.getByRole('textbox', { name: 'Value' }).closest('[data-ov-size]')).toHaveAttribute('data-ov-size', 'xl');
  });

  it('renders discovery and secondary colors', () => {
    const { rerender } = renderWithTheme(
      <NumberInput.Root defaultValue={1} color="discovery">
        <NumberInput.Group>
          <NumberInput.Decrement aria-label="Decrease" />
          <NumberInput.Input aria-label="Value" />
          <NumberInput.Increment aria-label="Increase" />
        </NumberInput.Group>
      </NumberInput.Root>,
    );
    expect(screen.getByRole('textbox', { name: 'Value' }).closest('[data-ov-color]')).toHaveAttribute('data-ov-color', 'discovery');

    rerender(
      <NumberInput.Root defaultValue={1} color="secondary">
        <NumberInput.Group>
          <NumberInput.Decrement aria-label="Decrease" />
          <NumberInput.Input aria-label="Value" />
          <NumberInput.Increment aria-label="Increase" />
        </NumberInput.Group>
      </NumberInput.Root>,
    );
    expect(screen.getByRole('textbox', { name: 'Value' }).closest('[data-ov-color]')).toHaveAttribute('data-ov-color', 'secondary');
  });
});
