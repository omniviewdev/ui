import { render, screen, act } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Terminal, type TerminalHandle } from './Terminal';

// Mock xterm modules
const mockOnData = vi.fn();
const mockOnBinary = vi.fn();
const mockOnResize = vi.fn();
const mockOnBell = vi.fn();
const mockOnTitleChange = vi.fn();
const mockOnKey = vi.fn();
const mockOnSelectionChange = vi.fn();
const mockOnLineFeed = vi.fn();
const mockOnScroll = vi.fn();
const mockOnWriteParsed = vi.fn();

const mockTerminal = {
  open: vi.fn(),
  dispose: vi.fn(),
  loadAddon: vi.fn(),
  attachCustomKeyEventHandler: vi.fn(),
  onData: vi.fn((cb) => {
    mockOnData.mockImplementation(cb);
  }),
  onBinary: vi.fn((cb) => {
    mockOnBinary.mockImplementation(cb);
  }),
  onResize: vi.fn((cb) => {
    mockOnResize.mockImplementation(cb);
  }),
  onBell: vi.fn((cb) => {
    mockOnBell.mockImplementation(cb);
  }),
  onTitleChange: vi.fn((cb) => {
    mockOnTitleChange.mockImplementation(cb);
  }),
  onKey: vi.fn((cb) => {
    mockOnKey.mockImplementation(cb);
  }),
  onSelectionChange: vi.fn((cb) => {
    mockOnSelectionChange.mockImplementation(cb);
  }),
  onLineFeed: vi.fn((cb) => {
    mockOnLineFeed.mockImplementation(cb);
  }),
  onScroll: vi.fn((cb) => {
    mockOnScroll.mockImplementation(cb);
  }),
  onWriteParsed: vi.fn((cb) => {
    mockOnWriteParsed.mockImplementation(cb);
  }),
  write: vi.fn(),
  writeln: vi.fn(),
  clear: vi.fn(),
  focus: vi.fn(),
  blur: vi.fn(),
  reset: vi.fn(),
  scrollToBottom: vi.fn(),
  getSelection: vi.fn(() => 'selected-text'),
  hasSelection: vi.fn(() => true),
  selectAll: vi.fn(),
  clearSelection: vi.fn(),
  scrollToLine: vi.fn(),
  scrollLines: vi.fn(),
  paste: vi.fn(),
  cols: 80,
  rows: 24,
  options: {} as Record<string, unknown>,
  unicode: { activeVersion: '6' },
};

const mockFitAddon = {
  fit: vi.fn(),
  dispose: vi.fn(),
};

const mockSearchAddon = {
  findNext: vi.fn(() => true),
  findPrevious: vi.fn(() => true),
  clearDecorations: vi.fn(),
  dispose: vi.fn(),
};

const mockSerializeAddon = {
  serialize: vi.fn(() => 'buffer-content'),
  dispose: vi.fn(),
};

const mockUnicode11Addon = {
  dispose: vi.fn(),
};

