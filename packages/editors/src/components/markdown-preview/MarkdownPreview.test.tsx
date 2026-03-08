import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MarkdownPreview } from './MarkdownPreview';

// Mock react-markdown
vi.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => (
    <div data-testid="react-markdown-mock">{children}</div>
  ),
}));

describe('MarkdownPreview', () => {
  it('renders the preview container', () => {
    render(<MarkdownPreview content="Hello" />);
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
  });

  it('passes content to the markdown renderer', () => {
    render(<MarkdownPreview content="# Title" />);
    expect(screen.getByTestId('react-markdown-mock')).toHaveTextContent('# Title');
  });

  it('merges className', () => {
    render(<MarkdownPreview content="" className="custom-md" />);
    expect(screen.getByTestId('markdown-preview')).toHaveClass('custom-md');
  });

  it('forwards ref', () => {
    const ref = { current: null } as unknown as React.RefObject<HTMLDivElement>;
    render(<MarkdownPreview content="" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes additional HTML attributes', () => {
    render(<MarkdownPreview content="" aria-label="Preview" />);
    expect(screen.getByTestId('markdown-preview')).toHaveAttribute('aria-label', 'Preview');
  });
});
