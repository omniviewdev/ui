import { describe, expect, it, vi } from 'vitest';
import { createThemeRegistry } from './registry';
import type { ThemeDefinition, ThemeOwner } from './types';

const user = { kind: 'user', id: 'local' } as const;
const plugin = { kind: 'plugin', id: 'acme' } as const;

function theme(id: string, name = id, base: 'dark' | 'light' = 'dark'): ThemeDefinition {
  return { schemaVersion: 1, id, name, base, tokens: {} };
}

describe('theme registry', () => {
  it('provides stable immutable snapshots and idempotent owner-bound disposal', () => {
    const registry = createThemeRegistry();
    const before = registry.getSnapshot();
    expect(registry.getSnapshot()).toBe(before);
    expect(Object.isFrozen(before)).toBe(true);
    expect(Object.isFrozen(before.themes)).toBe(true);

    const dispose = registry.register(theme('acme.slate'), plugin);
    const afterAdd = registry.getSnapshot();
    expect(afterAdd.themes.some((entry) => entry.id === 'acme.slate')).toBe(true);
    expect(registry.getSnapshot()).toBe(afterAdd);
    expect(afterAdd).not.toBe(before);

    dispose();
    dispose();
    expect(registry.has('acme.slate')).toBe(false);
    expect(registry.getSnapshot()).not.toBe(afterAdd);
  });

  it('rejects duplicate IDs and built-in removal', () => {
    const registry = createThemeRegistry();
    registry.register(theme('duplicate'), user);
    expect(() => registry.register(theme('duplicate'), plugin)).toThrow(/already registered/i);
    expect(() => registry.unregister('void', { kind: 'builtin', id: 'base-ui' })).toThrow(/built-in/i);
  });

  it('rejects removal by the wrong owner', () => {
    const registry = createThemeRegistry();
    registry.register(theme('owned'), plugin);
    expect(() => registry.unregister('owned', { kind: 'plugin', id: 'other' })).toThrow(/owner/i);
    expect(registry.has('owned')).toBe(true);
  });

  it('unregisters all themes for an owner with one notification', () => {
    const registry = createThemeRegistry();
    const listener = vi.fn();
    registry.register(theme('acme.one'), plugin);
    registry.register(theme('acme.two'), plugin);
    registry.register(theme('user.one'), user);
    registry.subscribe(listener);

    expect(registry.unregisterOwner(plugin)).toBe(2);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(registry.has('acme.one')).toBe(false);
    expect(registry.has('acme.two')).toBe(false);
    expect(registry.has('user.one')).toBe(true);
    expect(registry.unregisterOwner(plugin)).toBe(0);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('orders built-ins, users, then plugins deterministically', () => {
    const registry = createThemeRegistry();
    registry.register(theme('plugin.z', 'Alpha'), plugin);
    registry.register(theme('user.z', 'Zulu'), user);
    registry.register(theme('user.a', 'Alpha'), user);
    registry.register(theme('user.b', 'Alpha'), user);
    registry.register(theme('plugin.a', 'Zulu'), plugin);

    expect(registry.getSnapshot().themes.slice(9).map(({ id }) => id)).toEqual([
      'user.a',
      'user.b',
      'user.z',
      'plugin.z',
      'plugin.a',
    ]);
  });

  it('isolates listener exceptions and snapshots dispatch listeners', () => {
    const registry = createThemeRegistry();
    const later = vi.fn();
    const healthy = vi.fn();
    registry.subscribe(() => {
      registry.subscribe(later);
      throw new Error('listener failure');
    });
    registry.subscribe(healthy);

    expect(() => registry.register(theme('first'), user)).not.toThrow();
    expect(healthy).toHaveBeenCalledTimes(1);
    expect(later).not.toHaveBeenCalled();
    registry.register(theme('second'), user);
    expect(later).toHaveBeenCalledTimes(1);
  });

  it('never reads or writes document', () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const get = vi.fn(() => {
      throw new Error('document accessed');
    });
    Object.defineProperty(globalThis, 'document', { configurable: true, get });
    try {
      const registry = createThemeRegistry();
      const dispose = registry.register(theme('pure'), user);
      registry.getSnapshot();
      dispose();
      expect(get).not.toHaveBeenCalled();
    } finally {
      if (descriptor) Object.defineProperty(globalThis, 'document', descriptor);
    }
  });

  it('returns frozen registered definitions with source metadata', () => {
    const registry = createThemeRegistry();
    const input = theme('safe');
    registry.register(input, user);
    const registered = registry.get('safe');
    expect(registered?.owner).toEqual(user);
    expect(registered?.builtIn).toBe(false);
    expect(Object.isFrozen(registered)).toBe(true);
    expect(Object.isFrozen(registered?.definition)).toBe(true);
  });

  it('compares owner kind and id', () => {
    const registry = createThemeRegistry();
    const first: ThemeOwner = { kind: 'plugin', id: 'shared' };
    const second: ThemeOwner = { kind: 'user', id: 'shared' };
    registry.register(theme('plugin.theme'), first);
    expect(() => registry.unregister('plugin.theme', second)).toThrow(/owner/i);
  });
});
