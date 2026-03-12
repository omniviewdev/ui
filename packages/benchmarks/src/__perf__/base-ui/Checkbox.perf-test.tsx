import { test } from 'vitest';
import { measureRenders } from 'reassure';
import { fireEvent, screen } from '@testing-library/react';
import { Checkbox } from '@omniview/base-ui';
import { ThemeWrapper } from '../utils/theme-wrapper';

test('Checkbox: mount', async () => {
  await measureRenders(
    <Checkbox.Item defaultChecked={false}>Accept terms</Checkbox.Item>,
    { wrapper: ThemeWrapper },
  );
});

test('Checkbox: toggle checked', async () => {
  await measureRenders(
    <Checkbox.Item defaultChecked={false}>Accept terms</Checkbox.Item>,
    {
      wrapper: ThemeWrapper,
      scenario: async () => {
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);
      },
    },
  );
});

/**
 * Critical scenario: toggling one checkbox in a list.
 * If memoization is missing, ALL checkboxes re-render on a single toggle.
 */
test('Checkbox: toggle one in list of 20', async () => {
  const items = Array.from({ length: 20 }, (_, i) => `Option ${i}`);
  await measureRenders(
    <div>
      {items.map((label) => (
        <Checkbox.Item key={label} defaultChecked={false}>
          {label}
        </Checkbox.Item>
      ))}
    </div>,
    {
      wrapper: ThemeWrapper,
      scenario: async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]!);
      },
    },
  );
});
