import { render, screen, act } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Terminal, type TerminalHandle } from './Terminal';

// Mock xterm modules
const mockTerminal = {
  open: vi.fn(),
  dispose: vi.fn(),
  loadAddon: vi.fn(),
  onData: vi.fn(),
  onResize: vi.fn(),
  write: vi.fn(),
  writeln: vi.fn(),
  clear: vi.fn(),
  focus: vi.fn(),
  options: {} as Record<string, unknown>,
};

const mockFitAddon = {
  fit: vi.fn(),
};

vi.mock('@xterm/xterm', () => ({
  Terminal: vi.fn(() => mockTerminal),
}));

vi.mock('@xterm/addon-fit', () => ({
  FitAddon: vi.fn(() => mockFitAddon),
}));

vi.mock('@xterm/addon-search', () => ({
  SearchAddon: vi.fn(() => ({})),
}));

vi.mock('@xterm/addon-webgl', () => ({
  WebglAddon: vi.fn(() => ({})),
}));

// Mock ResizeObserver
beforeEach(() => {
  vi.clearAllMocks();
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

describe('Terminal', () => {
  it('renders terminal container', () => {
    render(<Terminal />);
    expect(screen.getByTestId('terminal')).toBeInTheDocument();
  });

  it('initializes xterm on mount', async () => {
    render(<Terminal />);
    // Wait for async init
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(mockTerminal.open).toHaveBeenCalled();
  });

  it('calls onData when provided', async () => {
    const onData = vi.fn();
    render(<Terminal onData={onData} />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(mockTerminal.onData).toHaveBeenCalledWith(onData);
  });

  it('calls onResize when provided', async () => {
    const onResize = vi.fn();
    render(<Terminal onResize={onResize} />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(mockTerminal.onResize).toHaveBeenCalled();
  });

  it('exposes imperative handle methods', async () => {
    const ref = createRef<TerminalHandle>();
    render(<Terminal ref={ref} />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    ref.current?.write('hello');
    expect(mockTerminal.write).toHaveBeenCalledWith('hello');

    ref.current?.writeln('line');
    expect(mockTerminal.writeln).toHaveBeenCalledWith('line');

    ref.current?.clear();
    expect(mockTerminal.clear).toHaveBeenCalled();

    ref.current?.focus();
    expect(mockTerminal.focus).toHaveBeenCalled();
  });

  it('merges className', () => {
    render(<Terminal className="custom-terminal" />);
    expect(screen.getByTestId('terminal')).toHaveClass('custom-terminal');
  });
});
