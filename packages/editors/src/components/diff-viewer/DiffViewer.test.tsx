import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DiffViewer } from './DiffViewer';

const mockCreateDiffEditor = vi.fn();
const mockDefineTheme = vi.fn();
const mockSetTheme = vi.fn();
const mockSetModelLanguage = vi.fn();

let mockDiffEditorInstance: Record<string, unknown>;

vi.mock('monaco-editor', () => ({
  default: undefined,
  Uri: {
    parse: (s: string) => ({ toString: () => s, path: s }),
  },
  editor: {
    createDiffEditor: (...args: unknown[]) => {
      mockCreateDiffEditor(...args);
      const originalModel = {
        setValue: vi.fn(),
        dispose: vi.fn(),
      };
      const modifiedModel = {
        setValue: vi.fn(),
        getValue: vi.fn(() => ''),
        dispose: vi.fn(),
      };
      mockDiffEditorInstance = {
        setModel: vi.fn(),
        getModel: vi.fn(() => ({ original: originalModel, modified: modifiedModel })),
        getModifiedEditor: vi.fn(() => ({ getValue: vi.fn(() => '') })),
        updateOptions: vi.fn(),
        dispose: vi.fn(),
      };
      return mockDiffEditorInstance;
    },
    createModel: vi.fn((_value: string, _lang?: string) => ({
      setValue: vi.fn(),
      getValue: vi.fn(() => ''),
      dispose: vi.fn(),
    })),
    getModel: vi.fn(() => null),
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
});

describe('DiffViewer', () => {
  it('renders the diff container', () => {
    render(<DiffViewer original="a" modified="b" />);
    expect(screen.getByTestId('diff-viewer')).toBeInTheDocument();
  });

  it('creates a diff editor on mount', () => {
    render(<DiffViewer original="line1" modified="line2" />);
    expect(mockCreateDiffEditor).toHaveBeenCalled();
  });

  it('passes language to createModel', async () => {
    const monaco = await import('monaco-editor');
    render(<DiffViewer original="" modified="" language="yaml" />);
    expect(monaco.editor.createModel).toHaveBeenCalledWith('', 'yaml');
  });

  it('defaults to side-by-side mode', () => {
    render(<DiffViewer original="" modified="" />);
    expect(mockCreateDiffEditor).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ renderSideBySide: true }),
    );
  });

  it('switches to inline mode', () => {
    render(<DiffViewer original="" modified="" mode="inline" />);
    expect(mockCreateDiffEditor).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ renderSideBySide: false }),
    );
  });

  it('merges className', () => {
    render(<DiffViewer original="" modified="" className="custom" />);
    expect(screen.getByTestId('diff-viewer')).toHaveClass('custom');
  });

  it('defaults to readOnly true', () => {
    render(<DiffViewer original="" modified="" />);
    expect(mockCreateDiffEditor).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ readOnly: true }),
    );
  });

  it('supports readOnly false', () => {
    render(<DiffViewer original="" modified="" readOnly={false} />);
    expect(mockCreateDiffEditor).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ readOnly: false }),
    );
  });

  it('applies height prop as style', () => {
    render(<DiffViewer original="" modified="" height={500} />);
    const container = screen.getByTestId('diff-viewer');
    expect(container).toHaveStyle({ height: '500px' });
  });

  it('forwards ref', () => {
    const ref = { current: null } as unknown as React.RefObject<HTMLDivElement>;
    render(<DiffViewer original="" modified="" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('disposes editor on unmount', () => {
    const { unmount } = render(<DiffViewer original="" modified="" />);
    unmount();
    expect(mockDiffEditorInstance.dispose).toHaveBeenCalled();
  });
});
