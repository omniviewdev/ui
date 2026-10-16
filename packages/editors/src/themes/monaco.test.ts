import { afterEach, describe, expect, it } from 'vitest';
import { buildMonacoTheme } from './monaco';

afterEach(() => {
  document.documentElement.style.cssText = '';
  document.body.replaceChildren();
});

function createThemeScope(): { root: HTMLDivElement; container: HTMLDivElement } {
  const root = document.createElement('div');
  root.dataset.ovTheme = 'dark';
  const container = document.createElement('div');
  root.append(container);
  document.body.append(root);
  return { root, container };
}

describe('buildMonacoTheme', () => {
  it('uses the light Monaco base for Solarized Light', () => {
    expect(buildMonacoTheme('solarized-light').base).toBe('vs');
  });

  it('reads tokens from the editor container themed ancestor', () => {
    document.documentElement.style.setProperty('--ov-color-editor-bg', '#111111');
    const { root, container } = createThemeScope();
    root.style.setProperty('--ov-color-editor-bg', '#fefefe');

    expect(buildMonacoTheme('dark', container).colors['editor.background']).toBe('#fefefe');
  });

  it('normalizes named and functional colors instead of dropping them', () => {
    const { root, container } = createThemeScope();
    root.style.setProperty('--ov-color-editor-bg', 'rebeccapurple');
    root.style.setProperty('--ov-syntax-string', 'hsl(120 100% 25%)');

    const theme = buildMonacoTheme('dark', container);

    expect(theme.colors['editor.background']).toBe('#663399');
    expect(theme.rules.find(({ token }) => token === 'string')?.foreground).toBe('008000');
  });
});
