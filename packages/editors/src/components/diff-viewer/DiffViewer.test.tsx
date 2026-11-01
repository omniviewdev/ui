import { render as rtlRender, act } from '@testing-library/react';
import { StrictMode } from 'react';
import { ThemeProvider, createThemeRegistry } from '@omniviewdev/base-ui';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DiffViewer } from './DiffViewer';

const mockDefineTheme = vi.fn();
const mockSetTheme = vi.fn();
const mockSetModelLanguage = vi.fn();

interface TestModel {
  setValue: (value: string) => void;
  getValue: () => string;
  dispose: () => void;
}
interface ModelPair {
  original: TestModel;
  modified: TestModel;
}
const modelsAlive = new Set<TestModel>();
const attachedModels = new Set<TestModel>();
let editorsAlive = 0;

vi.mock('monaco-editor', () => ({
  default: undefined,
  Uri: {
    parse: (s: string) => ({ toString: () => s, path: s }),
  },
  editor: {
    createDiffEditor: () => {
      editorsAlive++;
      let models: ModelPair | null = null;
      let disposed = false;
      const setModel = (next: ModelPair | null) => {
        if (models) {
          attachedModels.delete(models.original);
          attachedModels.delete(models.modified);
        }
        models = next;
        if (models) {
          attachedModels.add(models.original);
          attachedModels.add(models.modified);
        }
      };
      return {
        setModel,
        getModel: () => models,
        getOriginalEditor: () => ({ updateOptions: vi.fn() }),
        getModifiedEditor: () => ({
          getValue: () => models?.modified.getValue() ?? '',
          updateOptions: vi.fn(),
        }),
        updateOptions: vi.fn(),
        dispose: () => {
          if (disposed) throw new Error('Editor disposed twice');
          disposed = true;
          setModel(null);
          editorsAlive--;
        },
      };
    },
    createModel: (initial: string) => {
      let value = initial;
      const model: TestModel = {
        setValue: (next) => {
          value = next;
        },
        getValue: () => value,
        dispose: () => {
          if (attachedModels.has(model)) throw new Error('Cannot dispose an attached model');
          if (!modelsAlive.delete(model)) throw new Error('Model disposed twice');
        },
      };
      modelsAlive.add(model);
      return model;
    },
    getModel: () => null,
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
  modelsAlive.clear();
  attachedModels.clear();
  editorsAlive = 0;
});

describe('DiffViewer', () => {
  it('detaches owned models before disposal and releases every resource under StrictMode', async () => {
    const mounted = rtlRender(
      <StrictMode>
        <ThemeProvider themeId="dark">
          <DiffViewer original="before" modified="after" />
        </ThemeProvider>
      </StrictMode>,
    );
    await act(async () => {});
    expect(editorsAlive).toBe(1);
    expect(modelsAlive.size).toBe(2);
    expect(attachedModels.size).toBe(2);
    mounted.unmount();
    expect(editorsAlive).toBe(0);
    expect(modelsAlive.size).toBe(0);
    expect(attachedModels.size).toBe(0);
  });

  it('rebuilds its theme from current tokens when switching custom themes with the same base', async () => {
    const registry = createThemeRegistry();
    const owner = { kind: 'plugin', id: 'diff-test' } as const;
    registry.register(
      {
        schemaVersion: 1,
        id: 'plugin:diff-test/first',
        name: 'First',
        base: 'dark',
        tokens: { 'color.editor.bg': '#111111' },
      },
      owner,
    );
    registry.register(
      {
        schemaVersion: 1,
        id: 'plugin:diff-test/second',
        name: 'Second',
        base: 'dark',
        tokens: { 'color.editor.bg': '#222222' },
      },
      owner,
    );

    const mounted = rtlRender(
      <ThemeProvider themeId="plugin:diff-test/first" registry={registry}>
        <DiffViewer original="" modified="" />
      </ThemeProvider>,
    );
    await act(async () => {});
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
  });
  it('uses one page-global theme rebuilt from the root that last drives it', async () => {
    const firstRegistry = createThemeRegistry();
    const secondRegistry = createThemeRegistry();
    const owner = { kind: 'plugin', id: 'diff-global-theme-test' } as const;
    const disposeFirst = firstRegistry.register(
      {
        schemaVersion: 1,
        id: 'plugin:diff-global-theme-test/first',
        name: 'First',
        base: 'dark',
        tokens: { 'color.editor.bg': '#111111' },
      },
      owner,
    );
    secondRegistry.register(
      {
        schemaVersion: 1,
        id: 'plugin:diff-global-theme-test/second',
        name: 'Second',
        base: 'dark',
        tokens: { 'color.editor.bg': '#222222' },
      },
      owner,
    );
    const firstRoot = document.createElement('div');
    const secondRoot = document.createElement('div');
    document.body.append(firstRoot, secondRoot);

    rtlRender(
      <ThemeProvider
        themeId="plugin:diff-global-theme-test/first"
        registry={firstRegistry}
        root={firstRoot}
      >
        <DiffViewer original="" modified="" />
      </ThemeProvider>,
      { container: firstRoot },
    );
    rtlRender(
      <ThemeProvider
        themeId="plugin:diff-global-theme-test/second"
        registry={secondRegistry}
        root={secondRoot}
      >
        <DiffViewer original="" modified="" />
      </ThemeProvider>,
      { container: secondRoot },
    );
    await act(async () => {});

    expect(mockDefineTheme).toHaveBeenCalledWith(
      'ov-theme',
      expect.objectContaining({
        colors: expect.objectContaining({ 'editor.background': '#111111' }),
      }),
    );
    expect(mockDefineTheme).toHaveBeenLastCalledWith(
      'ov-theme',
      expect.objectContaining({
        colors: expect.objectContaining({ 'editor.background': '#222222' }),
      }),
    );
    expect(mockSetTheme).toHaveBeenLastCalledWith('ov-theme');

    act(() => {
      disposeFirst();
      firstRegistry.register(
        {
          schemaVersion: 1,
          id: 'plugin:diff-global-theme-test/first',
          name: 'First reloaded',
          base: 'dark',
          tokens: { 'color.editor.bg': '#333333' },
        },
        owner,
      );
    });

    expect(mockDefineTheme).toHaveBeenLastCalledWith(
      'ov-theme',
      expect.objectContaining({
        colors: expect.objectContaining({ 'editor.background': '#333333' }),
      }),
    );
    expect(mockSetTheme).toHaveBeenLastCalledWith('ov-theme');
  });
});
