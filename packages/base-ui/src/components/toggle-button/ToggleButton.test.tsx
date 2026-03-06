import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { ToggleButton } from './ToggleButton';

describe('ToggleButton', () => {
  it('renders with style props and can start pressed', () => {
    renderWithTheme(
      <ToggleButton defaultPressed variant="outline" color="brand" size="sm">
        Follow Logs
      </ToggleButton>,
    );

    const button = screen.getByRole('button', { name: 'Follow Logs' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('data-ov-variant', 'outline');
    expect(button).toHaveAttribute('data-ov-color', 'brand');
    expect(button).toHaveAttribute('data-ov-size', 'sm');
  });

  it('toggles pressed state on click', async () => {
    const user = userEvent.setup();

    renderWithTheme(<ToggleButton>Attach</ToggleButton>);

    const button = screen.getByRole('button', { name: 'Attach' });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders start and end decorators', () => {
    renderWithTheme(
      <ToggleButton startDecorator={<span data-testid="left">L</span>} endDecorator="⌘K">
        Search
      </ToggleButton>,
    );

    const button = screen.getByRole('button', { name: /Search/ });
    expect(button.querySelector('[data-ov-slot="start-decorator"]')).toBeTruthy();
    expect(button.querySelector('[data-ov-slot="end-decorator"]')).toBeTruthy();
    expect(screen.getByTestId('left')).toBeInTheDocument();
  });
});
