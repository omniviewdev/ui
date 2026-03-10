import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderAI } from '../../test/render';
import { AIMessageEditor } from './AIMessageEditor';

const defaults = {
  defaultValue: 'Hello world',
  onSave: vi.fn(),
  onCancel: vi.fn(),
};

describe('AIMessageEditor', () => {
  it('renders textarea with defaultValue', () => {
    renderAI(<AIMessageEditor {...defaults} />);
    expect(screen.getByRole('textbox')).toHaveValue('Hello world');
  });

  it('calls onSave with edited text on Save click', async () => {
    const onSave = vi.fn();
    renderAI(<AIMessageEditor {...defaults} onSave={onSave} autoFocus={false} />);
    const textarea = screen.getByRole('textbox');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Updated text');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith('Updated text');
  });

  it('calls onCancel on Cancel click', async () => {
    const onCancel = vi.fn();
    renderAI(<AIMessageEditor {...defaults} onCancel={onCancel} autoFocus={false} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onCancel on Escape key', async () => {
    const onCancel = vi.fn();
    renderAI(<AIMessageEditor {...defaults} onCancel={onCancel} autoFocus={false} />);
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('disables Save when value is unchanged', () => {
    renderAI(<AIMessageEditor {...defaults} autoFocus={false} />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('disables Save when value is empty', async () => {
    renderAI(<AIMessageEditor {...defaults} autoFocus={false} />);
    const textarea = screen.getByRole('textbox');
    await userEvent.clear(textarea);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('shows spinner when saving=true', () => {
    renderAI(
      <AIMessageEditor {...defaults} defaultValue="a" saving autoFocus={false} />,
    );
    // Spinner renders as a span with role status
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save/ })).toBeDisabled();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<AIMessageEditor ref={ref} {...defaults} autoFocus={false} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderAI(
      <AIMessageEditor
        {...defaults}
        className="custom"
        data-testid="editor"
        autoFocus={false}
      />,
    );
    expect(screen.getByTestId('editor').className).toContain('custom');
  });
});
