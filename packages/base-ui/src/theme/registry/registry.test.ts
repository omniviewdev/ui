import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createThemeRegistry } from './registry';
import type { ThemeDefinition, ThemeRegistry, ThemeRegistryEvent } from './types';

function makeCustom(id: string, base: 'dark' | 'light' = 'dark'): ThemeDefinition {
  return { id, name: id, base };
}

describe('themeRegistry — registration', () => {
  let registry: ThemeRegistry;
  beforeEach(() => {
    registry = createThemeRegistry();
  });

  it('lists all 7 built-ins by default', () => {
    const info = registry.list();
    expect(info).toHaveLength(7);
    expect(info.every((i) => i.builtIn)).toBe(true);
  });

  it('registers a custom theme and exposes it via get/has/list', () => {
    registry.register(makeCustom('solarized-dark'));
    expect(registry.has('solarized-dark')).toBe(true);
    expect(registry.get('solarized-dark')?.id).toBe('solarized-dark');
    expect(registry.list().map((i) => i.id)).toContain('solarized-dark');
    expect(registry.list().find((i) => i.id === 'solarized-dark')?.builtIn).toBe(false);
  });

  it('throws when registering a duplicate id', () => {
    registry.register(makeCustom('dup'));
    expect(() => registry.register(makeCustom('dup'))).toThrow(/already registered/i);
  });

  it('throws when registering an id that collides with a built-in', () => {
    expect(() => registry.register(makeCustom('dark'))).toThrow(/already registered/i);
  });

  it('throws when registering unknown color token keys', () => {
    expect(() =>
      registry.register({
        id: 'bad-color',
        name: 'bad',
        base: 'dark',
        colors: { 'color.bogus.key': '#000' } as never,
      }),
    ).toThrow(/unknown.*color.*key/i);
  });

  it('unregisters a custom theme', () => {
    registry.register(makeCustom('temp'));
    registry.unregister('temp');
    expect(registry.has('temp')).toBe(false);
  });

  it('unregister is a no-op for unknown ids', () => {
    expect(() => registry.unregister('never-existed')).not.toThrow();
  });

  it('throws when attempting to unregister a built-in', () => {
    expect(() => registry.unregister('dark')).toThrow(/cannot unregister.*built-in/i);
  });

  it('emits registered and unregistered events', () => {
    const events: ThemeRegistryEvent[] = [];
    const unsubscribe = registry.subscribe((e) => events.push(e));
    registry.register(makeCustom('a'));
    registry.unregister('a');
    unsubscribe();
    registry.register(makeCustom('b'));
    expect(events).toEqual([
      { type: 'registered', id: 'a' },
      { type: 'unregistered', id: 'a' },
    ]);
  });

  it('listeners added during dispatch are not invoked for the current event', () => {
    const registry2 = createThemeRegistry();
    const calls: string[] = [];
    const inner = () => calls.push('inner');
    registry2.subscribe(() => {
      calls.push('outer');
      registry2.subscribe(inner);
    });
    registry2.register({ id: 'x', name: 'x', base: 'dark' });
    expect(calls).toEqual(['outer']); // inner should NOT fire for the triggering event
    registry2.register({ id: 'y', name: 'y', base: 'dark' });
    expect(calls).toEqual(['outer', 'outer', 'inner']);
  });
});

describe('themeRegistry — apply()', () => {
  let registry: ThemeRegistry;
  beforeEach(() => {
    registry = createThemeRegistry();
    document.documentElement.removeAttribute('data-ov-theme');
    document.documentElement.removeAttribute('data-ov-theme-custom');
    document.documentElement.style.cssText = '';
  });
  afterEach(() => {
    document.documentElement.removeAttribute('data-ov-theme');
    document.documentElement.removeAttribute('data-ov-theme-custom');
    document.documentElement.style.cssText = '';
  });

  it('throws when applying an unknown id', () => {
    expect(() => registry.apply('ghost')).toThrow(/unknown theme/i);
  });

  it('sets data-ov-theme and colorScheme for a built-in', () => {
    registry.apply('light');
    expect(document.documentElement.getAttribute('data-ov-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-ov-theme-custom')).toBe(null);
    expect(document.documentElement.style.colorScheme).toBe('light');
    registry.apply('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('writes CSS variable overrides for a custom theme and sets data-ov-theme-custom', () => {
    registry.register({
      id: 'solarized-dark',
      name: 'Solarized Dark',
      base: 'dark',
      colors: { 'color.bg.base': '#002b36' },
      syntax: { 'syntax.comment': '#586e75' },
    });
    registry.apply('solarized-dark');
    expect(document.documentElement.getAttribute('data-ov-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-ov-theme-custom')).toBe('solarized-dark');
    expect(document.documentElement.style.getPropertyValue('--ov-color-bg-base')).toBe('#002b36');
    expect(document.documentElement.style.getPropertyValue('--ov-syntax-comment')).toBe('#586e75');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('clears previous overrides when switching to a built-in', () => {
    registry.register({
      id: 'sol',
      name: 'sol',
      base: 'dark',
      colors: { 'color.bg.base': '#002b36' },
    });
    registry.apply('sol');
    expect(document.documentElement.style.getPropertyValue('--ov-color-bg-base')).toBe('#002b36');
    registry.apply('light');
    expect(document.documentElement.style.getPropertyValue('--ov-color-bg-base')).toBe('');
    expect(document.documentElement.getAttribute('data-ov-theme-custom')).toBe(null);
  });

  it('clears previous overrides when switching between custom themes with different keys', () => {
    registry.register({ id: 'a', name: 'a', base: 'dark', colors: { 'color.bg.base': '#111' } });
    registry.register({ id: 'b', name: 'b', base: 'dark', colors: { 'color.fg.default': '#eee' } });
    registry.apply('a');
    expect(document.documentElement.style.getPropertyValue('--ov-color-bg-base')).toBe('#111');
    registry.apply('b');
    expect(document.documentElement.style.getPropertyValue('--ov-color-bg-base')).toBe('');
    expect(document.documentElement.style.getPropertyValue('--ov-color-fg-default')).toBe('#eee');
  });

  it('active() returns null before any apply()', () => {
    expect(registry.active()).toBeNull();
  });

  it('updates active() after apply()', () => {
    registry.apply('light');
    expect(registry.active()).toBe('light');
  });

  it('is idempotent — reapplies and emits event even if already active', () => {
    const events: ThemeRegistryEvent[] = [];
    registry.subscribe((e) => events.push(e));
    registry.apply('dark');
    registry.apply('dark');
    const applied = events.filter((e) => e.type === 'applied');
    expect(applied).toEqual([
      { type: 'applied', id: 'dark' },
      { type: 'applied', id: 'dark' },
    ]);
  });

  it('sets colorScheme light for high-contrast-light base', () => {
    registry.register({ id: 'lc', name: 'lc', base: 'high-contrast-light' });
    registry.apply('lc');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('idempotent apply() rewrites DOM state, not just events', () => {
    registry.apply('dark');
    // Externally corrupt the DOM.
    document.documentElement.removeAttribute('data-ov-theme');
    registry.apply('dark');
    expect(document.documentElement.getAttribute('data-ov-theme')).toBe('dark');
  });
});
