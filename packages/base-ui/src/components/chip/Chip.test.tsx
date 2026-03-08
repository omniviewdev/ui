import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
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

  describe('Chip.Group', () => {
    it('renders children in a wrapping row by default', () => {
      renderWithTheme(
        <Chip.Group data-testid="group">
          <Chip.Item>A</Chip.Item>
          <Chip.Item>B</Chip.Item>
        </Chip.Group>,
      );

      const group = screen.getByTestId('group');
      expect(group).toHaveAttribute('data-ov-wrap', 'true');
      expect(group).toHaveAttribute('data-ov-spacing', '1');
    });

    it('applies custom spacing', () => {
      renderWithTheme(
        <Chip.Group data-testid="group" spacing={3}>
          <Chip.Item>A</Chip.Item>
        </Chip.Group>,
      );

      expect(screen.getByTestId('group')).toHaveAttribute('data-ov-spacing', '3');
    });

    it('disables wrapping when wrap is false', () => {
      renderWithTheme(
        <Chip.Group data-testid="group" wrap={false}>
          <Chip.Item>A</Chip.Item>
        </Chip.Group>,
      );

      expect(screen.getByTestId('group')).toHaveAttribute('data-ov-wrap', 'false');
    });

    it('merges className', () => {
      renderWithTheme(
        <Chip.Group data-testid="group" className="custom">
          <Chip.Item>A</Chip.Item>
        </Chip.Group>,
      );

      expect(screen.getByTestId('group').className).toContain('custom');
    });

    it('forwards ref', () => {
      const ref = { current: null } as unknown as React.RefObject<HTMLDivElement>;
      renderWithTheme(
        <Chip.Group ref={ref}>
          <Chip.Item>A</Chip.Item>
        </Chip.Group>,
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});
