import { StrictMode, useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from './ThemeProvider';
import { createThemeRegistry, type ThemeRegistry } from './registry';
import { useTheme } from './useTheme';
import themeStyles from './styles.css?inline';

const themeStyleElement = document.createElement('style');
themeStyleElement.textContent = themeStyles;
document.head.append(themeStyleElement);

const owner = { kind: 'plugin', id: 'acme' } as const;
const pluginTheme = {
  schemaVersion: 1 as const,
  id: 'plugin:acme/slate',
  name: 'Slate',
  base: 'dark' as const,
  tokens: { 'color.bg.base': '#101114' } as const,
};

function Reader() {
  const theme = useTheme();
  return (
    <div>
      <output data-testid="state">{JSON.stringify({
        requestedThemeId: theme.requestedThemeId,
        activeThemeId: theme.activeTheme.id,
        isFallback: theme.isFallback,
        density: theme.density,
        motion: theme.motion,
      })}</output>
      <button onClick={() => theme.setTheme('light')}>theme</button>
      <button onClick={() => theme.setDensity('compact')}>density</button>
      <button onClick={() => theme.setMotion('reduced')}>motion</button>
    </div>
  );
}

function read() {
  return JSON.parse(screen.getByTestId('state').textContent!);
}

function Harness({ initial = 'dark', registry = createThemeRegistry() }: { initial?: string; registry?: ThemeRegistry }) {
  const [themeId, setThemeId] = useState(initial);
  return <ThemeProvider themeId={themeId} onThemeChange={setThemeId} registry={registry}><Reader /></ThemeProvider>;
}

afterEach(() => {
  document.documentElement.removeAttribute('data-ov-theme');
  document.documentElement.removeAttribute('data-ov-theme-custom');
  document.documentElement.removeAttribute('data-ov-density');
  document.documentElement.removeAttribute('data-ov-motion');
  document.documentElement.style.cssText = '';
  vi.restoreAllMocks();
});

describe('controlled ThemeProvider', () => {
  it('resolves and applies a known controlled selection', () => {
    render(<Harness initial="light" />);
    expect(read()).toMatchObject({ requestedThemeId: 'light', activeThemeId: 'light', isFallback: false });
    expect(document.documentElement.dataset.ovTheme).toBe('light');
  });

  it('falls back while preserving a missing requested id, then activates it after registration', () => {
    const registry = createThemeRegistry();
    render(<Harness initial="plugin:acme/slate" registry={registry} />);
    expect(read()).toMatchObject({ requestedThemeId: 'plugin:acme/slate', activeThemeId: 'void', isFallback: true });

    act(() => { registry.register(pluginTheme, owner); });
    expect(read()).toMatchObject({ requestedThemeId: 'plugin:acme/slate', activeThemeId: 'plugin:acme/slate', isFallback: false });
  });

  it('falls back when the active registration is removed', () => {
    const registry = createThemeRegistry();
    const dispose = registry.register(pluginTheme, owner);
    render(<Harness initial="plugin:acme/slate" registry={registry} />);
    act(dispose);
    expect(read()).toMatchObject({ requestedThemeId: 'plugin:acme/slate', activeThemeId: 'void', isFallback: true });
    expect(document.documentElement.style.getPropertyValue('--ov-color-bg-base')).toBe('');
  });

  it('uses the configured fallback theme', () => {
    render(<ThemeProvider themeId="missing" fallbackThemeId="light"><Reader /></ThemeProvider>);
    expect(read()).toMatchObject({ activeThemeId: 'light', isFallback: true });
  });

  it('setTheme only requests a controlled change', () => {
    const onThemeChange = vi.fn();
    render(<ThemeProvider themeId="dark" onThemeChange={onThemeChange}><Reader /></ThemeProvider>);
    fireEvent.click(screen.getByText('theme'));
    expect(onThemeChange).toHaveBeenCalledWith('light');
    expect(read()).toMatchObject({ requestedThemeId: 'dark', activeThemeId: 'dark' });
  });

  it('keeps density and motion as provider-local state and applies attributes', () => {
    render(<ThemeProvider themeId="dark" initialDensity="comfortable" initialMotion="normal"><Reader /></ThemeProvider>);
    fireEvent.click(screen.getByText('density'));
    fireEvent.click(screen.getByText('motion'));
    expect(read()).toMatchObject({ density: 'compact', motion: 'reduced' });
    expect(document.documentElement.dataset.ovDensity).toBe('compact');
    expect(document.documentElement.dataset.ovMotion).toBe('reduced');
  });

  it('removes density and motion attributes when the root changes', () => {
    const firstRoot = document.createElement('div');
    const secondRoot = document.createElement('div');
    const mounted = render(
      <ThemeProvider themeId="dark" root={firstRoot} initialDensity="compact" initialMotion="reduced">
        <Reader />
      </ThemeProvider>,
    );

    mounted.rerender(
      <ThemeProvider themeId="dark" root={secondRoot} initialDensity="compact" initialMotion="reduced">
        <Reader />
      </ThemeProvider>,
    );

    expect(firstRoot.dataset.ovDensity).toBeUndefined();
    expect(firstRoot.dataset.ovMotion).toBeUndefined();
    expect(secondRoot.dataset.ovDensity).toBe('compact');
    expect(secondRoot.dataset.ovMotion).toBe('reduced');
  });

  it('removes density and motion attributes when its root becomes null', () => {
    const root = document.createElement('div');
    const mounted = render(
      <ThemeProvider themeId="dark" root={root}><Reader /></ThemeProvider>,
    );

    mounted.rerender(
      <ThemeProvider themeId="dark" root={null}><Reader /></ThemeProvider>,
    );

    expect(root.dataset.ovDensity).toBeUndefined();
    expect(root.dataset.ovMotion).toBeUndefined();
  });

  it('restores an older provider when the newer owner unmounts', () => {
    const root = document.createElement('div');
    const earlier = render(
      <ThemeProvider themeId="dark" root={root} initialDensity="compact" initialMotion="reduced">
        <span />
      </ThemeProvider>,
    );
    const later = render(
      <ThemeProvider themeId="light" root={root}><span /></ThemeProvider>,
    );

    later.unmount();
    expect(root.dataset.ovDensity).toBe('compact');
    expect(root.dataset.ovMotion).toBe('reduced');

    earlier.unmount();
    expect(root.dataset.ovDensity).toBeUndefined();
    expect(root.dataset.ovMotion).toBeUndefined();
  });

  it('restores an older provider when the newer owner changes roots', () => {
    const originalRoot = document.createElement('div');
    const nextRoot = document.createElement('div');
    render(
      <ThemeProvider themeId="dark" root={originalRoot} initialDensity="compact" initialMotion="reduced">
        <span />
      </ThemeProvider>,
    );
    const later = render(
      <ThemeProvider themeId="light" root={originalRoot}><span /></ThemeProvider>,
    );

    later.rerender(
      <ThemeProvider themeId="light" root={nextRoot}><span /></ThemeProvider>,
    );

    expect(originalRoot.dataset.ovDensity).toBe('compact');
    expect(originalRoot.dataset.ovMotion).toBe('reduced');
    expect(nextRoot.dataset.ovDensity).toBe('comfortable');
    expect(nextRoot.dataset.ovMotion).toBe('normal');
  });

  it('restores an older provider when the newer owner sets its root to null', () => {
    const root = document.createElement('div');
    render(
      <ThemeProvider themeId="dark" root={root} initialDensity="compact" initialMotion="reduced">
        <span />
      </ThemeProvider>,
    );
    const later = render(
      <ThemeProvider themeId="light" root={root}><span /></ThemeProvider>,
    );

    later.rerender(
      <ThemeProvider themeId="light" root={null}><span /></ThemeProvider>,
    );

    expect(root.dataset.ovDensity).toBe('compact');
    expect(root.dataset.ovMotion).toBe('reduced');
  });

  it('does not let a stale older provider clobber the current owner', () => {
    const root = document.createElement('div');
    const earlier = render(
      <ThemeProvider themeId="dark" root={root} initialDensity="compact" initialMotion="reduced">
        <span />
      </ThemeProvider>,
    );
    const later = render(
      <ThemeProvider themeId="light" root={root}><span /></ThemeProvider>,
    );

    earlier.unmount();
    expect(root.dataset.ovDensity).toBe('comfortable');
    expect(root.dataset.ovMotion).toBe('normal');

    later.unmount();
    expect(root.dataset.ovDensity).toBeUndefined();
    expect(root.dataset.ovMotion).toBeUndefined();
  });

  it('does not access localStorage', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    render(<Harness />);
    fireEvent.click(screen.getByText('theme'));
    expect(getItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
  });

  it('supports Strict Mode without losing applied state', () => {
    render(<StrictMode><Harness initial="light" /></StrictMode>);
    expect(document.documentElement.dataset.ovTheme).toBe('light');
  });

  it('applies built-in theme, density, and motion variables to a configured element root', () => {
    const root = document.createElement('div');
    document.body.append(root);

    const mounted = render(
      <ThemeProvider themeId="light" root={root} initialDensity="compact" initialMotion="reduced">
        <Reader />
      </ThemeProvider>,
    );

    const styles = getComputedStyle(root);
    expect(styles.getPropertyValue('--ov-color-bg-base').trim()).toBe('#eef0f3');
    expect(styles.getPropertyValue('--ov-control-height-md').trim()).toBe('30px');
    expect(styles.getPropertyValue('--ov-duration-interactive').trim()).toBe('0ms');

    mounted.unmount();
    root.remove();
  });

  it('inherits a custom theme base palette on a configured element root', () => {
    const registry = createThemeRegistry();
    registry.register(
      {
        schemaVersion: 1,
        id: 'plugin:acme/light',
        name: 'Acme Light',
        base: 'light',
        tokens: { 'color.bg.base': '#fff8ee' },
      },
      owner,
    );
    const root = document.createElement('div');
    document.body.append(root);

    const mounted = render(
      <ThemeProvider themeId="plugin:acme/light" registry={registry} root={root}>
        <Reader />
      </ThemeProvider>,
    );

    const styles = getComputedStyle(root);
    expect(styles.getPropertyValue('--ov-color-bg-base').trim()).toBe('#fff8ee');
    expect(styles.getPropertyValue('--ov-color-fg-default').trim()).toBe('#1b1d22');

    mounted.unmount();
    root.remove();
  });

  it.each([
    [
      'solarized-dark',
      {
        '--ov-color-editor-selection-inactive-bg': 'rgb(88 110 117 / 0.24)',
        '--ov-color-editor-bracket-4': '#2aa198',
        '--ov-color-gutter-added': '#859900',
        '--ov-color-diff-remove-bg': 'rgb(220 50 47 / 0.18)',
        '--ov-color-minimap-find-match': '#b58900',
      },
    ],
    [
      'solarized-light',
      {
        '--ov-color-editor-selection-inactive-bg': 'rgb(101 123 131 / 0.18)',
        '--ov-color-editor-bracket-4': '#2aa198',
        '--ov-color-gutter-added': '#859900',
        '--ov-color-diff-remove-bg': 'rgb(220 50 47 / 0.14)',
        '--ov-color-minimap-find-match': '#b58900',
      },
    ],
  ])('defines a complete %s editor palette', (themeId, expected) => {
    render(<ThemeProvider themeId={themeId}><Reader /></ThemeProvider>);
    const styles = getComputedStyle(document.documentElement);

    for (const [property, value] of Object.entries(expected)) {
      expect(styles.getPropertyValue(property).trim()).toBe(value);
    }
  });

  it('renders without a DOM root during SSR', () => {
    expect(() => renderToString(<ThemeProvider themeId="dark"><Reader /></ThemeProvider>)).not.toThrow();
  });
});
