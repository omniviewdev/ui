import { render as rtlRender, screen, act } from '@testing-library/react';
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
interface MonacoDiffEditorOptions {
  theme?: string;
}

const sharedModels: TestModel[] = [];
const mockOriginalEditors: Array<{ updateOptions: (...args: unknown[]) => unknown }> = [];
const mockModifiedEditors: Array<{
  getValue: () => string;
  updateOptions: (...args: unknown[]) => unknown;
}> = [];

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
      const originalEditor = { updateOptions: vi.fn() };
      const modifiedEditor = {
        getValue: () => sharedModels[1]?.getValue?.() ?? '',
        updateOptions: vi.fn(),
      };
      mockOriginalEditors.push(originalEditor);
      mockModifiedEditors.push(modifiedEditor);
      mockDiffEditorInstance = {
        setModel: vi.fn(),
        getModel: vi.fn(() => ({
          original: sharedModels[0],
          modified: sharedModels[1],
        })),
        getOriginalEditor: vi.fn(() => originalEditor),
        getModifiedEditor: vi.fn(() => modifiedEditor),
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
  mockOriginalEditors.length = 0;
  mockModifiedEditors.length = 0;
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
      expect.stringMatching(/^ov-theme-/),
      expect.objectContaining({
        colors: expect.objectContaining({ 'editor.background': '#222222' }),
      }),
    );
    expect(mockCreateDiffEditor).toHaveBeenCalledTimes(1);
  });
  it('isolates root-specific themes per mounted diff editor through registration updates', () => {
    const firstRegistry = createThemeRegistry();
    const secondRegistry = createThemeRegistry();
    const owner = { kind: 'plugin', id: 'diff-isolation-test' } as const;
    const disposeFirst = firstRegistry.register({
      schemaVersion: 1,
      id: 'plugin:diff-isolation-test/first',
      name: 'First',
      base: 'dark',
      tokens: { 'color.editor.bg': '#111111' },
    }, owner);
    secondRegistry.register({
      schemaVersion: 1,
      id: 'plugin:diff-isolation-test/second',
      name: 'Second',
      base: 'dark',
      tokens: { 'color.editor.bg': '#222222' },
    }, owner);
    const firstRoot = document.createElement('div');
    const secondRoot = document.createElement('div');
    document.body.append(firstRoot, secondRoot);

    rtlRender(
      <ThemeProvider
        themeId="plugin:diff-isolation-test/first"
        registry={firstRegistry}
        root={firstRoot}
      >
        <DiffViewer original="" modified="" />
      </ThemeProvider>,
      { container: firstRoot },
    );
    rtlRender(
      <ThemeProvider
        themeId="plugin:diff-isolation-test/second"
        registry={secondRegistry}
        root={secondRoot}
      >
        <DiffViewer original="" modified="" />
      </ThemeProvider>,
      { container: secondRoot },
    );

    // Monaco's mocked create boundary records its construction options as unknown.
    const firstOptions = mockCreateDiffEditor.mock.calls[0]?.[1] as MonacoDiffEditorOptions;
    const secondOptions = mockCreateDiffEditor.mock.calls[1]?.[1] as MonacoDiffEditorOptions;
    const firstThemeName = firstOptions.theme;
    const secondThemeName = secondOptions.theme;
    expect(firstThemeName).toMatch(/^ov-theme-/);
    expect(secondThemeName).toMatch(/^ov-theme-/);
    expect(firstThemeName).not.toBe(secondThemeName);
    expect(mockDefineTheme).toHaveBeenCalledWith(
      firstThemeName,
      expect.objectContaining({
        colors: expect.objectContaining({ 'editor.background': '#111111' }),
      }),
    );
    expect(mockDefineTheme).toHaveBeenCalledWith(
      secondThemeName,
      expect.objectContaining({
        colors: expect.objectContaining({ 'editor.background': '#222222' }),
      }),
    );

    const firstOriginalUpdate = mockOriginalEditors[0]!.updateOptions;
    const firstModifiedUpdate = mockModifiedEditors[0]!.updateOptions;
    const secondOriginalUpdate = mockOriginalEditors[1]!.updateOptions;
    const secondModifiedUpdate = mockModifiedEditors[1]!.updateOptions;
    if (
      !vi.isMockFunction(firstOriginalUpdate) ||
      !vi.isMockFunction(firstModifiedUpdate) ||
      !vi.isMockFunction(secondOriginalUpdate) ||
      !vi.isMockFunction(secondModifiedUpdate)
    ) {
      throw new Error('Expected mocked diff child editor updateOptions methods');
    }
    const secondOriginalUpdateCount = secondOriginalUpdate.mock.calls.length;
    const secondModifiedUpdateCount = secondModifiedUpdate.mock.calls.length;
    act(() => {
      disposeFirst();
      firstRegistry.register({
        schemaVersion: 1,
        id: 'plugin:diff-isolation-test/first',
        name: 'First reloaded',
        base: 'dark',
        tokens: { 'color.editor.bg': '#333333' },
      }, owner);
    });

    expect(mockDefineTheme).toHaveBeenLastCalledWith(
      firstThemeName,
      expect.objectContaining({
        colors: expect.objectContaining({ 'editor.background': '#333333' }),
      }),
    );
    expect(firstOriginalUpdate).toHaveBeenLastCalledWith({ theme: firstThemeName });
    expect(firstModifiedUpdate).toHaveBeenLastCalledWith({ theme: firstThemeName });
    expect(secondOriginalUpdate).toHaveBeenCalledTimes(secondOriginalUpdateCount);
    expect(secondModifiedUpdate).toHaveBeenCalledTimes(secondModifiedUpdateCount);
    expect(mockSetTheme).not.toHaveBeenCalled();
    expect(mockCreateDiffEditor).toHaveBeenCalledTimes(2);
  });

});
