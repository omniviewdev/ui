import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderAI } from '../../test/render';
import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  it('renders textarea with placeholder', () => {
    renderAI(<ChatInput value="" onChange={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const onChange = vi.fn();
    renderAI(<ChatInput value="" onChange={onChange} onSubmit={vi.fn()} />);
    await userEvent.type(screen.getByRole('textbox'), 'h');
    expect(onChange).toHaveBeenCalled();
  });

  it('calls onSubmit on Enter', async () => {
    const onSubmit = vi.fn();
    renderAI(<ChatInput value="hello" onChange={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByRole('textbox'), '{enter}');
    expect(onSubmit).toHaveBeenCalledWith('hello');
  });

  it('does not submit on Shift+Enter', async () => {
    const onSubmit = vi.fn();
    renderAI(<ChatInput value="hello" onChange={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByRole('textbox'), '{Shift>}{enter}{/Shift}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not submit empty value', async () => {
    const onSubmit = vi.fn();
    renderAI(<ChatInput value="" onChange={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByRole('textbox'), '{enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('renders actions slot', () => {
    renderAI(
      <ChatInput
        value=""
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        actions={<button data-testid="action">Attach</button>}
      />,
    );
    expect(screen.getByTestId('action')).toBeInTheDocument();
  });

  it('shows character counter with maxLength', () => {
    renderAI(
      <ChatInput value="hello" onChange={vi.fn()} onSubmit={vi.fn()} maxLength={100} />,
    );
    expect(screen.getByText('5/100')).toBeInTheDocument();
  });

  it('disables input', () => {
    renderAI(<ChatInput value="" onChange={vi.fn()} onSubmit={vi.fn()} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<ChatInput ref={ref} value="" onChange={vi.fn()} onSubmit={vi.fn()} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderAI(
      <ChatInput
        value=""
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        className="custom"
        data-testid="ci"
      />,
    );
    expect(screen.getByTestId('ci').className).toContain('custom');
  });
});
