import { render, screen, act } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Terminal, type TerminalHandle } from './Terminal';

// Mock xterm modules
const mockOnData = vi.fn();
const mockOnBinary = vi.fn();
const mockOnResize = vi.fn();

const mockTerminal = {
  open: vi.fn(),
  dispose: vi.fn(),
  loadAddon: vi.fn(),
  onData: vi.fn((cb) => {
    mockOnData.mockImplementation(cb);
  }),
  onBinary: vi.fn((cb) => {
    mockOnBinary.mockImplementation(cb);
  }),
  onResize: vi.fn((cb) => {
    mockOnResize.mockImplementation(cb);
  }),
  write: vi.fn(),
  writeln: vi.fn(),
  clear: vi.fn(),
  focus: vi.fn(),
  reset: vi.fn(),
  scrollToBottom: vi.fn(),
  cols: 80,
  rows: 24,
  options: {} as Record<string, unknown>,
};

const mockFitAddon = {
  fit: vi.fn(),
  dispose: vi.fn(),
};

const mockSearchAddon = {
  dispose: vi.fn(),
};

const mockWebglAddon = {
  onContextLoss: vi.fn(),
  dispose: vi.fn(),
};

const mockCanvasAddon = {
  dispose: vi.fn(),
};

const mockWebLinksAddon = {
  dispose: vi.fn(),
};

vi.mock('@xterm/xterm', () => ({
  Terminal: vi.fn(() => mockTerminal),
}));

vi.mock('@xterm/addon-fit', () => ({
  FitAddon: vi.fn(() => mockFitAddon),
}));

vi.mock('@xterm/addon-search', () => ({
  SearchAddon: vi.fn(() => mockSearchAddon),
}));

vi.mock('@xterm/addon-webgl', () => ({
  WebglAddon: vi.fn(() => mockWebglAddon),
}));

vi.mock('@xterm/addon-canvas', () => ({
  CanvasAddon: vi.fn(() => mockCanvasAddon),
}));

vi.mock('@xterm/addon-web-links', () => ({
  WebLinksAddon: vi.fn(() => mockWebLinksAddon),
}));

// Mock ResizeObserver
let resizeCallback: (() => void) | null = null;
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  resizeCallback = null;
  global.ResizeObserver = vi.fn().mockImplementation((cb) => {
    resizeCallback = cb;
    return {
      observe: mockObserve,
      unobserve: vi.fn(),
      disconnect: mockDisconnect,
    };
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function waitForInit() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 10));
  });
}

