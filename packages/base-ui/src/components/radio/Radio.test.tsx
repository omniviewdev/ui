import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { RadioGroup } from '../radio-group';
import { Radio } from './Radio';

describe('Radio', () => {
  it('renders themed radio item in checked group state', () => {
    renderWithTheme(
      <RadioGroup defaultValue="secure">
        <Radio.Item value="secure" variant="outline" color="warning" size="lg">
          Secure mode
        </Radio.Item>
      </RadioGroup>,
    );

    const radio = screen.getByRole('radio', { name: 'Secure mode' });
    expect(radio).toHaveAttribute('data-ov-variant', 'outline');
    expect(radio).toHaveAttribute('data-ov-color', 'warning');
    expect(radio).toHaveAttribute('data-ov-size', 'lg');
    expect(radio).toHaveAttribute('data-checked');
  });

  it('renders custom indicator content', () => {
    renderWithTheme(
      <RadioGroup defaultValue="a">
        <Radio.Item value="a" indicator={<span data-testid="dot">D</span>}>
          Option A
        </Radio.Item>
      </RadioGroup>,
    );

    expect(screen.getByTestId('dot')).toBeInTheDocument();
  });
});
