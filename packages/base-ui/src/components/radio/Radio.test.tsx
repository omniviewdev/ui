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

  it('applies xs size attribute', () => {
    renderWithTheme(
      <RadioGroup>
        <Radio.Item value="a" size="xs">
          Tiny option
        </Radio.Item>
      </RadioGroup>,
    );
    const radio = screen.getByRole('radio', { name: 'Tiny option' });
    expect(radio).toHaveAttribute('data-ov-size', 'xs');
  });

  it('applies xl size attribute', () => {
    renderWithTheme(
      <RadioGroup>
        <Radio.Item value="a" size="xl">
          Large option
        </Radio.Item>
      </RadioGroup>,
    );
    const radio = screen.getByRole('radio', { name: 'Large option' });
    expect(radio).toHaveAttribute('data-ov-size', 'xl');
  });

  it('applies discovery color attribute', () => {
    renderWithTheme(
      <RadioGroup defaultValue="a">
        <Radio.Item value="a" color="discovery">
          Discovery feature
        </Radio.Item>
      </RadioGroup>,
    );
    const radio = screen.getByRole('radio', { name: 'Discovery feature' });
    expect(radio).toHaveAttribute('data-ov-color', 'discovery');
    expect(radio).toHaveAttribute('data-checked');
  });

  it('applies secondary color attribute', () => {
    renderWithTheme(
      <RadioGroup defaultValue="a">
        <Radio.Item value="a" color="secondary">
          Secondary option
        </Radio.Item>
      </RadioGroup>,
    );
    const radio = screen.getByRole('radio', { name: 'Secondary option' });
    expect(radio).toHaveAttribute('data-ov-color', 'secondary');
    expect(radio).toHaveAttribute('data-checked');
  });
});
