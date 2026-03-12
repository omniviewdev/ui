import { test } from 'vitest';
import { measureRenders } from 'reassure';
import { fireEvent, screen } from '@testing-library/react';
import { Input, TextField } from '@omniview/base-ui';
import { ThemeWrapper } from '../utils/theme-wrapper';

test('Input: mount', async () => {
  await measureRenders(
    <Input>
      <Input.Label>Username</Input.Label>
      <Input.Control placeholder="Enter username" />
    </Input>,
    { wrapper: ThemeWrapper },
  );
});

test('TextField: mount', async () => {
  await measureRenders(
    <TextField>
      <TextField.Label>Email</TextField.Label>
      <TextField.Control placeholder="Enter email" />
    </TextField>,
    { wrapper: ThemeWrapper },
  );
});

/**
 * Typing in an input field — each keystroke should cause minimal re-renders.
 * High counts here signal uncontrolled→controlled mismatches or expensive
 * parent re-renders from onChange.
 */
test('Input: type 10 characters', async () => {
  await measureRenders(
    <Input>
      <Input.Label>Username</Input.Label>
      <Input.Control placeholder="Enter username" data-testid="input" />
    </Input>,
    {
      wrapper: ThemeWrapper,
      scenario: async () => {
        const input = screen.getByTestId('input');
        fireEvent.change(input, { target: { value: 'helloworld' } });
      },
    },
  );
});
