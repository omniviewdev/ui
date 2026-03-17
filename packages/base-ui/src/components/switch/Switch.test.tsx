import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Switch } from './Switch';

describe('Switch', () => {
  it('renders themed switch with generated thumb', () => {
    renderWithTheme(
      <Switch variant="soft" color="brand" size="lg" defaultChecked>
        Auto save
      </Switch>,
    );

    const toggle = screen.getByRole('switch', { name: 'Auto save' });
    expect(toggle).toHaveAttribute('data-ov-variant', 'soft');
    expect(toggle).toHaveAttribute('data-ov-color', 'brand');
    expect(toggle).toHaveAttribute('data-ov-size', 'lg');
    expect(toggle).toHaveAttribute('data-checked');
  });

  it('toggles checked state on click', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    renderWithTheme(<Switch onCheckedChange={onCheckedChange}>Session lock</Switch>);

    const toggle = screen.getByRole('switch', { name: 'Session lock' });
    await user.click(toggle);

    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });

  it('supports custom thumb content', () => {
    renderWithTheme(
      <Switch
        defaultChecked
        thumb={
          <Switch.Thumb>
            <span data-testid="thumb-dot" />
          </Switch.Thumb>
        }
      >
        Custom thumb
      </Switch>,
    );

    expect(screen.getByTestId('thumb-dot')).toBeInTheDocument();
  });

  it('applies label position and spread layout attributes', () => {
    renderWithTheme(
      <Switch labelPosition="start" layout="spread">
        Settings row
      </Switch>,
    );

    const field = screen.getByText('Settings row').closest('label');
    expect(field).toHaveAttribute('data-ov-label-position', 'start');
    expect(field).toHaveAttribute('data-ov-layout', 'spread');
  });

  it('applies xs size attribute', () => {
    renderWithTheme(<Switch size="xs">Tiny toggle</Switch>);
    const toggle = screen.getByRole('switch', { name: 'Tiny toggle' });
    expect(toggle).toHaveAttribute('data-ov-size', 'xs');
  });

  it('applies xl size attribute', () => {
    renderWithTheme(<Switch size="xl">Large toggle</Switch>);
    const toggle = screen.getByRole('switch', { name: 'Large toggle' });
    expect(toggle).toHaveAttribute('data-ov-size', 'xl');
  });

  it('applies discovery color attribute', () => {
    renderWithTheme(
      <Switch color="discovery" defaultChecked>
        Discovery feature
      </Switch>,
    );
    const toggle = screen.getByRole('switch', { name: 'Discovery feature' });
    expect(toggle).toHaveAttribute('data-ov-color', 'discovery');
    expect(toggle).toHaveAttribute('data-checked');
  });

  it('applies secondary color attribute', () => {
    renderWithTheme(
      <Switch color="secondary" defaultChecked>
        Secondary option
      </Switch>,
    );
    const toggle = screen.getByRole('switch', { name: 'Secondary option' });
    expect(toggle).toHaveAttribute('data-ov-color', 'secondary');
    expect(toggle).toHaveAttribute('data-checked');
  });
});
