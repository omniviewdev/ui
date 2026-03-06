import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders themed checkbox item with description', () => {
    renderWithTheme(
      <Checkbox.Item variant="outline" color="warning" size="lg" defaultChecked>
        Enable snapshots
      </Checkbox.Item>,
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Enable snapshots' });
    expect(checkbox).toHaveAttribute('data-ov-variant', 'outline');
    expect(checkbox).toHaveAttribute('data-ov-color', 'warning');
    expect(checkbox).toHaveAttribute('data-ov-size', 'lg');
    expect(checkbox).toHaveAttribute('data-checked');
  });

  it('supports indeterminate state with default indicator', () => {
    renderWithTheme(<Checkbox.Item indeterminate>Partial selection</Checkbox.Item>);

    const checkbox = screen.getByRole('checkbox', { name: 'Partial selection' });
    expect(checkbox).toHaveAttribute('data-indeterminate');
  });

  it('renders custom indicator content', () => {
    renderWithTheme(
      <Checkbox.Item indicator={<span data-testid="indicator">I</span>} defaultChecked>
        Flagged
      </Checkbox.Item>,
    );

    expect(screen.getByTestId('indicator')).toBeInTheDocument();
  });

  it('applies label position and spread layout attributes', () => {
    renderWithTheme(
      <Checkbox.Item labelPosition="start" layout="spread" defaultChecked>
        Settings option
      </Checkbox.Item>,
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Settings option' });
    expect(checkbox).toHaveAttribute('data-ov-label-position', 'start');
    expect(checkbox).toHaveAttribute('data-ov-layout', 'spread');
  });
});
