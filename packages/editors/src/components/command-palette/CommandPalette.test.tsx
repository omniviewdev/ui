import { StrictMode, createRef, useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CommandPalette, type CommandItem } from './CommandPalette';

const commands: CommandItem[] = [
  { id: 'open', label: 'Open File', shortcut: 'Ctrl+O', group: 'File' },
  { id: 'disabled', label: 'Disabled Command', disabled: true },
  { id: 'find', label: 'Find in Files', group: 'Search' },
  { id: 'save', label: 'Save File', group: 'File' },
  { id: 'terminal', label: 'Toggle Terminal', description: 'Show the integrated terminal', group: 'View' },
];

function setup(items = commands) {
  const onSelect = vi.fn();
  const onClose = vi.fn();
  const props = { open: true, commands: items, onSelect, onClose };
  const view = render(<CommandPalette {...props} />);
  return { ...view, props, onSelect, onClose, input: screen.getByTestId('command-palette-input') };
}

function activeOption(input: HTMLElement) {
  const id = input.getAttribute('aria-activedescendant');
  return id ? document.getElementById(id) : null;
}

function Launcher() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  return <>
    <button onClick={() => setOpen(true)}>Open palette</button>
    <button>Outside</button>
    <output>{selected}</output>
    <CommandPalette open={open} commands={commands} onClose={() => setOpen(false)} onSelect={(command) => setSelected(command.id)} />
  </>;
}

