import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CommandPalette, type CommandItem } from './CommandPalette';

const commands: CommandItem[] = [
  { id: 'open', label: 'Open File', shortcut: 'Ctrl+O', group: 'File' },
  { id: 'save', label: 'Save File', shortcut: 'Ctrl+S', group: 'File' },
  { id: 'find', label: 'Find in Files', shortcut: 'Ctrl+Shift+F', group: 'Search' },
  { id: 'terminal', label: 'Toggle Terminal', shortcut: 'Ctrl+`', group: 'View' },
  { id: 'disabled', label: 'Disabled Command', disabled: true },
];

describe('CommandPalette', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    commands,
    onSelect: vi.fn(),
  };

  it('renders when open', () => {
    render(<CommandPalette {...defaultProps} />);
    expect(screen.getByTestId('command-palette')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<CommandPalette {...defaultProps} open={false} />);
    expect(screen.queryByTestId('command-palette')).not.toBeInTheDocument();
  });

  it('shows command items', () => {
    render(<CommandPalette {...defaultProps} />);
    expect(screen.getByTestId('command-item-open')).toBeInTheDocument();
    expect(screen.getByTestId('command-item-save')).toBeInTheDocument();
    expect(screen.getByTestId('command-item-find')).toBeInTheDocument();
  });

  it('filters out disabled commands', () => {
    render(<CommandPalette {...defaultProps} />);
    expect(screen.queryByTestId('command-item-disabled')).not.toBeInTheDocument();
  });

  it('filters commands by search text', async () => {
    const user = userEvent.setup();
    render(<CommandPalette {...defaultProps} />);
    const input = screen.getByTestId('command-palette-input');
    await user.type(input, 'terminal');
    expect(screen.getByTestId('command-item-terminal')).toBeInTheDocument();
    expect(screen.queryByTestId('command-item-open')).not.toBeInTheDocument();
  });

  it('shows empty state when no matches', async () => {
    const user = userEvent.setup();
    render(<CommandPalette {...defaultProps} />);
    await user.type(screen.getByTestId('command-palette-input'), 'zzzzz');
    expect(screen.getByTestId('command-palette-empty')).toBeInTheDocument();
  });

  it('selects command on click', async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<CommandPalette {...defaultProps} onSelect={onSelect} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('command-item-open'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'open' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(<CommandPalette {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(screen.getByTestId('command-palette-input'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('navigates with arrow keys and selects with Enter', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<CommandPalette {...defaultProps} onSelect={onSelect} onClose={onClose} />);
    const input = screen.getByTestId('command-palette-input');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'save' }));
  });

  it('closes on overlay click', () => {
    const onClose = vi.fn();
    render(<CommandPalette {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('command-palette-overlay'));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders group labels', () => {
    render(<CommandPalette {...defaultProps} />);
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
  });

  it('displays keyboard shortcuts', () => {
    render(<CommandPalette {...defaultProps} />);
    expect(screen.getByText('Ctrl+O')).toBeInTheDocument();
  });
});
