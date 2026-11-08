import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { IconButton } from '../icon-button';
import { useSidebar, useSidebarController } from './context';
import type { SidebarController } from './controller';
import { Sidebar } from './Sidebar';
import type { SidebarRootProps, SidebarState } from './types';

function setPlatform(platform: string) {
  Object.defineProperty(window.navigator, 'platform', { value: platform, configurable: true });
}

beforeEach(() => setPlatform('Linux x86_64'));
afterEach(() => {
  Reflect.deleteProperty(window.navigator, 'platform');
  vi.useRealTimers();
});

function Shell(props: SidebarRootProps) {
  return (
    <Sidebar.Root aria-label="Cluster" {...props}>
      <Sidebar.Header>
        <span>lead</span>
        <Sidebar.Expanded>
          <button type="button">Expanded action</button>
        </Sidebar.Expanded>
      </Sidebar.Header>
      <Sidebar.Rail>
        <button type="button">Rail action</button>
      </Sidebar.Rail>
      <Sidebar.Content>content</Sidebar.Content>
      <Sidebar.Footer>
        <Sidebar.Toggle />
      </Sidebar.Footer>
      <Sidebar.Handle />
    </Sidebar.Root>
  );
}

const getRoot = (name = 'Cluster') => screen.getByRole('navigation', { name });

function queryRequired(selector: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}
const getToggle = () => queryRequired('[data-ov-sidebar-toggle]');
const getHandle = () => queryRequired('[data-ov-sidebar-handle]');

function contentOf(root: HTMLElement): HTMLElement {
  const content = root.querySelector<HTMLElement>('[data-ov-sidebar-part="content"]');
  if (!content) throw new Error('Sidebar content not found');
  return content;
}

/** Records the latest useSidebar() value rendered inside a root. */
function createRecorder() {
  const recorded: { current?: SidebarState } = {};
  function Probe() {
    recorded.current = useSidebar();
    return null;
  }
  return { recorded, Probe };
}

describe('Sidebar.Root', () => {
  it('toggles an uncontrolled sidebar and reports the explicit change once', () => {
    const onModeChange = vi.fn();
    renderWithTheme(<Shell onModeChange={onModeChange} />);

    fireEvent.click(getToggle());
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-mode', 'rail');
    expect(onModeChange).toHaveBeenCalledTimes(1);
    expect(onModeChange).toHaveBeenLastCalledWith('rail');
  });

  it('is fully controlled when mode is provided', () => {
    const onModeChange = vi.fn();
    const { rerender } = renderWithTheme(<Shell mode="expanded" onModeChange={onModeChange} />);

    fireEvent.click(getToggle());
    expect(onModeChange).toHaveBeenCalledWith('rail');
    // The owner did not accept the change, so nothing moves.
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-mode', 'expanded');

    rerender(<Shell mode="rail" onModeChange={onModeChange} />);
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-mode', 'rail');
  });

  it('does not report a mode change when the mode is already set', () => {
    const onModeChange = vi.fn();
    const { recorded, Probe } = createRecorder();
    renderWithTheme(
      <Sidebar.Root aria-label="Cluster" onModeChange={onModeChange}>
        <Probe />
      </Sidebar.Root>,
    );
    act(() => recorded.current?.setMode('expanded'));
    expect(onModeChange).not.toHaveBeenCalled();
  });

  it('exposes mode, collapsed, peeking and actions through useSidebar', () => {
    const { recorded, Probe } = createRecorder();
    renderWithTheme(
      <Sidebar.Root aria-label="Cluster" id="probe-sidebar">
        <Probe />
      </Sidebar.Root>,
    );
    expect(recorded.current).toMatchObject({
      id: 'probe-sidebar',
      mode: 'expanded',
      collapsed: false,
      peeking: false,
    });

    act(() => recorded.current?.toggle());
    expect(recorded.current).toMatchObject({ mode: 'rail', collapsed: true, peeking: false });

    act(() => recorded.current?.setMode('expanded'));
    expect(recorded.current).toMatchObject({ mode: 'expanded', collapsed: false });
  });

  it('throws a clear error when used outside a sidebar without a controller', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Probe() {
      useSidebar();
      return null;
    }
    expect(() => renderWithTheme(<Probe />)).toThrow(/Sidebar\.Root/);
    error.mockRestore();
  });
});

