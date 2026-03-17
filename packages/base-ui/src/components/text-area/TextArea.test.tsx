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

  it('renders with xs size', () => {
    renderWithTheme(
      <TextArea.Root size="xs">
        <TextArea.Control placeholder="xs-textarea" />
      </TextArea.Root>,
    );

    const textarea = screen.getByPlaceholderText('xs-textarea');
    expect(textarea).toHaveAttribute('data-ov-size', 'xs');
  });

  it('renders with xl size', () => {
    renderWithTheme(
      <TextArea.Root size="xl">
        <TextArea.Control placeholder="xl-textarea" />
      </TextArea.Root>,
    );

    const textarea = screen.getByPlaceholderText('xl-textarea');
    expect(textarea).toHaveAttribute('data-ov-size', 'xl');
  });

  it('renders with discovery color', () => {
    renderWithTheme(
      <TextArea.Root color="discovery">
        <TextArea.Control placeholder="discovery-textarea" />
      </TextArea.Root>,
    );

    const textarea = screen.getByPlaceholderText('discovery-textarea');
    expect(textarea).toHaveAttribute('data-ov-color', 'discovery');
  });

  it('renders with secondary color', () => {
    renderWithTheme(
      <TextArea.Root color="secondary">
        <TextArea.Control placeholder="secondary-textarea" />
      </TextArea.Root>,
    );

    const textarea = screen.getByPlaceholderText('secondary-textarea');
    expect(textarea).toHaveAttribute('data-ov-color', 'secondary');
  });
});
