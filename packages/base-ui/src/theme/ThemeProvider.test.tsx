import { StrictMode, useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from './ThemeProvider';
import { createThemeRegistry, type ThemeRegistry } from './registry';
import { useTheme } from './useTheme';

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

  it('renders without a DOM root during SSR', () => {
    expect(() => renderToString(<ThemeProvider themeId="dark"><Reader /></ThemeProvider>)).not.toThrow();
  });
});
