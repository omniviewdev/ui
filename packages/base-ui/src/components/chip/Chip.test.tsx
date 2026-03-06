import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Chip } from './Chip';

describe('Chip', () => {
  it('renders with style props, mono mode, and decorators', () => {
    renderWithTheme(
      <Chip
        variant="outline"
        color="warning"
        size="sm"
        mono
        startDecorator={<span data-testid="start">S</span>}
        endDecorator={<span data-testid="end">E</span>}
      >
        /api/v1/chat
      </Chip>,
    );

    const chip = screen.getByText('/api/v1/chat').closest('[data-ov-color]');
    expect(chip).toHaveAttribute('data-ov-variant', 'outline');
    expect(chip).toHaveAttribute('data-ov-color', 'warning');
    expect(chip).toHaveAttribute('data-ov-size', 'sm');
    expect(chip).toHaveAttribute('data-ov-mono', 'true');
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('uses button semantics when clickable', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    renderWithTheme(
      <Chip clickable onClick={onClick}>
        Runnable
      </Chip>,
    );

    const chip = screen.getByRole('button', { name: 'Runnable' });
    expect(chip).toHaveAttribute('data-ov-clickable', 'true');
    await user.click(chip);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('inherits styles through Chip.Group and Chip.Item', () => {
    renderWithTheme(
      <Chip.Group color="success" variant="soft" size="lg" mono clickable>
        <Chip.Item>GET</Chip.Item>
      </Chip.Group>,
    );

    const chip = screen.getByRole('button', { name: 'GET' });
    expect(chip).toHaveAttribute('data-ov-color', 'success');
    expect(chip).toHaveAttribute('data-ov-variant', 'soft');
    expect(chip).toHaveAttribute('data-ov-size', 'lg');
    expect(chip).toHaveAttribute('data-ov-mono', 'true');
    expect(chip).toHaveAttribute('data-ov-clickable', 'true');
  });
});
