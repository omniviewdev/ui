import { describe, it, expect, beforeEach } from 'vitest';
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
});
