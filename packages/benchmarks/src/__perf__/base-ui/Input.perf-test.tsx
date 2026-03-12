import { test } from 'vitest';
import { type ChangeEvent, useState } from 'react';
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
 * Controlled input wrapper so each fireEvent.change triggers a state update
 * and re-render, simulating real per-keystroke behavior.
 */
function ControlledInput() {
  const [value, setValue] = useState('');
  return (
    <Input>
      <Input.Label>Username</Input.Label>
      <Input.Control
        placeholder="Enter username"
        data-testid="input"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      />
    </Input>
  );
}

/**
 * Typing in an input field — each keystroke should cause minimal re-renders.
 * High counts here signal uncontrolled→controlled mismatches or expensive
 * parent re-renders from onChange.
 */
test('Input: type 10 characters', async () => {
  await measureRenders(<ControlledInput />, {
    wrapper: ThemeWrapper,
    scenario: async () => {
      const input = screen.getByTestId('input');
      const chars = 'helloworld';
      for (let i = 0; i < chars.length; i++) {
        fireEvent.change(input, { target: { value: chars.slice(0, i + 1) } });
      }
    },
  });
});
