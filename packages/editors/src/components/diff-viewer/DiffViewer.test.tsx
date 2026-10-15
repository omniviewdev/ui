import { render as rtlRender, screen } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { ThemeProvider, createThemeRegistry } from '@omniviewdev/base-ui';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DiffViewer } from './DiffViewer';

const mockCreateDiffEditor = vi.fn();
const mockDefineTheme = vi.fn();
const mockSetTheme = vi.fn();
const mockSetModelLanguage = vi.fn();

let mockDiffEditorInstance: Record<string, unknown>;
interface TestModel {
  setValue: (...args: unknown[]) => unknown;
  getValue: () => string;
  dispose: () => void;
}

const sharedModels: TestModel[] = [];

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


beforeEach(() => {
  vi.clearAllMocks();
  sharedModels.length = 0;
});

function ThemeWrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider themeId="dark">{children}</ThemeProvider>;
}

function render(ui: ReactElement) {
  return rtlRender(ui, { wrapper: ThemeWrapper });
}

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
    const getModel = mockDiffEditorInstance.getModel as () => {
      original: TestModel;
      modified: TestModel;
    };
    const models = getModel();
    unmount();
    expect(models.original.dispose).toHaveBeenCalled();
    expect(models.modified.dispose).toHaveBeenCalled();
    expect(mockDiffEditorInstance.dispose).toHaveBeenCalled();
  });

  it('rebuilds its theme from current tokens when switching custom themes with the same base', () => {
    const registry = createThemeRegistry();
    const owner = { kind: 'plugin', id: 'diff-test' } as const;
    registry.register({
      schemaVersion: 1,
      id: 'plugin:diff-test/first',
      name: 'First',
      base: 'dark',
      tokens: { 'color.editor.bg': '#111111' },
    }, owner);
    registry.register({
      schemaVersion: 1,
      id: 'plugin:diff-test/second',
      name: 'Second',
      base: 'dark',
      tokens: { 'color.editor.bg': '#222222' },
    }, owner);

    const mounted = rtlRender(
      <ThemeProvider themeId="plugin:diff-test/first" registry={registry}>
        <DiffViewer original="" modified="" />
      </ThemeProvider>,
    );
    mounted.rerender(
      <ThemeProvider themeId="plugin:diff-test/second" registry={registry}>
        <DiffViewer original="" modified="" />
      </ThemeProvider>,
    );

    expect(mockDefineTheme).toHaveBeenLastCalledWith(
      'ov-theme',
      expect.objectContaining({
        colors: expect.objectContaining({ 'editor.background': '#222222' }),
      }),
    );
    expect(mockCreateDiffEditor).toHaveBeenCalledTimes(1);
  });
});
