import { afterEach, describe, expect, it } from 'vitest';
import { buildXtermTheme } from './xterm';

afterEach(() => {
  document.documentElement.style.cssText = '';
  document.body.replaceChildren();
});

describe('buildXtermTheme', () => {
  it('reads tokens from the terminal container themed ancestor', () => {
    document.documentElement.style.setProperty('--ov-color-terminal-bg', '#111111');
    const root = document.createElement('div');
    root.dataset.ovTheme = 'dark';
    root.style.setProperty('--ov-color-terminal-bg', '#fefefe');
    const container = document.createElement('div');
    root.append(container);
    document.body.append(root);

    expect(buildXtermTheme(container).background).toBe('#fefefe');
  });
});
