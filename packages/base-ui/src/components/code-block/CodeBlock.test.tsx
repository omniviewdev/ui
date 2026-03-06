import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { CodeBlock } from './CodeBlock';

describe('CodeBlock', () => {
  it('renders code with line numbers and themed attributes', () => {
    renderWithTheme(
      <CodeBlock
        code={'apiVersion: v1\nkind: Pod'}
        language="yaml"
        lineNumbers
        variant="outline"
        color="warning"
        size="sm"
      />,
    );

    const root = screen.getByText('apiVersion').closest('[data-ov-variant]');
    expect(root).toHaveAttribute('data-ov-variant', 'outline');
    expect(root).toHaveAttribute('data-ov-color', 'warning');
    expect(root).toHaveAttribute('data-ov-size', 'sm');
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(root?.querySelector('span[class*="token"]')).toBeTruthy();
  });

  it('copies code content when copy button is clicked', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    renderWithTheme(<CodeBlock code="echo omniview" copyable />);

    await user.click(screen.getByRole('button', { name: /copy/i }));
    expect(writeText).toHaveBeenCalledWith('echo omniview');
  });

  it('supports wrapped code mode flag', () => {
    renderWithTheme(<CodeBlock code="a-very-long-line" wrap />);

    const root = screen.getByText('a-very-long-line').closest('[data-ov-wrap]');
    expect(root).toHaveAttribute('data-ov-wrap', 'true');
  });
});
