import { render, screen, act } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CodeEditor, type CodeEditorHandle } from './CodeEditor';

let mockEditorInstance: Record<string, unknown>;
let mockModel: Record<string, unknown>;

const mockCreate = vi.fn();
const mockGetModel = vi.fn();
const mockCreateModel = vi.fn();
const mockSetModelLanguage = vi.fn();
const mockDefineTheme = vi.fn();
const mockSetTheme = vi.fn();

vi.mock('monaco-editor', () => {
  const Uri = {
    parse: (s: string) => ({ toString: () => s, path: s }),
  };

  return {
    default: undefined,
    Uri,
    editor: {
      create: (...args: unknown[]) => {
        mockCreate(...args);
        mockModel = {
          getFullModelRange: vi.fn(() => ({})),
          uri: { toString: () => 'test', path: 'test' },
          dispose: vi.fn(),
        };
        mockEditorInstance = {
          getValue: vi.fn(() => ''),
          setValue: vi.fn(),
          getModel: vi.fn(() => mockModel),
          updateOptions: vi.fn(),
          executeEdits: vi.fn(),
          pushUndoStop: vi.fn(),
          setModel: vi.fn(),
          onDidChangeModelContent: vi.fn(() => ({ dispose: vi.fn() })),
          dispose: vi.fn(),
          focus: vi.fn(),
          getOption: vi.fn(() => false),
        };
        return mockEditorInstance;
      },
      getModel: (...args: unknown[]) => mockGetModel(...args),
      createModel: (...args: unknown[]) => {
        mockCreateModel(...args);
        return {
          getFullModelRange: vi.fn(() => ({})),
          uri: { toString: () => 'test', path: 'test' },
          dispose: vi.fn(),
        };
      },
      setModelLanguage: (...args: unknown[]) => mockSetModelLanguage(...args),
      defineTheme: (...args: unknown[]) => mockDefineTheme(...args),
      setTheme: (...args: unknown[]) => mockSetTheme(...args),
      EditorOption: { readOnly: 81 },
    },
    languages: {
      register: vi.fn(),
      typescript: {
        typescriptDefaults: {
          setDiagnosticsOptions: vi.fn(),
          setCompilerOptions: vi.fn(),
        },
        javascriptDefaults: {
          setDiagnosticsOptions: vi.fn(),
        },
      },
    },
  };
});

vi.mock('../../schemas', () => ({
  editorSchemas: {
    applyYamlSchemas: vi.fn(),
    applyJsonSchemas: vi.fn(),
    onChange: vi.fn(() => vi.fn()),
  },
}));

vi.mock('../../themes/useEditorTheme', () => ({
  useEditorTheme: () => ({ isDark: false }),
}));

vi.mock('../../themes/monaco', () => ({
  buildMonacoTheme: () => ({ base: 'vs', inherit: true, rules: [], colors: {} }),
  OV_MONACO_THEME: 'ov-theme',
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockGetModel.mockReturnValue(null);
});

describe('CodeEditor', () => {
  it('renders the editor container', () => {
    render(<CodeEditor value="hello" />);
    expect(screen.getByTestId('code-editor')).toBeInTheDocument();
  });

  it('creates a monaco editor on mount', () => {
    render(<CodeEditor value="const x = 1;" />);
    expect(mockCreate).toHaveBeenCalled();
  });

  it('detects language from filename', () => {
    render(<CodeEditor value="" filename="app.tsx" />);
    expect(mockCreateModel).toHaveBeenCalledWith(
      '',
      'typescript',
      expect.anything(),
    );
  });

  it('uses explicit language over filename detection', () => {
    render(<CodeEditor value="" language="python" filename="app.tsx" />);
    expect(mockCreateModel).toHaveBeenCalledWith(
      '',
      'python',
      expect.anything(),
    );
  });

  it('passes readOnly to editor options', () => {
    render(<CodeEditor value="" readOnly />);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ readOnly: true }),
    );
  });

  it('pretty-prints JSON content', () => {
    const json = '{"a":1}';
    render(<CodeEditor value={json} language="json" />);
    const formatted = JSON.stringify({ a: 1 }, null, 2);
    expect(mockCreateModel).toHaveBeenCalledWith(
      formatted,
      'json',
    );
  });

  it('passes through invalid JSON unchanged', () => {
    const badJson = '{not valid json}';
    render(<CodeEditor value={badJson} language="json" />);
    expect(mockCreateModel).toHaveBeenCalledWith(
      badJson,
      'json',
    );
  });

  it('merges className', () => {
    render(<CodeEditor value="" className="my-editor" />);
    expect(screen.getByTestId('code-editor')).toHaveClass('my-editor');
  });

  it('disables line numbers via options', () => {
    render(<CodeEditor value="" lineNumbers={false} />);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ lineNumbers: 'off' }),
    );
  });

  it('enables minimap', () => {
    render(<CodeEditor value="" minimap />);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ minimap: { enabled: true } }),
    );
  });

  it('enables word wrap', () => {
    render(<CodeEditor value="" wordWrap />);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ wordWrap: 'on' }),
    );
  });

  it('applies height and width styles', () => {
    render(<CodeEditor value="" height={400} width={600} />);
    const container = screen.getByTestId('code-editor');
    expect(container).toHaveStyle({ height: '400px', width: '600px' });
  });

  it('exposes imperative handle via ref', async () => {
    const ref = createRef<CodeEditorHandle>();
    render(<CodeEditor value="" ref={ref} />);

    // Editor is created synchronously in useEffect, wait for it
    await act(async () => {});

    expect(ref.current?.getEditor()).toBeTruthy();
    expect(ref.current?.getMonaco()).toBeTruthy();
    ref.current?.focus();
    expect(mockEditorInstance.focus).toHaveBeenCalled();
  });

  it('handles empty value', () => {
    render(<CodeEditor value="" />);
    expect(mockCreate).toHaveBeenCalled();
  });

  it('disposes editor and model on unmount', () => {
    const { unmount } = render(<CodeEditor value="" />);
    unmount();
    expect(mockModel.dispose).toHaveBeenCalled();
    expect(mockEditorInstance.dispose).toHaveBeenCalled();
  });
});
