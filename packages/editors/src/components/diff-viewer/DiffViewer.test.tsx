import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DiffViewer } from './DiffViewer';

vi.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: () => <div data-testid="monaco-editor-mock" />,
  DiffEditor: ({
    original,
    modified,
    language,
    options,
  }: {
    original: string;
    modified: string;
    language?: string;
    options?: Record<string, unknown>;
  }) => (
    <div
      data-testid="monaco-diff-mock"
      data-original={original}
      data-modified={modified}
      data-language={language}
      data-side-by-side={String(options?.renderSideBySide ?? true)}
    />
  ),
}));

describe('DiffViewer', () => {
  it('renders the diff container', () => {
    render(<DiffViewer original="a" modified="b" />);
    expect(screen.getByTestId('diff-viewer')).toBeInTheDocument();
  });

  it('passes original and modified to the editor', () => {
    render(<DiffViewer original="line1" modified="line2" />);
    const mock = screen.getByTestId('monaco-diff-mock');
    expect(mock).toHaveAttribute('data-original', 'line1');
    expect(mock).toHaveAttribute('data-modified', 'line2');
  });

  it('applies language prop', () => {
    render(<DiffViewer original="" modified="" language="yaml" />);
    expect(screen.getByTestId('monaco-diff-mock')).toHaveAttribute('data-language', 'yaml');
  });

  it('defaults to side-by-side mode', () => {
    render(<DiffViewer original="" modified="" />);
    expect(screen.getByTestId('monaco-diff-mock')).toHaveAttribute('data-side-by-side', 'true');
  });

  it('switches to inline mode', () => {
    render(<DiffViewer original="" modified="" mode="inline" />);
    expect(screen.getByTestId('monaco-diff-mock')).toHaveAttribute('data-side-by-side', 'false');
  });

  it('merges className', () => {
    render(<DiffViewer original="" modified="" className="custom" />);
    expect(screen.getByTestId('diff-viewer')).toHaveClass('custom');
  });
});
