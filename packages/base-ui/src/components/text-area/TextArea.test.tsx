import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { TextArea } from './TextArea';

describe('TextArea', () => {
  it('renders themed textarea with mono styling flag', () => {
    renderWithTheme(
      <TextArea.Root variant="outline" color="danger" size="lg">
        <TextArea.Label>Manifest</TextArea.Label>
        <TextArea.Control mono placeholder="Paste YAML" rows={6} />
      </TextArea.Root>,
    );

    const textarea = screen.getByPlaceholderText('Paste YAML');
    expect(textarea).toHaveAttribute('data-ov-variant', 'outline');
    expect(textarea).toHaveAttribute('data-ov-color', 'danger');
    expect(textarea).toHaveAttribute('data-ov-size', 'lg');
    expect(textarea).toHaveAttribute('data-ov-mono', 'true');
  });

  it('supports text entry and change handlers', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(
      <TextArea.Root>
        <TextArea.Control placeholder="Notes" onChange={onChange} />
      </TextArea.Root>,
    );

    const textarea = screen.getByPlaceholderText('Notes');
    await user.type(textarea, 'hello');

    expect(onChange).toHaveBeenCalled();
    expect(textarea).toHaveValue('hello');
  });

  it('keeps resize customization on the rendered element', () => {
    renderWithTheme(
      <TextArea.Root>
        <TextArea.Control placeholder="Resizable" resize="none" />
      </TextArea.Root>,
    );

    const textarea = screen.getByPlaceholderText('Resizable');
    expect(textarea.style.getPropertyValue('--_textarea-resize')).toBe('none');
  });
});