describe('Sidebar slots', () => {
  it('makes the hidden presentation inert and aria-hidden, and swaps on collapse', () => {
    const { rerender } = renderWithTheme(<Shell mode="expanded" />);
    const expanded = screen.getByText('Expanded action').closest('[data-ov-sidebar-slot]');
    const rail = screen.getByText('Rail action').closest('[data-ov-sidebar-slot]');
    expect(expanded).not.toHaveAttribute('inert');
    expect(expanded).not.toHaveAttribute('aria-hidden');
    expect(rail).toHaveAttribute('inert');
    expect(rail).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('button', { name: 'Rail action' })).not.toBeInTheDocument();

    rerender(<Shell mode="rail" />);
    expect(expanded).toHaveAttribute('inert');
    expect(expanded).toHaveAttribute('aria-hidden', 'true');
    expect(rail).not.toHaveAttribute('inert');
    expect(screen.getByRole('button', { name: 'Rail action' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Expanded action' })).not.toBeInTheDocument();
  });

  it('preserves an unsaved field when collapsing and reopening', () => {
    renderWithTheme(
      <Sidebar.Root aria-label="Cluster">
        <Sidebar.Expanded>
          <input aria-label="Draft filter" />
        </Sidebar.Expanded>
        <Sidebar.Toggle />
      </Sidebar.Root>,
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Draft filter' }), {
      target: { value: 'unsaved filter' },
    });
    fireEvent.click(getToggle());
    fireEvent.click(getToggle());
    expect(screen.getByRole('textbox', { name: 'Draft filter' })).toHaveValue('unsaved filter');
  });

  it('moves focus out of a slot that is becoming inert', () => {
    const controller = Sidebar.createController();
    renderWithTheme(<Shell controller={controller} />);

    const expandedAction = screen.getByRole('button', { name: 'Expanded action' });
    act(() => expandedAction.focus());
    expect(document.activeElement).toBe(expandedAction);

    act(() => controller.setMode('rail'));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Rail action' }));
  });
});

describe('Sidebar triggers', () => {
  it('labels the built-in handle and toggle for each state and wires aria-controls', () => {
    renderWithTheme(<Shell id="side" />);

    for (const control of [getHandle(), getToggle()]) {
      expect(control).toHaveAttribute('aria-label', 'Collapse sidebar');
      expect(control).toHaveAttribute('aria-expanded', 'true');
      expect(control).toHaveAttribute('aria-controls', 'side');
    }

    fireEvent.click(getHandle());
    for (const control of [getHandle(), getToggle()]) {
      expect(control).toHaveAttribute('aria-label', 'Expand sidebar');
      expect(control).toHaveAttribute('aria-expanded', 'false');
    }
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-mode', 'rail');
  });

  it('shows the shortcut hint and aria-keyshortcuts only when the shortcut is registered', () => {
    const { unmount } = renderWithTheme(<Shell />);
    expect(getToggle()).not.toHaveAttribute('aria-keyshortcuts');
    expect(screen.queryByText('Ctrl+B')).not.toBeInTheDocument();
    unmount();

    renderWithTheme(<Shell shortcut />);
    expect(getToggle()).toHaveAttribute('aria-keyshortcuts', 'Control+B');
    expect(screen.getByText('Ctrl+B')).toBeInTheDocument();
  });

  it('composes with a custom button through the render prop', () => {
    renderWithTheme(
      <Sidebar.Root aria-label="Cluster" id="side">
        <Sidebar.Trigger
          render={
            <IconButton variant="ghost" size="sm" data-testid="custom">
              x
            </IconButton>
          }
        />
      </Sidebar.Root>,
    );
    const custom = screen.getByTestId('custom');
    expect(custom).toHaveAttribute('aria-controls', 'side');
    expect(custom).toHaveAttribute('aria-expanded', 'true');
    expect(custom).toHaveAttribute('aria-label', 'Collapse sidebar');

    fireEvent.click(custom);
    expect(custom).toHaveAttribute('aria-expanded', 'false');
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-mode', 'rail');
  });

  it('lets triggers and hooks outside the root observe and control it with a controller', () => {
    function OutsideState({ controller }: { controller: SidebarController }) {
      const state = useSidebar(controller);
      return (
        <output data-testid="state">{`${state.mode}:${state.collapsed}:${state.peeking}`}</output>
      );
    }
    function Harness() {
      const controller = useSidebarController();
      return (
        <>
          <Shell controller={controller} id="side" />
          <Sidebar.Trigger controller={controller} data-testid="outside" />
          <OutsideState controller={controller} />
        </>
      );
    }
    renderWithTheme(<Harness />);

    const outside = screen.getByTestId('outside');
    expect(outside).toHaveAttribute('aria-controls', 'side');
    expect(screen.getByTestId('state')).toHaveTextContent('expanded:false:false');

    fireEvent.click(outside);
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-mode', 'rail');
    expect(outside).toHaveAttribute('aria-label', 'Expand sidebar');
    expect(screen.getByTestId('state')).toHaveTextContent('rail:true:false');
  });

  it('resets controller state when the root unmounts', () => {
    const controller = Sidebar.createController();
    const { unmount } = renderWithTheme(<Shell controller={controller} defaultMode="rail" />);
    expect(controller.getSnapshot().mode).toBe('rail');
    unmount();
    expect(controller.getSnapshot().mode).toBe('expanded');
    expect(controller.getSnapshot().id).toBe('');
  });
});

describe('Sidebar hover peek', () => {
  it.each(['pointer', 'keyboard'] as const)(
    'does not open hover peek after explicit %s input',
    (input) => {
      vi.useFakeTimers();
      renderWithTheme(<Shell defaultMode="rail" hoverPeek />);
      fireEvent.pointerEnter(getRoot(), { pointerType: 'mouse' });
      act(() => vi.advanceTimersByTime(100));
      const action = screen.getByRole('button', { name: 'Rail action' });
      if (input === 'pointer') fireEvent.pointerDown(action);
      else fireEvent.keyDown(action, { key: 'Enter' });
      act(() => vi.advanceTimersByTime(300));
      expect(getRoot()).toHaveAttribute('data-ov-sidebar-peeking', 'false');
    },
  );
  it('overlays after hover intent, labels the toggle as pin, and closes after leave', () => {
    vi.useFakeTimers();
    const onModeChange = vi.fn();
    renderWithTheme(<Shell mode="rail" hoverPeek onModeChange={onModeChange} />);
    const root = getRoot();

    fireEvent.pointerEnter(root);
    act(() => vi.advanceTimersByTime(279));
    expect(root).toHaveAttribute('data-ov-sidebar-peeking', 'false');

    act(() => vi.advanceTimersByTime(1));
    expect(root).toHaveAttribute('data-ov-sidebar-peeking', 'true');
    expect(root).toHaveAttribute('data-ov-sidebar-mode', 'rail');
    expect(root).toHaveAttribute('data-ov-sidebar-collapsed', 'false');
    expect(getToggle()).toHaveAttribute('aria-label', 'Pin open sidebar');
    // Peeking never reaches the owner and never becomes the saved mode.
    expect(onModeChange).not.toHaveBeenCalled();

    fireEvent.pointerLeave(root);
    act(() => vi.advanceTimersByTime(219));
    expect(root).toHaveAttribute('data-ov-sidebar-peeking', 'true');
    act(() => vi.advanceTimersByTime(1));
    expect(root).toHaveAttribute('data-ov-sidebar-peeking', 'false');
    expect(root).toHaveAttribute('data-ov-sidebar-collapsed', 'true');
  });

  it('cancels a pending peek when the pointer leaves before the intent delay', () => {
    vi.useFakeTimers();
    renderWithTheme(<Shell mode="rail" hoverPeek />);
    const root = getRoot();

    fireEvent.pointerEnter(root);
    act(() => vi.advanceTimersByTime(200));
    fireEvent.pointerLeave(root);
    act(() => vi.advanceTimersByTime(1000));
    expect(root).toHaveAttribute('data-ov-sidebar-peeking', 'false');
  });

  it('pins open when expanded while peeking', () => {
    vi.useFakeTimers();
    const onModeChange = vi.fn();
    renderWithTheme(<Shell defaultMode="rail" hoverPeek onModeChange={onModeChange} />);
    const root = getRoot();
    fireEvent.pointerEnter(root);
    act(() => vi.advanceTimersByTime(280));
    expect(root).toHaveAttribute('data-ov-sidebar-peeking', 'true');

    fireEvent.click(getHandle());
    expect(root).toHaveAttribute('data-ov-sidebar-mode', 'expanded');
    expect(root).toHaveAttribute('data-ov-sidebar-peeking', 'false');
    expect(onModeChange).toHaveBeenCalledTimes(1);
    expect(onModeChange).toHaveBeenCalledWith('expanded');
  });

  it('closes the peek on Escape', () => {
    vi.useFakeTimers();
    renderWithTheme(<Shell mode="rail" hoverPeek />);
    const root = getRoot();
    fireEvent.pointerEnter(root);
    act(() => vi.advanceTimersByTime(280));
    expect(root).toHaveAttribute('data-ov-sidebar-peeking', 'true');

    fireEvent.keyDown(root, { key: 'Escape' });
    expect(root).toHaveAttribute('data-ov-sidebar-peeking', 'false');
  });

  it.each(['body', 'content'] as const)(
    'dismisses pointer peek with Escape while focus stays in %s',
    (focus) => {
      vi.useFakeTimers();
      const onModeChange = vi.fn();
      renderWithTheme(
        <>
          <Shell mode="rail" hoverPeek onModeChange={onModeChange} />
          <button type="button">Resource content</button>
        </>,
      );
      const target =
        focus === 'body' ? document.body : screen.getByRole('button', { name: 'Resource content' });
      if (focus === 'content') act(() => target.focus());
      const previousFocus = document.activeElement;
      fireEvent.pointerEnter(getRoot(), { pointerType: 'mouse' });
      act(() => vi.advanceTimersByTime(280));
      expect(getRoot()).toHaveAttribute('data-ov-sidebar-peeking', 'true');
      fireEvent.keyDown(target, { key: 'Escape' });
      expect(getRoot()).toHaveAttribute('data-ov-sidebar-peeking', 'false');
      expect(getRoot()).toHaveAttribute('data-ov-sidebar-mode', 'rail');
      expect(document.activeElement).toBe(previousFocus);
      expect(onModeChange).not.toHaveBeenCalled();
    },
  );

  it('preserves handled Escape and IME composition before dismissing a peek', () => {
    vi.useFakeTimers();
    renderWithTheme(
      <>
        <Shell mode="rail" hoverPeek />
        <button type="button" onKeyDown={(event) => event.preventDefault()}>
          Content overlay
        </button>
      </>,
    );
    const target = screen.getByRole('button', { name: 'Content overlay' });
    act(() => target.focus());
    fireEvent.pointerEnter(getRoot(), { pointerType: 'mouse' });
    act(() => vi.advanceTimersByTime(280));
    fireEvent.keyDown(target, { key: 'Escape' });
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-peeking', 'true');
    fireEvent.keyDown(document.body, { key: 'Escape', isComposing: true });
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-peeking', 'true');
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-peeking', 'false');
  });

  it('never peeks unless opted in or while expanded', () => {
    vi.useFakeTimers();
    const { rerender } = renderWithTheme(<Shell mode="rail" />);
    fireEvent.pointerEnter(getRoot());
    act(() => vi.advanceTimersByTime(1000));
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-peeking', 'false');

    rerender(<Shell mode="expanded" hoverPeek />);
    fireEvent.pointerEnter(getRoot());
    act(() => vi.advanceTimersByTime(1000));
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-peeking', 'false');
  });

  it('ends a peek when the owner changes the mode', () => {
    vi.useFakeTimers();
    const { rerender } = renderWithTheme(<Shell mode="rail" hoverPeek />);
    fireEvent.pointerEnter(getRoot());
    act(() => vi.advanceTimersByTime(280));
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-peeking', 'true');

    rerender(<Shell mode="expanded" hoverPeek />);
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-peeking', 'false');
    rerender(<Shell mode="rail" hoverPeek />);
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-peeking', 'false');
  });
});

describe('Sidebar keyboard shortcut', () => {
  /** Returns false when the shortcut handled the key and prevented its default action. */
  const press = (target: Element | Document = document.body, init: KeyboardEventInit = {}) =>
    fireEvent.keyDown(target, { key: 'b', ctrlKey: true, ...init });

  it('toggles with Ctrl+B and prevents the default action', () => {
    renderWithTheme(<Shell shortcut />);
    expect(press()).toBe(false);
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-mode', 'rail');
    press();
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-mode', 'expanded');
  });

  it('does nothing without the shortcut prop', () => {
    renderWithTheme(<Shell />);
    expect(press()).toBe(true);
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-mode', 'expanded');
  });

  it('uses Cmd on Apple platforms and ignores other modifier combinations', () => {
    setPlatform('MacIntel');
    renderWithTheme(<Shell shortcut />);

    press(document.body, { ctrlKey: true });
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-mode', 'expanded');
    press(document.body, { ctrlKey: false, metaKey: true, shiftKey: true });
    press(document.body, { ctrlKey: false, metaKey: true, altKey: true });
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-mode', 'expanded');
    press(document.body, { ctrlKey: false, metaKey: true });
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-mode', 'rail');
  });

  it('ignores repeats, composition and already-handled keys', () => {
    renderWithTheme(<Shell shortcut />);
    press(document.body, { repeat: true });
    press(document.body, { isComposing: true });
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-mode', 'expanded');

    const handled = (event: KeyboardEvent) => event.preventDefault();
    document.addEventListener('keydown', handled, true);
    press();
    document.removeEventListener('keydown', handled, true);
    expect(getRoot()).toHaveAttribute('data-ov-sidebar-mode', 'expanded');
  });

  it('is guarded inside inputs, editors and every descendant of an editing surface', () => {
    renderWithTheme(
      <>
        <input aria-label="Filter" />
        <textarea aria-label="Notes" />
        <div contentEditable suppressContentEditableWarning>
          <p>
            <span data-testid="rich-text">rich</span>
          </p>
        </div>
        <div role="textbox" aria-label="Expression">
          <span data-testid="textbox-child">expr</span>
        </div>
        <div className="monaco-editor">
          <span data-testid="monaco-child">code</span>
        </div>
        <div data-ov-editor="">
          <span data-testid="marked-child">marked</span>
        </div>
        <Shell shortcut />
      </>,
    );

    const guarded = [
      screen.getByRole('textbox', { name: 'Filter' }),
      screen.getByRole('textbox', { name: 'Notes' }),
      screen.getByTestId('rich-text'),
      screen.getByTestId('textbox-child'),
      screen.getByTestId('monaco-child'),
      screen.getByTestId('marked-child'),
    ];
    for (const target of guarded) {
      expect(press(target)).toBe(true);
      expect(getRoot()).toHaveAttribute('data-ov-sidebar-mode', 'expanded');
    }
  });

  it('toggles exactly one sidebar: the one containing the event, then the last used', () => {
    renderWithTheme(
      <>
        <Shell shortcut aria-label="First" />
        <Shell shortcut aria-label="Second" />
      </>,
    );
    const first = getRoot('First');
    const second = getRoot('Second');
    const modes = () => [
      first.getAttribute('data-ov-sidebar-mode'),
      second.getAttribute('data-ov-sidebar-mode'),
    ];

    // Outside both and never interacted: the first one in document order answers.
    press();
    expect(modes()).toEqual(['rail', 'expanded']);
    press();
    expect(modes()).toEqual(['expanded', 'expanded']);

    // An event inside the second sidebar belongs to the second sidebar.
    press(contentOf(second));
    expect(modes()).toEqual(['expanded', 'rail']);
    press(contentOf(second));
    expect(modes()).toEqual(['expanded', 'expanded']);

    // Interacting with the second makes it the one a global press reaches.
    fireEvent.pointerDown(second);
    press();
    expect(modes()).toEqual(['expanded', 'rail']);
  });

  it('skips sidebars that are hidden', () => {
    renderWithTheme(
      <>
        <div hidden>
          <Shell shortcut aria-label="Hidden" />
        </div>
        <Shell shortcut aria-label="Visible" />
      </>,
    );
    press();
    expect(getRoot('Visible')).toHaveAttribute('data-ov-sidebar-mode', 'rail');
    expect(screen.getByRole('navigation', { name: 'Hidden', hidden: true })).toHaveAttribute(
      'data-ov-sidebar-mode',
      'expanded',
    );
  });

  it('unregisters on unmount', () => {
    const { unmount } = renderWithTheme(<Shell shortcut />);
    unmount();
    expect(press()).toBe(true);
  });
});