describe('Terminal', () => {
  it('renders terminal container', () => {
    render(<Terminal />);
    expect(screen.getByTestId('terminal')).toBeInTheDocument();
  });

  it('initializes xterm on mount', async () => {
    render(<Terminal />);
    await waitForInit();
    expect(mockTerminal.open).toHaveBeenCalled();
  });

  it('loads fit and search addons', async () => {
    render(<Terminal />);
    await waitForInit();
    expect(mockTerminal.loadAddon).toHaveBeenCalledWith(mockFitAddon);
    expect(mockTerminal.loadAddon).toHaveBeenCalledWith(mockSearchAddon);
  });

  it('loads web links addon by default', async () => {
    render(<Terminal />);
    await waitForInit();
    expect(mockTerminal.loadAddon).toHaveBeenCalledWith(mockWebLinksAddon);
  });

  it('skips web links addon when linkHandling is false', async () => {
    render(<Terminal linkHandling={false} />);
    await waitForInit();
    expect(mockTerminal.loadAddon).not.toHaveBeenCalledWith(mockWebLinksAddon);
  });

  it('calls initial fit after opening', async () => {
    render(<Terminal />);
    await waitForInit();
    expect(mockFitAddon.fit).toHaveBeenCalled();
  });

  it('sets up ResizeObserver on container', async () => {
    render(<Terminal />);
    await waitForInit();
    expect(mockObserve).toHaveBeenCalled();
  });

  it('calls onData through stable ref', async () => {
    const onData = vi.fn();
    render(<Terminal onData={onData} />);
    await waitForInit();
    // Simulate terminal data input
    expect(mockTerminal.onData).toHaveBeenCalled();
    mockOnData('test-input');
    expect(onData).toHaveBeenCalledWith('test-input');
  });

  it('calls onBinaryData through stable ref', async () => {
    const onBinaryData = vi.fn();
    render(<Terminal onBinaryData={onBinaryData} />);
    await waitForInit();
    expect(mockTerminal.onBinary).toHaveBeenCalled();
    mockOnBinary('binary-data');
    expect(onBinaryData).toHaveBeenCalledWith('binary-data');
  });

  it('calls onResize through stable ref', async () => {
    const onResize = vi.fn();
    render(<Terminal onResize={onResize} />);
    await waitForInit();
    expect(mockTerminal.onResize).toHaveBeenCalled();
    mockOnResize({ cols: 120, rows: 40 });
    expect(onResize).toHaveBeenCalledWith(120, 40);
  });

  it('handles WebGL context loss gracefully', async () => {
    render(<Terminal />);
    await waitForInit();
    expect(mockWebglAddon.onContextLoss).toHaveBeenCalled();
    // Simulate context loss
    const contextLossHandler = mockWebglAddon.onContextLoss.mock.calls[0]?.[0] as () => void;
    contextLossHandler();
    expect(mockWebglAddon.dispose).toHaveBeenCalled();
  });

  describe('imperative handle', () => {
    it('write accepts string data', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      ref.current?.write('hello');
      expect(mockTerminal.write).toHaveBeenCalledWith('hello');
    });

    it('write accepts Uint8Array data', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      const data = new Uint8Array([72, 101, 108, 108, 111]);
      ref.current?.write(data);
      expect(mockTerminal.write).toHaveBeenCalledWith(data);
    });

    it('writeln writes a line', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      ref.current?.writeln('line');
      expect(mockTerminal.writeln).toHaveBeenCalledWith('line');
    });

    it('clear clears the terminal', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      ref.current?.clear();
      expect(mockTerminal.clear).toHaveBeenCalled();
    });

    it('focus focuses the terminal', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      ref.current?.focus();
      expect(mockTerminal.focus).toHaveBeenCalled();
    });

    it('fit re-fits the terminal', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      ref.current?.fit();
      expect(mockFitAddon.fit).toHaveBeenCalled();
    });

    it('getDimensions returns current cols/rows', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      const dims = ref.current?.getDimensions();
      expect(dims).toEqual({ cols: 80, rows: 24 });
    });

    it('reset resets the terminal', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      ref.current?.reset();
      expect(mockTerminal.reset).toHaveBeenCalled();
    });

    it('scrollToBottom scrolls to bottom', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      ref.current?.scrollToBottom();
      expect(mockTerminal.scrollToBottom).toHaveBeenCalled();
    });

    it('handles methods called before init gracefully', () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      // Call before async init completes — should not throw
      expect(() => ref.current?.write('test')).not.toThrow();
      expect(() => ref.current?.clear()).not.toThrow();
      expect(() => ref.current?.focus()).not.toThrow();
      expect(ref.current?.getDimensions()).toBeNull();
    });
  });

  it('merges className', () => {
    render(<Terminal className="custom-terminal" />);
    expect(screen.getByTestId('terminal')).toHaveClass('custom-terminal');
  });

  it('disposes terminal and addons on unmount', async () => {
    const { unmount } = render(<Terminal />);
    await waitForInit();
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
    expect(mockTerminal.dispose).toHaveBeenCalled();
  });

  it('handles debounced fit on resize', async () => {
    vi.useFakeTimers();
    render(<Terminal />);

    // Wait for init with real timers briefly
    vi.useRealTimers();
    await waitForInit();
    vi.useFakeTimers();

    // Clear fit calls from init
    mockFitAddon.fit.mockClear();

    // Trigger resize
    resizeCallback?.();
    resizeCallback?.();
    resizeCallback?.();

    // Should not have called fit yet (debounced)
    expect(mockFitAddon.fit).not.toHaveBeenCalled();

    // Advance past debounce period
    vi.advanceTimersByTime(15);
    expect(mockFitAddon.fit).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('passes mac-specific options', async () => {
    const { Terminal: MockTerminal } = await import('@xterm/xterm');
    render(<Terminal macOptionIsMeta macOptionClickForcesSelection />);
    await waitForInit();
    expect(MockTerminal).toHaveBeenCalledWith(
      expect.objectContaining({
        macOptionIsMeta: true,
        macOptionClickForcesSelection: true,
      }),
    );
  });

  it('passes scrollback option', async () => {
    const { Terminal: MockTerminal } = await import('@xterm/xterm');
    render(<Terminal scrollback={10000} />);
    await waitForInit();
    expect(MockTerminal).toHaveBeenCalledWith(
      expect.objectContaining({
        scrollback: 10000,
      }),
    );
  });
});
