import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { CheckboxGroup } from './CheckboxGroup';

describe('CheckboxGroup', () => {
  it('inherits style props in group items', () => {
    renderWithTheme(
      <CheckboxGroup variant="outline" color="success" size="sm" defaultValue={['a']}>
        <CheckboxGroup.Item value="a">Option A</CheckboxGroup.Item>
      </CheckboxGroup>,
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Option A' });
    expect(checkbox).toHaveAttribute('data-ov-variant', 'outline');
    expect(checkbox).toHaveAttribute('data-ov-color', 'success');
    expect(checkbox).toHaveAttribute('data-ov-size', 'sm');
  });

  it('applies orientation attribute for layout styling', () => {
    renderWithTheme(
      <CheckboxGroup orientation="horizontal">
        <CheckboxGroup.Item value="a">A</CheckboxGroup.Item>
        <CheckboxGroup.Item value="b">B</CheckboxGroup.Item>
      </CheckboxGroup>,
    );

    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('data-ov-orientation', 'horizontal');
  });
});
