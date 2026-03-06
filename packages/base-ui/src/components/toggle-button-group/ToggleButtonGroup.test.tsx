import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { ToggleButtonGroup } from './ToggleButtonGroup';

describe('ToggleButtonGroup', () => {
  it('inherits style props to items', () => {
    renderWithTheme(
      <ToggleButtonGroup variant="outline" color="warning" size="sm" defaultValue={['one']}>
        <ToggleButtonGroup.Item value="one">One</ToggleButtonGroup.Item>
      </ToggleButtonGroup>,
    );

    const button = screen.getByRole('button', { name: 'One' });
    expect(button).toHaveAttribute('data-ov-variant', 'outline');
    expect(button).toHaveAttribute('data-ov-color', 'warning');
    expect(button).toHaveAttribute('data-ov-size', 'sm');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('supports single selection behavior', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <ToggleButtonGroup defaultValue={['one']}>
        <ToggleButtonGroup.Item value="one">One</ToggleButtonGroup.Item>
        <ToggleButtonGroup.Item value="two">Two</ToggleButtonGroup.Item>
      </ToggleButtonGroup>,
    );

    const one = screen.getByRole('button', { name: 'One' });
    const two = screen.getByRole('button', { name: 'Two' });
    expect(one).toHaveAttribute('aria-pressed', 'true');
    expect(two).toHaveAttribute('aria-pressed', 'false');

    await user.click(two);
    expect(one).toHaveAttribute('aria-pressed', 'false');
    expect(two).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders item decorators and group attributes', () => {
    renderWithTheme(
      <ToggleButtonGroup size="lg" attached={false} defaultValue={['one']}>
        <ToggleButtonGroup.Item value="one" startDecorator={<span data-testid="left">L</span>}>
          One
        </ToggleButtonGroup.Item>
      </ToggleButtonGroup>,
    );

    const group = document.querySelector('[data-ov-attached="false"]');
    const button = screen.getByRole('button', { name: /One/ });

    expect(group).toHaveAttribute('data-ov-size', 'lg');
    expect(group).toHaveAttribute('data-ov-attached', 'false');
    expect(button.querySelector('[data-ov-slot="start-decorator"]')).toBeTruthy();
    expect(screen.getByTestId('left')).toBeInTheDocument();
  });
});