const mockWebglAddon = {
  onContextLoss: vi.fn(),
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

vi.mock('@xterm/addon-serialize', () => ({
  SerializeAddon: vi.fn(() => mockSerializeAddon),
}));

vi.mock('@xterm/addon-unicode11', () => ({
  Unicode11Addon: vi.fn(() => mockUnicode11Addon),
}));

vi.mock('@xterm/addon-webgl', () => ({
  WebglAddon: vi.fn(() => mockWebglAddon),
}));

vi.mock('@xterm/addon-web-links', () => ({
  WebLinksAddon: vi.fn(() => mockWebLinksAddon),
}));

// Mock document.fonts.ready
Object.defineProperty(document, 'fonts', {
  value: { ready: Promise.resolve() },
  writable: true,
});

// Mock ResizeObserver
let resizeCallback: (() => void) | null = null;
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  resizeCallback = null;
  mockTerminal.unicode.activeVersion = '6';
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

  it('loads fit, search, serialize, and unicode11 addons', async () => {
    render(<Terminal />);
    await waitForInit();
    expect(mockTerminal.loadAddon).toHaveBeenCalledWith(mockFitAddon);
    expect(mockTerminal.loadAddon).toHaveBeenCalledWith(mockSearchAddon);
    expect(mockTerminal.loadAddon).toHaveBeenCalledWith(mockSerializeAddon);
    expect(mockTerminal.loadAddon).toHaveBeenCalledWith(mockUnicode11Addon);
  });

  it('activates unicode 11', async () => {
    render(<Terminal />);
    await waitForInit();
    expect(mockTerminal.unicode.activeVersion).toBe('11');
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

  it('calls onBell through stable ref', async () => {
    const onBell = vi.fn();
    render(<Terminal onBell={onBell} />);
    await waitForInit();
    expect(mockTerminal.onBell).toHaveBeenCalled();
    mockOnBell();
    expect(onBell).toHaveBeenCalled();
  });

  it('calls onTitleChange through stable ref', async () => {
    const onTitleChange = vi.fn();
    render(<Terminal onTitleChange={onTitleChange} />);
    await waitForInit();
    expect(mockTerminal.onTitleChange).toHaveBeenCalled();
    mockOnTitleChange('new-title');
    expect(onTitleChange).toHaveBeenCalledWith('new-title');
  });

  it('calls onKey through stable ref', async () => {
    const onKey = vi.fn();
    render(<Terminal onKey={onKey} />);
    await waitForInit();
    expect(mockTerminal.onKey).toHaveBeenCalled();
    const event = { key: 'a', domEvent: new KeyboardEvent('keydown') };
    mockOnKey(event);
    expect(onKey).toHaveBeenCalledWith(event);
  });

  it('calls onSelectionChange through stable ref', async () => {
    const onSelectionChange = vi.fn();
    render(<Terminal onSelectionChange={onSelectionChange} />);
    await waitForInit();
    expect(mockTerminal.onSelectionChange).toHaveBeenCalled();
    mockOnSelectionChange();
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('calls onLineFeed through stable ref', async () => {
    const onLineFeed = vi.fn();
    render(<Terminal onLineFeed={onLineFeed} />);
    await waitForInit();
    expect(mockTerminal.onLineFeed).toHaveBeenCalled();
    mockOnLineFeed();
    expect(onLineFeed).toHaveBeenCalled();
  });

  it('calls onScroll through stable ref', async () => {
    const onScroll = vi.fn();
    render(<Terminal onScroll={onScroll} />);
    await waitForInit();
    expect(mockTerminal.onScroll).toHaveBeenCalled();
    mockOnScroll(42);
    expect(onScroll).toHaveBeenCalledWith(42);
  });

  it('handles WebGL context loss gracefully', async () => {
    render(<Terminal />);
    await waitForInit();
    expect(mockWebglAddon.onContextLoss).toHaveBeenCalled();
    const contextLossHandler = mockWebglAddon.onContextLoss.mock.calls[0]?.[0] as () => void;
    contextLossHandler();
    expect(mockWebglAddon.dispose).toHaveBeenCalled();
  });

  it('passes disableStdin to xterm constructor', async () => {
    const { Terminal: MockTerminal } = await import('@xterm/xterm');
    render(<Terminal disableStdin />);
    await waitForInit();
    expect(MockTerminal).toHaveBeenCalledWith(
      expect.objectContaining({ disableStdin: true }),
    );
  });

  it('passes cursorStyle to xterm constructor', async () => {
    const { Terminal: MockTerminal } = await import('@xterm/xterm');
    render(<Terminal cursorStyle="underline" />);
    await waitForInit();
    expect(MockTerminal).toHaveBeenCalledWith(
      expect.objectContaining({ cursorStyle: 'underline' }),
    );
  });

  it('attaches customKeyEventHandler', async () => {
    const handler = vi.fn(() => true);
    render(<Terminal customKeyEventHandler={handler} />);
    await waitForInit();
    expect(mockTerminal.attachCustomKeyEventHandler).toHaveBeenCalledWith(handler);
  });

  describe('renderer prop', () => {
    it('loads WebGL by default (auto)', async () => {
      render(<Terminal />);
      await waitForInit();
      expect(mockTerminal.loadAddon).toHaveBeenCalledWith(mockWebglAddon);
    });

    it('renderer="dom" skips WebGL', async () => {
      const { WebglAddon } = await import('@xterm/addon-webgl');
      (WebglAddon as unknown as ReturnType<typeof vi.fn>).mockClear();
      render(<Terminal renderer="dom" />);
      await waitForInit();
      expect(WebglAddon).not.toHaveBeenCalled();
    });
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

    it('findNext proxies to SearchAddon', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      const result = ref.current?.findNext('test', { caseSensitive: true });
      expect(mockSearchAddon.findNext).toHaveBeenCalledWith('test', { caseSensitive: true });
      expect(result).toBe(true);
    });

    it('findPrevious proxies to SearchAddon', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      const result = ref.current?.findPrevious('test');
      expect(mockSearchAddon.findPrevious).toHaveBeenCalledWith('test', undefined);
      expect(result).toBe(true);
    });

    it('clearSearch proxies to SearchAddon.clearDecorations', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      ref.current?.clearSearch();
      expect(mockSearchAddon.clearDecorations).toHaveBeenCalled();
    });

    it('getSelection returns selected text', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      expect(ref.current?.getSelection()).toBe('selected-text');
    });

    it('hasSelection returns true when selection exists', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      expect(ref.current?.hasSelection()).toBe(true);
    });

    it('selectAll selects all content', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      ref.current?.selectAll();
      expect(mockTerminal.selectAll).toHaveBeenCalled();
    });

    it('clearSelection clears selection', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      ref.current?.clearSelection();
      expect(mockTerminal.clearSelection).toHaveBeenCalled();
    });

    it('scrollToLine scrolls to specific line', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      ref.current?.scrollToLine(50);
      expect(mockTerminal.scrollToLine).toHaveBeenCalledWith(50);
    });

    it('scrollUp scrolls up by N lines', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      ref.current?.scrollUp(5);
      expect(mockTerminal.scrollLines).toHaveBeenCalledWith(-5);
    });

    it('scrollDown scrolls down by N lines', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      ref.current?.scrollDown(3);
      expect(mockTerminal.scrollLines).toHaveBeenCalledWith(3);
    });

    it('paste pastes data into terminal', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      ref.current?.paste('pasted text');
      expect(mockTerminal.paste).toHaveBeenCalledWith('pasted text');
    });

    it('getBufferContent returns serialized buffer', async () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      await waitForInit();
      expect(ref.current?.getBufferContent()).toBe('buffer-content');
      expect(mockSerializeAddon.serialize).toHaveBeenCalled();
    });

    it('handles methods called before init gracefully', () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      // Call before async init completes — should not throw
      expect(() => ref.current?.write('test')).not.toThrow();
      expect(() => ref.current?.clear()).not.toThrow();
      expect(() => ref.current?.focus()).not.toThrow();
      expect(() => ref.current?.blur()).not.toThrow();
      expect(ref.current?.getDimensions()).toBeNull();
      expect(ref.current?.findNext('test')).toBe(false);
      expect(ref.current?.findPrevious('test')).toBe(false);
      expect(() => ref.current?.clearSearch()).not.toThrow();
      expect(ref.current?.getSelection()).toBe('');
      expect(ref.current?.hasSelection()).toBe(false);
      expect(() => ref.current?.selectAll()).not.toThrow();
      expect(() => ref.current?.clearSelection()).not.toThrow();
      expect(() => ref.current?.scrollToLine(0)).not.toThrow();
      expect(() => ref.current?.scrollUp(1)).not.toThrow();
      expect(() => ref.current?.scrollDown(1)).not.toThrow();
      expect(() => ref.current?.paste('text')).not.toThrow();
      expect(ref.current?.getBufferContent()).toBe('');
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

  it('calls onReady with dimensions after init', async () => {
    const onReady = vi.fn();
    render(<Terminal onReady={onReady} />);
    await waitForInit();
    expect(onReady).toHaveBeenCalledWith({ cols: 80, rows: 24 });
  });

  it('auto-focuses when autoFocus is true', async () => {
    mockTerminal.focus.mockClear();
    render(<Terminal autoFocus />);
    await waitForInit();
    expect(mockTerminal.focus).toHaveBeenCalled();
  });

  it('does not auto-focus by default', async () => {
    mockTerminal.focus.mockClear();
    render(<Terminal />);
    await waitForInit();
    expect(mockTerminal.focus).not.toHaveBeenCalled();
  });

  it('passes fontWeight to xterm constructor', async () => {
    const { Terminal: MockTerminal } = await import('@xterm/xterm');
    render(<Terminal fontWeight="normal" />);
    await waitForInit();
    expect(MockTerminal).toHaveBeenCalledWith(
      expect.objectContaining({ fontWeight: 'normal' }),
    );
  });

  it('passes fontWeightBold to xterm constructor', async () => {
    const { Terminal: MockTerminal } = await import('@xterm/xterm');
    render(<Terminal fontWeightBold="bold" />);
    await waitForInit();
    expect(MockTerminal).toHaveBeenCalledWith(
      expect.objectContaining({ fontWeightBold: 'bold' }),
    );
  });

  it('calls onWriteParsed through stable ref', async () => {
    const onWriteParsed = vi.fn();
    render(<Terminal onWriteParsed={onWriteParsed} />);
    await waitForInit();
    expect(mockTerminal.onWriteParsed).toHaveBeenCalled();
    mockOnWriteParsed();
    expect(onWriteParsed).toHaveBeenCalled();
  });

  it('blur handle method blurs the terminal', async () => {
    const ref = createRef<TerminalHandle>();
    render(<Terminal ref={ref} />);
    await waitForInit();
    ref.current?.blur();
    expect(mockTerminal.blur).toHaveBeenCalled();
  });

  describe('dynamic option updates', () => {
    it('updates fontSize dynamically and triggers fit', async () => {
      vi.useFakeTimers();
      const { rerender } = render(<Terminal fontSize={13} />);
      vi.useRealTimers();
      await waitForInit();
      vi.useFakeTimers();

      mockTerminal.options = {} as Record<string, unknown>;
      mockFitAddon.fit.mockClear();

      rerender(<Terminal fontSize={16} />);

      expect(mockTerminal.options.fontSize).toBe(16);
      // Fit is debounced — advance timer
      vi.advanceTimersByTime(15);
      expect(mockFitAddon.fit).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('updates cursorBlink dynamically', async () => {
      const { rerender } = render(<Terminal cursorBlink />);
      await waitForInit();
      mockTerminal.options = {} as Record<string, unknown>;

      rerender(<Terminal cursorBlink={false} />);
      expect(mockTerminal.options.cursorBlink).toBe(false);
    });

    it('updates cursorStyle dynamically', async () => {
      const { rerender } = render(<Terminal cursorStyle="block" />);
      await waitForInit();
      mockTerminal.options = {} as Record<string, unknown>;

      rerender(<Terminal cursorStyle="bar" />);
      expect(mockTerminal.options.cursorStyle).toBe('bar');
    });

    it('updates scrollback dynamically', async () => {
      const { rerender } = render(<Terminal scrollback={5000} />);
      await waitForInit();
      mockTerminal.options = {} as Record<string, unknown>;

      rerender(<Terminal scrollback={10000} />);
      expect(mockTerminal.options.scrollback).toBe(10000);
    });

    it('updates lineHeight dynamically and triggers fit', async () => {
      vi.useFakeTimers();
      const { rerender } = render(<Terminal lineHeight={1.0} />);
      vi.useRealTimers();
      await waitForInit();
      vi.useFakeTimers();

      mockTerminal.options = {} as Record<string, unknown>;
      mockFitAddon.fit.mockClear();

      rerender(<Terminal lineHeight={1.5} />);
      expect(mockTerminal.options.lineHeight).toBe(1.5);
      vi.advanceTimersByTime(15);
      expect(mockFitAddon.fit).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('updates letterSpacing dynamically and triggers fit', async () => {
      vi.useFakeTimers();
      const { rerender } = render(<Terminal letterSpacing={0} />);
      vi.useRealTimers();
      await waitForInit();
      vi.useFakeTimers();

      mockTerminal.options = {} as Record<string, unknown>;
      mockFitAddon.fit.mockClear();

      rerender(<Terminal letterSpacing={2} />);
      expect(mockTerminal.options.letterSpacing).toBe(2);
      vi.advanceTimersByTime(15);
      expect(mockFitAddon.fit).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('constructor options passthrough', () => {
    it('passes lineHeight to constructor', async () => {
      const { Terminal: MockTerminal } = await import('@xterm/xterm');
      render(<Terminal lineHeight={1.2} />);
      await waitForInit();
      expect(MockTerminal).toHaveBeenCalledWith(
        expect.objectContaining({ lineHeight: 1.2 }),
      );
    });

    it('passes letterSpacing to constructor', async () => {
      const { Terminal: MockTerminal } = await import('@xterm/xterm');
      render(<Terminal letterSpacing={1} />);
      await waitForInit();
      expect(MockTerminal).toHaveBeenCalledWith(
        expect.objectContaining({ letterSpacing: 1 }),
      );
    });

    it('passes rows and cols to constructor', async () => {
      const { Terminal: MockTerminal } = await import('@xterm/xterm');
      render(<Terminal rows={30} cols={120} />);
      await waitForInit();
      expect(MockTerminal).toHaveBeenCalledWith(
        expect.objectContaining({ rows: 30, cols: 120 }),
      );
    });

    it('passes screenReaderMode to constructor', async () => {
      const { Terminal: MockTerminal } = await import('@xterm/xterm');
      render(<Terminal screenReaderMode />);
      await waitForInit();
      expect(MockTerminal).toHaveBeenCalledWith(
        expect.objectContaining({ screenReaderMode: true }),
      );
    });

    it('passes minimumContrastRatio to constructor', async () => {
      const { Terminal: MockTerminal } = await import('@xterm/xterm');
      render(<Terminal minimumContrastRatio={4.5} />);
      await waitForInit();
      expect(MockTerminal).toHaveBeenCalledWith(
        expect.objectContaining({ minimumContrastRatio: 4.5 }),
      );
    });

    it('passes drawBoldTextInBrightColors to constructor', async () => {
      const { Terminal: MockTerminal } = await import('@xterm/xterm');
      render(<Terminal drawBoldTextInBrightColors={false} />);
      await waitForInit();
      expect(MockTerminal).toHaveBeenCalledWith(
        expect.objectContaining({ drawBoldTextInBrightColors: false }),
      );
    });
  });

  describe('renderer prop (extended)', () => {
    it('renderer="webgl" explicitly loads WebGL', async () => {
      render(<Terminal renderer="webgl" />);
      await waitForInit();
      expect(mockTerminal.loadAddon).toHaveBeenCalledWith(mockWebglAddon);
    });
  });

  describe('cleanup and lifecycle', () => {
    it('cancels debounced fit on unmount', async () => {
      vi.useFakeTimers();
      const { unmount } = render(<Terminal />);
      vi.useRealTimers();
      await waitForInit();
      vi.useFakeTimers();

      mockFitAddon.fit.mockClear();

      // Trigger a resize but unmount before debounce fires
      resizeCallback?.();
      unmount();

      // Advance timer — fit should NOT fire because debounce was cancelled
      vi.advanceTimersByTime(50);
      expect(mockFitAddon.fit).not.toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('disposes addons before terminal', async () => {
      const disposeOrder: string[] = [];
      mockFitAddon.dispose.mockImplementation(() => disposeOrder.push('fitAddon'));
      mockSearchAddon.dispose.mockImplementation(() => disposeOrder.push('searchAddon'));
      mockSerializeAddon.dispose.mockImplementation(() => disposeOrder.push('serializeAddon'));
      mockUnicode11Addon.dispose.mockImplementation(() => disposeOrder.push('unicode11Addon'));
      mockWebLinksAddon.dispose.mockImplementation(() => disposeOrder.push('webLinksAddon'));
      mockWebglAddon.dispose.mockImplementation(() => disposeOrder.push('webglAddon'));
      mockTerminal.dispose.mockImplementation(() => disposeOrder.push('terminal'));

      const { unmount } = render(<Terminal />);
      await waitForInit();
      unmount();

      // Terminal should be last
      expect(disposeOrder[disposeOrder.length - 1]).toBe('terminal');
      // All addons should come before terminal
      expect(disposeOrder.indexOf('terminal')).toBeGreaterThan(disposeOrder.indexOf('fitAddon'));
      expect(disposeOrder.indexOf('terminal')).toBeGreaterThan(disposeOrder.indexOf('searchAddon'));
    });

    it('disconnects ResizeObserver on unmount', async () => {
      const { unmount } = render(<Terminal />);
      await waitForInit();
      unmount();
      expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });

    it('does not call onReady if unmounted during init', async () => {
      const onReady = vi.fn();
      const { unmount } = render(<Terminal onReady={onReady} />);
      // Unmount immediately before init completes
      unmount();
      await waitForInit();
      expect(onReady).not.toHaveBeenCalled();
    });

    it('calls onError when init fails', async () => {
      // Make the xterm import fail
      const { Terminal: OrigTerminal } = await import('@xterm/xterm');
      (OrigTerminal as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
        throw new Error('WebGL context unavailable');
      });

      const onError = vi.fn();
      render(<Terminal onError={onError} />);
      await waitForInit();
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('resize handling', () => {
    it('handles window resize events', async () => {
      render(<Terminal />);
      await waitForInit();
      mockFitAddon.fit.mockClear();

      // Simulate window resize
      vi.useFakeTimers();
      window.dispatchEvent(new Event('resize'));
      vi.advanceTimersByTime(15);
      expect(mockFitAddon.fit).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('fit handle method does not throw when addon is not loaded', () => {
      const ref = createRef<TerminalHandle>();
      render(<Terminal ref={ref} />);
      // fit before init — should not throw
      expect(() => ref.current?.fit()).not.toThrow();
    });

    it('debounce coalesces rapid resize events into one fit call', async () => {
      vi.useFakeTimers();
      render(<Terminal />);
      vi.useRealTimers();
      await waitForInit();
      vi.useFakeTimers();

      mockFitAddon.fit.mockClear();

      // Fire many rapid resizes
      for (let i = 0; i < 20; i++) {
        resizeCallback?.();
      }

      vi.advanceTimersByTime(15);
      // Should coalesce to exactly 1 call
      expect(mockFitAddon.fit).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });
  });

  describe('onReady ordering', () => {
    it('onReady fires after fitAddon.fit()', async () => {
      const callOrder: string[] = [];
      mockFitAddon.fit.mockImplementation(() => callOrder.push('fit'));
      const onReady = vi.fn(() => callOrder.push('onReady'));

      render(<Terminal onReady={onReady} />);
      await waitForInit();

      const fitIndex = callOrder.indexOf('fit');
      const readyIndex = callOrder.indexOf('onReady');
      expect(fitIndex).toBeGreaterThanOrEqual(0);
      expect(readyIndex).toBeGreaterThan(fitIndex);
    });
  });
});
