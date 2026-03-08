import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CodeEditor } from './CodeEditor';

// Mock @monaco-editor/react
vi.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({
    value,
    language,
    options,
  }: {
    value: string;
    language?: string;
    options?: Record<string, unknown>;
  }) => (
    <div
      data-testid="monaco-editor-mock"
      data-value={value}
      data-language={language}
      data-readonly={String(options?.readOnly ?? false)}
    />
  ),
}));

describe('CodeEditor', () => {
  it('renders the editor container', () => {
    render(<CodeEditor value="hello" />);
    expect(screen.getByTestId('code-editor')).toBeInTheDocument();
  });

  it('passes value to the editor', () => {
    render(<CodeEditor value="const x = 1;" />);
    expect(screen.getByTestId('monaco-editor-mock')).toHaveAttribute('data-value', 'const x = 1;');
  });

  it('detects language from filename', () => {
    render(<CodeEditor value="" filename="app.tsx" />);
    expect(screen.getByTestId('monaco-editor-mock')).toHaveAttribute('data-language', 'typescript');
  });

  it('uses explicit language over filename detection', () => {
    render(<CodeEditor value="" language="python" filename="app.tsx" />);
    expect(screen.getByTestId('monaco-editor-mock')).toHaveAttribute('data-language', 'python');
  });

  it('sets readOnly via options', () => {
    render(<CodeEditor value="" readOnly />);
    expect(screen.getByTestId('monaco-editor-mock')).toHaveAttribute('data-readonly', 'true');
  });

  it('pretty-prints JSON content', () => {
    const json = '{"a":1}';
    render(<CodeEditor value={json} language="json" />);
    expect(screen.getByTestId('monaco-editor-mock')).toHaveAttribute(
      'data-value',
      JSON.stringify({ a: 1 }, null, 2),
    );
  });

  it('merges className', () => {
    render(<CodeEditor value="" className="my-editor" />);
    expect(screen.getByTestId('code-editor')).toHaveClass('my-editor');
  });
});
