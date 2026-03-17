import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Input } from './Input';

describe('Input', () => {
  it('renders themed control with decorators and mono mode', () => {
    renderWithTheme(
      <Input.Root color="warning" variant="outline" size="sm">
        <Input.Label>Cluster ID</Input.Label>
        <Input.Control
          mono
          placeholder="cluster-dev"
          startDecorator={<span data-testid="start">S</span>}
          endDecorator={<span data-testid="end">E</span>}
        />
      </Input.Root>,
    );

    const input = screen.getByPlaceholderText('cluster-dev');
    const shell = input.closest('[data-ov-variant]');

    expect(shell).toHaveAttribute('data-ov-variant', 'outline');
    expect(shell).toHaveAttribute('data-ov-color', 'warning');
    expect(shell).toHaveAttribute('data-ov-size', 'sm');
    expect(shell).toHaveAttribute('data-ov-mono', 'true');
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('forwards value changes through Base UI input callbacks', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderWithTheme(
      <Input.Root>
        <Input.Control placeholder="Search" onValueChange={onValueChange} />
      </Input.Root>,
    );

    const input = screen.getByPlaceholderText('Search');
    await user.type(input, 'abc');

    expect(onValueChange).toHaveBeenCalled();
    expect(input).toHaveValue('abc');
  });

  it('applies invalid state styling hooks from Field root', () => {
    renderWithTheme(
      <Input.Root invalid>
        <Input.Label>Required</Input.Label>
        <Input.Control placeholder="Required" />
      </Input.Root>,
    );

    const shell = screen.getByPlaceholderText('Required').closest('[data-ov-variant]');
    expect(shell).toBeInTheDocument();
  });

  it('renders with xs size', () => {
    renderWithTheme(
      <Input.Root size="xs">
        <Input.Control placeholder="xs-input" />
      </Input.Root>,
    );

    const shell = screen.getByPlaceholderText('xs-input').closest('[data-ov-size]');
    expect(shell).toHaveAttribute('data-ov-size', 'xs');
  });

  it('renders with xl size', () => {
    renderWithTheme(
      <Input.Root size="xl">
        <Input.Control placeholder="xl-input" />
      </Input.Root>,
    );

    const shell = screen.getByPlaceholderText('xl-input').closest('[data-ov-size]');
    expect(shell).toHaveAttribute('data-ov-size', 'xl');
  });

  it('renders with discovery color', () => {
    renderWithTheme(
      <Input.Root color="discovery">
        <Input.Control placeholder="discovery-input" />
      </Input.Root>,
    );

    const shell = screen.getByPlaceholderText('discovery-input').closest('[data-ov-color]');
    expect(shell).toHaveAttribute('data-ov-color', 'discovery');
  });

  it('renders with secondary color', () => {
    renderWithTheme(
      <Input.Root color="secondary">
        <Input.Control placeholder="secondary-input" />
      </Input.Root>,
    );

    const shell = screen.getByPlaceholderText('secondary-input').closest('[data-ov-color]');
    expect(shell).toHaveAttribute('data-ov-color', 'secondary');
  });
});
