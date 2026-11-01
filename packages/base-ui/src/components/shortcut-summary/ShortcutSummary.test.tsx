import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { KeyChord, ShortcutSummary } from './ShortcutSummary';

afterEach(() => vi.restoreAllMocks());

describe('KeyChord', () => {
  it.each([
    ['mac', 'Command plus Shift plus Click', '⌘'],
    ['windows', 'Control plus Shift plus Click', 'Ctrl'],
    ['linux', 'Control plus Shift plus Click', 'Ctrl'],
  ] as const)('resolves Mod for %s with a spoken chord label', (platform, label, modifier) => {
    const { container } = renderWithTheme(
      <KeyChord keys={['Mod', 'Shift', 'Click']} platform={platform} />,
    );
    expect(screen.getByRole('group', { name: label })).toBeInTheDocument();
    expect(screen.getByText(modifier)).toBeInTheDocument();
    expect(container.querySelectorAll('kbd')).toHaveLength(3);
    expect(container.querySelector('kbd kbd')).toBeNull();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('speaks symbolic navigation keys and preserves custom labels', () => {
    const { rerender } = renderWithTheme(<KeyChord keys={['↑', 'Space']} />);
    expect(screen.getByRole('group', { name: 'Up arrow plus Space' })).toBeInTheDocument();
    rerender(<KeyChord keys={['Pointer button 4']} aria-label="Back mouse button" />);
    expect(screen.getByRole('group', { name: 'Back mouse button' })).toBeInTheDocument();
    expect(screen.getByText('Pointer button 4')).toBeInTheDocument();
  });

  it('hydrates automatic platform labels without mismatched server markup', async () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');
    const element = <KeyChord keys={['Mod', 'K']} />;
    const container = document.createElement('div');
    container.innerHTML = renderToString(element);
    expect(container.textContent).toContain('Mod');
    document.body.appendChild(container);
    const onRecoverableError = vi.fn();
    let root: Root | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, element, { onRecoverableError });
      });
      expect(within(container).getByRole('group', { name: 'Command plus K' })).toBeInTheDocument();
      expect(container.textContent).toContain('⌘');
      expect(onRecoverableError).not.toHaveBeenCalled();
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });
});

describe('ShortcutSummary', () => {
  it('associates descriptions with alternative chords using a definition list', () => {
    const { container } = renderWithTheme(
      <ShortcutSummary
        title="Editor shortcuts"
        platform="linux"
        items={[
          {
            id: 'palette',
            keys: ['Mod', 'Shift', 'P'],
            alternatives: [['F1']],
            description: <strong>Command palette</strong>,
          },
        ]}
      />,
    );
    const heading = screen.getByRole('heading', { name: 'Editor shortcuts' });
    const summary = heading.parentElement!;
    expect(summary).toHaveAttribute('aria-labelledby', heading.id);
    expect(container.querySelectorAll('dt')).toHaveLength(1);
    expect(container.querySelector('dd')).toContainElement(screen.getByText('Command palette'));
    expect(screen.getByRole('group', { name: 'Control plus Shift plus P' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'F1' })).toBeInTheDocument();
    expect(container.querySelector('kbd kbd')).toBeNull();
  });
});
