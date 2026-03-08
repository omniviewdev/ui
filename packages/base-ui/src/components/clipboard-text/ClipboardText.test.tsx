import { createRef } from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { ClipboardText } from './ClipboardText';

const originalClipboard = navigator.clipboard;

describe('ClipboardText', () => {
  afterEach(() => {
    Object.defineProperty(window.navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
    });
  });
  it('renders text content', () => {
    renderWithTheme(<ClipboardText value="hello-world" />);
    expect(screen.getByText('hello-world')).toBeInTheDocument();
  });

  it('copy button is present in DOM', () => {
    renderWithTheme(<ClipboardText value="test" />);
    const button = screen.getByRole('button', { name: 'Copy to clipboard' });
    expect(button).toBeInTheDocument();
  });

  it('clipboard write is called with correct value', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    renderWithTheme(<ClipboardText value="copy-me" />);

    const button = screen.getByRole('button', { name: 'Copy to clipboard' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('copy-me');
    });
  });

  it('mono variant applies correct data attribute', () => {
    renderWithTheme(<ClipboardText value="abc123" mono />);
    const root = screen.getByText('abc123').closest('[data-ov-mono]');
    expect(root).toHaveAttribute('data-ov-mono', 'true');
  });

  it('truncation applies correct data attribute', () => {
    renderWithTheme(<ClipboardText value="long text" truncate />);
    const root = screen.getByText('long text').closest('[data-ov-truncate]');
    expect(root).toHaveAttribute('data-ov-truncate', 'true');
  });

  it('className merge works', () => {
    renderWithTheme(<ClipboardText value="styled" className="custom-class" />);
    // The root is the outermost span that contains the button
    const button = screen.getByRole('button', { name: 'Copy to clipboard' });
    const root = button.parentElement!;
    expect(root.className).toContain('custom-class');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLSpanElement>();
    renderWithTheme(<ClipboardText ref={ref} value="ref-test" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current!.textContent).toContain('ref-test');
  });
});