describe('CommandPalette real interactions', () => {
  it('links the focused, named combobox to its named list and selected option', () => {
    const { input } = setup();
    expect(screen.getByRole('combobox', { name: 'Search commands' })).toBe(input);
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    const list = screen.getByRole('listbox', { name: 'Commands' });
    expect(input).toHaveAttribute('aria-controls', list.id);
    expect(activeOption(input)).toBe(screen.getByRole('option', { name: /Open File/ }));
    expect(activeOption(input)).toHaveAttribute('aria-selected', 'true');
    expect(list).toContainElement(activeOption(input));
  });

  it('keeps interleaved groups in caller order for display and Arrow/Enter activation', () => {
    const { input, onSelect, onClose } = setup();
    expect(screen.getAllByRole('option').map((item) => item.textContent)).toEqual([
      expect.stringContaining('Open File'), expect.stringContaining('Find in Files'),
      expect.stringContaining('Save File'), expect.stringContaining('Toggle Terminal'),
    ]);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(commands[2]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('wraps ArrowUp/Down and never executes a disabled command', () => {
    const { input, onSelect } = setup();
    expect(screen.queryByText('Disabled Command')).not.toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(activeOption(input)).toHaveTextContent('Toggle Terminal');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(activeOption(input)).toHaveTextContent('Open File');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(commands[2]);
  });

  it.each(['integrated', 'view', 'tgt'])('matches static description/group/subsequence input: %s', async (query) => {
    const user = userEvent.setup();
    const { input, onSelect } = setup();
    await user.type(input, query);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(commands[4]);
  });

  it('replaces an active result with current data and a valid current selection', () => {
    const { input, props, rerender, onSelect } = setup();
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    const replacement = [{ id: 'new', label: 'New action' }];
    rerender(<CommandPalette {...props} commands={replacement} />);
    expect(activeOption(input)).toBe(screen.getByRole('option', { name: 'New action' }));
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(replacement[0]);
  });

  it('uses the replacement object for a reused ID, and drops it when disabled', () => {
    const { input, props, rerender, onSelect } = setup();
    const current = { id: 'open', label: 'Current Open' };
    rerender(<CommandPalette {...props} commands={[current]} />);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(current);
    onSelect.mockClear();
    rerender(<CommandPalette {...props} commands={[{ ...current, disabled: true }]} />);
    expect(activeOption(input)).toBeNull();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('clears the active descendant for empty results and recovers when results return', () => {
    const { input, props, rerender, onSelect } = setup();
    rerender(<CommandPalette {...props} commands={[]} />);
    expect(input).not.toHaveAttribute('aria-activedescendant');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toBeVisible();
    rerender(<CommandPalette {...props} commands={commands} />);
    expect(activeOption(input)).toHaveTextContent('Open File');
  });

  it('distinguishes loading, error and empty, blocking old results while unavailable', () => {
    const { input, props, rerender, onSelect } = setup();
    rerender(<CommandPalette {...props} {...{ loading: true }} />);
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryAllByRole('option')).toEqual([]);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
    rerender(<CommandPalette {...props} {...{ loading: true, error: 'Commands unavailable. Try again.' }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Commands unavailable. Try again.');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
    rerender(<CommandPalette {...props} commands={[]} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it.each(['Enter', 'Escape', 'ArrowDown'])('ignores %s during composition and Safari IME keycode 229', (key) => {
    const { input, onSelect, onClose } = setup();
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key });
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key, isComposing: true });
    fireEvent.keyDown(input, { key, keyCode: 229 });
    expect(onSelect).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(commands[0]);
  });

  it.each(['Escape', 'Enter', 'backdrop'])('restores opener focus after %s dismissal, including effect replay', async (key) => {
    const user = userEvent.setup();
    render(<StrictMode><Launcher /></StrictMode>);
    const opener = screen.getByRole('button', { name: 'Open palette' });
    await user.click(opener);
    expect(screen.getByTestId('command-palette-input')).toHaveFocus();
    if (key === 'backdrop') await user.click(screen.getByTestId('command-palette-overlay'));
    else await user.keyboard(`{${key}}`);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('keeps keyboard navigation and Escape working after clicking a group heading', async () => {
    const user = userEvent.setup();
    render(<Launcher />);
    const opener = screen.getByRole('button', { name: 'Open palette' });
    await user.click(opener);
    const input = screen.getByTestId('command-palette-input');
    await user.click(screen.getAllByText('File')[0]!);
    expect(input).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(activeOption(input)).toHaveTextContent('Find in Files');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('contains Tab focus and resets query/selection on reopen', async () => {
    const user = userEvent.setup();
    render(<Launcher />);
    await user.click(screen.getByRole('button', { name: 'Open palette' }));
    const input = screen.getByTestId('command-palette-input');
    await user.tab({ shift: true });
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);
    await user.tab();
    expect(input).toHaveFocus();
    await user.type(input, 'terminal');
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Open palette' }));
    expect(screen.getByTestId('command-palette-input')).toHaveValue('');
    expect(activeOption(screen.getByTestId('command-palette-input'))).toHaveTextContent('Open File');
  });

  it('lets Enter activate Clear search rather than the current command', async () => {
    const user = userEvent.setup();
    const { input, onSelect, onClose } = setup();
    await user.type(input, 'terminal');
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Clear search' })).toHaveFocus();
    await user.tab();
    expect(input).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Clear search' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(onSelect).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('restores focus on controlled close and unmount with a callback ref', () => {
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();
    const ref = vi.fn();
    const props = { open: true, commands, onSelect: vi.fn(), onClose: vi.fn(), ref };
    const { rerender, unmount } = render(<CommandPalette {...props} />);
    rerender(<CommandPalette {...props} open={false} />);
    expect(opener).toHaveFocus();
    rerender(<CommandPalette {...props} />);
    unmount();
    expect(opener).toHaveFocus();
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    opener.remove();
  });

  it('does not steal deliberate destination focus after command execution', () => {
    const destination = document.createElement('button');
    document.body.append(destination);
    const { input, props, rerender } = setup();
    rerender(<CommandPalette {...props} onSelect={() => destination.focus()} />);
    fireEvent.keyDown(input, { key: 'Enter' });
    rerender(<CommandPalette {...props} open={false} />);
    expect(destination).toHaveFocus();
    destination.remove();
  });

  it('keeps the public ref on the dialog and pointer activation single-shot', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<CommandPalette ref={ref} open commands={commands} onSelect={onSelect} onClose={onClose} />);
    expect(ref.current).toBe(screen.getByRole('dialog'));
    await user.click(screen.getByRole('option', { name: /Find in Files/ }));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(commands[2]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
