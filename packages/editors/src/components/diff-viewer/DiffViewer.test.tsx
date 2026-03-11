import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DiffViewer } from './DiffViewer';

const mockCreateDiffEditor = vi.fn();
const mockDefineTheme = vi.fn();
const mockSetTheme = vi.fn();
const mockSetModelLanguage = vi.fn();

let mockDiffEditorInstance: Record<string, unknown>;

/** Shared model instances used by both createModel and getModel. */
const sharedModels: Array<Record<string, ReturnType<typeof vi.fn>>> = [];

vi.mock('monaco-editor', () => ({
  default: undefined,
  Uri: {
    parse: (s: string) => ({ toString: () => s, path: s }),
  },
  editor: {
    createDiffEditor: (...args: unknown[]) => {
      mockCreateDiffEditor(...args);
      // DiffViewer creates original (index 0) then modified (index 1) via createModel,
      // then calls setModel and later getModel — all must reference the same objects.
      mockDiffEditorInstance = {
        setModel: vi.fn(),
        getModel: vi.fn(() => ({
          original: sharedModels[0],
          modified: sharedModels[1],
        })),
        getModifiedEditor: vi.fn(() => ({
          getValue: () => sharedModels[1]?.getValue?.() ?? '',
        })),
        updateOptions: vi.fn(),
        dispose: vi.fn(),
      };
      return mockDiffEditorInstance;
    },
    createModel: vi.fn(() => {
      const model = {
        setValue: vi.fn(),
        getValue: vi.fn(() => ''),
        dispose: vi.fn(),
      };
      sharedModels.push(model);
      return model;
    }),
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
  sharedModels.length = 0;
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

  it('applies language to both models', () => {
    render(<DiffViewer original="" modified="" language="yaml" />);
    // Language sync effect calls setModelLanguage for both models
    expect(mockSetModelLanguage).toHaveBeenCalledWith(
      expect.anything(),
      'yaml',
    );
    // Called twice — once for original, once for modified
    expect(mockSetModelLanguage).toHaveBeenCalledTimes(2);
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
    expect(container.style.getPropertyValue('--_diff-height')).toBe('500px');
  });

  it('forwards ref', () => {
    const ref = { current: null } as unknown as React.RefObject<HTMLDivElement>;
    render(<DiffViewer original="" modified="" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('disposes editor and models on unmount', () => {
    const { unmount } = render(<DiffViewer original="" modified="" />);
    const models = (mockDiffEditorInstance.getModel as ReturnType<typeof vi.fn>)();
    unmount();
    expect(models.original.dispose).toHaveBeenCalled();
    expect(models.modified.dispose).toHaveBeenCalled();
    expect(mockDiffEditorInstance.dispose).toHaveBeenCalled();
  });
});
