import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Radio } from '../radio';
import { RadioGroup } from './RadioGroup';

describe('RadioGroup', () => {
  it('preserves inherited styles and keyboard selection across mixed radio compositions', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <RadioGroup variant="outline" color="success" size="lg" defaultValue="a">
        <RadioGroup.Item value="a">A</RadioGroup.Item>
        <Radio.Item value="b">B</Radio.Item>
        <Radio value="c" size="sm" color="brand">
          C
        </Radio>
        <Radio.Root value="d" aria-label="D">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
        </Radio.Root>
      </RadioGroup>,
    );

    for (const name of ['B', 'D']) {
      const radio = screen.getByRole('radio', { name });
      expect(radio).toHaveAttribute('data-ov-size', 'lg');
      expect(radio).toHaveAttribute('data-ov-color', 'success');
      expect(radio).toHaveAttribute('data-ov-variant', 'outline');
    }
    const override = screen.getByRole('radio', { name: 'C' });
    expect(override).toHaveAttribute('data-ov-size', 'sm');
    expect(override).toHaveAttribute('data-ov-color', 'brand');
    expect(override).toHaveAttribute('data-ov-variant', 'outline');

    await user.click(screen.getByRole('radio', { name: 'B' }));
    expect(screen.getByRole('radio', { name: 'B' })).toHaveAttribute('aria-checked', 'true');
    await user.keyboard('{ArrowDown}');
    expect(override).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'B' })).toHaveAttribute('aria-checked', 'false');
  });
});
