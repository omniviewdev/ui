import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { RadioGroup } from './RadioGroup';

describe('RadioGroup', () => {
  it('inherits style props in group items', () => {
    renderWithTheme(
      <RadioGroup variant="outline" color="success" size="sm" defaultValue="a">
        <RadioGroup.Item value="a">A</RadioGroup.Item>
      </RadioGroup>,
    );

    const radio = screen.getByRole('radio', { name: 'A' });
    expect(radio).toHaveAttribute('data-ov-variant', 'outline');
    expect(radio).toHaveAttribute('data-ov-color', 'success');
    expect(radio).toHaveAttribute('data-ov-size', 'sm');
  });

  it('applies orientation attribute for layout styling', () => {
    renderWithTheme(
      <RadioGroup orientation="horizontal" defaultValue="a">
        <RadioGroup.Item value="a">A</RadioGroup.Item>
        <RadioGroup.Item value="b">B</RadioGroup.Item>
      </RadioGroup>,
    );

    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAttribute('data-ov-orientation', 'horizontal');
  });
});
