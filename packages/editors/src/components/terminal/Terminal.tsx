import '@xterm/xterm/css/xterm.css';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { useEditorTheme } from '../../themes/useEditorTheme';
import { buildXtermTheme } from '../../themes/xterm';
import styles from './Terminal.module.css';

/**
 * Signal types matching the Omniview plugin SDK's StreamSignal enum.
 * These map 1:1 to `core/exec/signal/{SIGNAL}/{sessionId}` Wails events.
 */
export type TerminalSignal =
  | 'ERROR'
  | 'CLOSE'
  | 'SIGINT'
  | 'SIGQUIT'
  | 'SIGTERM'
  | 'SIGKILL'
  | 'SIGHUP'
  | 'SIGUSR1'
  | 'SIGUSR2'
  | 'SIGWINCH';

/**
 * Structured error payload from the plugin SDK's StreamError.
 * Received with the 'ERROR' signal when a session encounters an error.
 */
export interface TerminalErrorInfo {
  /** Short error title for display. */
  title: string;
  /** Suggested resolution or next step. */
  suggestion: string;
  /** Raw error message for debugging. */
  raw: string;
  /** Whether the session can be retried. */
  retryable?: boolean;
  /** Alternative commands to try (e.g., different shells). */
  retryCommands?: string[];
}

/** Options for terminal search operations. */
export interface TerminalSearchOptions {
  /** Whether the search should be case-sensitive. */
  caseSensitive?: boolean;
  /** Whether the search should match whole words only. */
  wholeWord?: boolean;
  /** Whether the search term is a regex. */
  regex?: boolean;
  /** Whether to search incrementally (highlight as you type). */
  incremental?: boolean;
}

export interface TerminalProps {
  // ── Session / data callbacks ──────────────────────────────────────────

  /** Called when user types input. Wire to `ExecClient.WriteSession(sessionId, data)`. */
  onData?: (data: string) => void;
  /** Called when user pastes binary data. */
  onBinaryData?: (data: string) => void;
  /** Called on terminal resize with new dimensions. Wire to `ExecClient.ResizeSession(sessionId, rows, cols)`. */
  onResize?: (cols: number, rows: number) => void;
  /** Called when a signal is received (for exec plugin integration). */
  onSignal?: (signal: TerminalSignal, payload?: unknown) => void;
  /** Called when the terminal init encounters an error (e.g., failed to load xterm). */
  onError?: (error: Error) => void;
  /** Called when the terminal session closes. */
  onClose?: (code?: number) => void;
  /**
   * Called once when the terminal is fully initialized and ready to accept writes.
   * This is the right time to attach to a session and start writing data.
   * Receives the current dimensions so the consumer can send an initial resize.
   */
  onReady?: (dimensions: { cols: number; rows: number }) => void;

  // ── xterm event callbacks ─────────────────────────────────────────────

  /** Called when the terminal bell is triggered. */
  onBell?: () => void;
  /** Called when the terminal title changes (via escape sequence). */
  onTitleChange?: (title: string) => void;
  /** Called on each keypress with the key and DOM event. */
  onKey?: (event: { key: string; domEvent: KeyboardEvent }) => void;
  /** Called when the text selection changes. */
  onSelectionChange?: () => void;
  /** Called on each line feed. */
  onLineFeed?: () => void;
  /** Called when the viewport scrolls. */
  onScroll?: (newPosition: number) => void;
  /**
   * Called after write data has been parsed (at most once per animation frame).
   * Useful as a "render complete" signal for high-throughput output.
   */
  onWriteParsed?: () => void;

  // ── Appearance ────────────────────────────────────────────────────────

  /** Font size in pixels. */
  fontSize?: number;
  /** Font family override. */
  fontFamily?: string;
  /** Font weight ('normal', 'bold', '100'-'900'). */
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  /** Font weight for bold text. */
  fontWeightBold?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  /** Enable cursor blink. */
  cursorBlink?: boolean;
  /** Cursor style. */
  cursorStyle?: 'block' | 'underline' | 'bar';
  /** Width of the cursor in CSS pixels (only applies to bar cursor). */
  cursorWidth?: number;
  /** Line height multiplier. */
  lineHeight?: number;
  /** Letter spacing in pixels. */
  letterSpacing?: number;
  /** Whether to draw bold text in bright colors. */
  drawBoldTextInBrightColors?: boolean;

  // ── Behavior ──────────────────────────────────────────────────────────

  /** Maximum scrollback buffer lines. 0 = unlimited. */
  scrollback?: number;
  /** Convert \n to \r\n for proper line endings. */
  convertEol?: boolean;
  /** Allow transparent background. */
  allowTransparency?: boolean;
  /** Treat macOS Option key as Meta (for proper Alt-key sequences). */
  macOptionIsMeta?: boolean;
  /** Allow macOS Option+Click to force selection. */
  macOptionClickForcesSelection?: boolean;
  /** Enable clickable URLs in terminal output. */
  linkHandling?: boolean;
  /** Disable user input (read-only / log-viewer mode). */
  disableStdin?: boolean;
  /** Intercept key events before xterm processes them. Return false to prevent default handling. */
  customKeyEventHandler?: (event: KeyboardEvent) => boolean;
  /** Auto-focus the terminal after initialization. */
  autoFocus?: boolean;

  // ── Rendering ─────────────────────────────────────────────────────────

  /** Renderer to use. 'auto' tries WebGL then falls back to DOM. */
  renderer?: 'auto' | 'webgl' | 'dom';
  /** Initial number of rows before fit. */
  rows?: number;
  /** Initial number of columns before fit. */
  cols?: number;

  // ── Accessibility ─────────────────────────────────────────────────────

  /** Enable screen reader mode for accessibility. */
  screenReaderMode?: boolean;
  /** Minimum contrast ratio for text (1-21). */
  minimumContrastRatio?: number;

  // ── Layout ────────────────────────────────────────────────────────────

  /** Custom CSS class. */
  className?: string;
}

export interface TerminalHandle {
  // ── Write ─────────────────────────────────────────────────────────────

  /** Write a string or Uint8Array to the terminal. */
  write: (data: string | Uint8Array) => void;
  /** Write a string followed by a newline. */
  writeln: (data: string) => void;

  // ── Terminal state ────────────────────────────────────────────────────

  /** Clear the terminal viewport and scrollback. */
  clear: () => void;
  /** Focus the terminal. */
  focus: () => void;
  /** Blur (unfocus) the terminal. */
  blur: () => void;
  /** Re-fit the terminal to its container. */
  fit: () => void;
  /** Get the current terminal dimensions, or null if not initialized. */
  getDimensions: () => { cols: number; rows: number } | null;
  /** Reset the terminal (clear + reset state). */
  reset: () => void;

  // ── Search ────────────────────────────────────────────────────────────

  /** Find the next match for a search term. */
  findNext: (term: string, options?: TerminalSearchOptions) => boolean;
  /** Find the previous match for a search term. */
  findPrevious: (term: string, options?: TerminalSearchOptions) => boolean;
  /** Clear search highlights. */
  clearSearch: () => void;

  // ── Selection ─────────────────────────────────────────────────────────

  /** Get the current text selection. */
  getSelection: () => string;
  /** Whether text is currently selected. */
  hasSelection: () => boolean;
  /** Select all terminal content. */
  selectAll: () => void;
  /** Clear the current selection. */
  clearSelection: () => void;

  // ── Scrolling ─────────────────────────────────────────────────────────

  /** Scroll to the bottom of the terminal. */
  scrollToBottom: () => void;
  /** Scroll to a specific line. */
  scrollToLine: (line: number) => void;
  /** Scroll up by N lines. */
  scrollUp: (lines: number) => void;
  /** Scroll down by N lines. */
  scrollDown: (lines: number) => void;

  // ── Clipboard ─────────────────────────────────────────────────────────

  /** Paste data into the terminal. */
  paste: (data: string) => void;

  // ── Buffer ────────────────────────────────────────────────────────────

  /** Get the full buffer content as a string (via SerializeAddon). */
  getBufferContent: () => string;
}

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Simple debounce for resize handlers. Returns a debounced function
 * and a cancel function for cleanup.
 */
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
): { run: (...args: Parameters<T>) => void; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return {
    run: (...args: Parameters<T>) => {
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        fn(...args);
      }, ms);
    },
    cancel: () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
}

/**
 * Production-grade terminal component built on xterm.js 6.
 *
 * Designed for the Omniview IDE bottom-drawer terminal, but usable anywhere.
 * Wire `onData` → `ExecClient.WriteSession` and `onResize` → `ExecClient.ResizeSession`,
 * then write session stdout/stderr to the handle's `write()` method.
 *
 * @example
 * ```tsx
 * const ref = useRef<TerminalHandle>(null);
 *
 * <Terminal
 *   ref={ref}
 *   onReady={({ cols, rows }) => {
 *     attachSession(sessionId);
 *     resizeSession(sessionId, rows, cols);
 *   }}
 *   onData={(data) => writeSession(sessionId, data)}
 *   onResize={(cols, rows) => resizeSession(sessionId, rows, cols)}
 *   autoFocus
 * />
 * ```
 */
export const Terminal = forwardRef<TerminalHandle, TerminalProps>(function Terminal(
  {
    onData,
    onBinaryData,
    onResize,
    onSignal,
    onError,
    onClose,
    onReady,
    onBell,
    onTitleChange,
    onKey,
    onSelectionChange,
    onLineFeed,
    onScroll,
    onWriteParsed,
    fontSize = 13,
    fontFamily,
    fontWeight,
    fontWeightBold,
    scrollback = 5000,
    cursorBlink = true,
    cursorStyle,
    cursorWidth,
    lineHeight,
    letterSpacing,
    drawBoldTextInBrightColors = true,
    convertEol = true,
    allowTransparency = true,
    macOptionIsMeta = true,
    macOptionClickForcesSelection = true,
    linkHandling = true,
    disableStdin,
    customKeyEventHandler,
    autoFocus = false,
    renderer = 'auto',
    rows: initialRows,
    cols: initialCols,
    screenReaderMode,
    minimumContrastRatio,
    className,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<unknown>(null);
  const fitAddonRef = useRef<unknown>(null);
  const searchAddonRef = useRef<unknown>(null);
  const serializeAddonRef = useRef<unknown>(null);
  const addonsRef = useRef<Array<{ dispose: () => void }>>([]);
  const observerRef = useRef<ResizeObserver | null>(null);
  const debouncedFitRef = useRef<{ run: () => void; cancel: () => void } | null>(null);
  const theme = useEditorTheme();

  // Stable refs for callbacks to avoid re-initializing terminal
  const callbacksRef = useRef({
    onData, onBinaryData, onResize, onSignal, onError, onClose, onReady,
    onBell, onTitleChange, onKey, onSelectionChange, onLineFeed, onScroll, onWriteParsed,
  });
  callbacksRef.current = {
    onData, onBinaryData, onResize, onSignal, onError, onClose, onReady,
    onBell, onTitleChange, onKey, onSelectionChange, onLineFeed, onScroll, onWriteParsed,
  };

  const fit = useCallback(() => {
    try {
      const addon = fitAddonRef.current as { fit?: () => void } | null;
      addon?.fit?.();
    } catch {
      // fit() can throw if container has zero dimensions (e.g., hidden tab)
    }
  }, []);

  useImperativeHandle(ref, () => ({
    write: (data: string | Uint8Array) => {
      const t = termRef.current as { write?: (d: string | Uint8Array) => void } | null;
      t?.write?.(data);
    },
    writeln: (data: string) => {
      const t = termRef.current as { writeln?: (d: string) => void } | null;
      t?.writeln?.(data);
    },
    clear: () => {
      const t = termRef.current as { clear?: () => void } | null;
      t?.clear?.();
    },
    focus: () => {
      const t = termRef.current as { focus?: () => void } | null;
      t?.focus?.();
    },
    blur: () => {
      const t = termRef.current as { blur?: () => void } | null;
      t?.blur?.();
    },
    fit,
    getDimensions: () => {
      const t = termRef.current as { cols?: number; rows?: number } | null;
      if (t && typeof t.cols === 'number' && typeof t.rows === 'number') {
        return { cols: t.cols, rows: t.rows };
      }
      return null;
    },
    reset: () => {
      const t = termRef.current as { reset?: () => void } | null;
      t?.reset?.();
    },
    scrollToBottom: () => {
      const t = termRef.current as { scrollToBottom?: () => void } | null;
      t?.scrollToBottom?.();
    },
    findNext: (term: string, options?: TerminalSearchOptions): boolean => {
      const s = searchAddonRef.current as { findNext?: (t: string, o?: TerminalSearchOptions) => boolean } | null;
      return s?.findNext?.(term, options) ?? false;
    },
    findPrevious: (term: string, options?: TerminalSearchOptions): boolean => {
      const s = searchAddonRef.current as { findPrevious?: (t: string, o?: TerminalSearchOptions) => boolean } | null;
      return s?.findPrevious?.(term, options) ?? false;
    },
    clearSearch: () => {
      const s = searchAddonRef.current as { clearDecorations?: () => void } | null;
      s?.clearDecorations?.();
    },
    getSelection: (): string => {
      const t = termRef.current as { getSelection?: () => string } | null;
      return t?.getSelection?.() ?? '';
    },
    hasSelection: (): boolean => {
      const t = termRef.current as { hasSelection?: () => boolean } | null;
      return t?.hasSelection?.() ?? false;
    },
    selectAll: () => {
      const t = termRef.current as { selectAll?: () => void } | null;
      t?.selectAll?.();
    },
    clearSelection: () => {
      const t = termRef.current as { clearSelection?: () => void } | null;
      t?.clearSelection?.();
    },
    scrollToLine: (line: number) => {
      const t = termRef.current as { scrollToLine?: (l: number) => void } | null;
      t?.scrollToLine?.(line);
    },
    scrollUp: (lines: number) => {
      const t = termRef.current as { scrollLines?: (l: number) => void } | null;
      t?.scrollLines?.(-lines);
    },
    scrollDown: (lines: number) => {
      const t = termRef.current as { scrollLines?: (l: number) => void } | null;
      t?.scrollLines?.(lines);
    },
    paste: (data: string) => {
      const t = termRef.current as { paste?: (d: string) => void } | null;
      t?.paste?.(data);
    },
    getBufferContent: (): string => {
      const s = serializeAddonRef.current as { serialize?: () => string } | null;
      return s?.serialize?.() ?? '';
    },
  }));

  // Initialize xterm lazily
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;

    async function init() {
      // Wait for fonts to be ready to prevent wrong char width measurements
      await document.fonts.ready;

      const [{ Terminal: XTerminal }, { FitAddon }, { SearchAddon }, { SerializeAddon }, { Unicode11Addon }] =
        await Promise.all([
          import('@xterm/xterm'),
          import('@xterm/addon-fit'),
          import('@xterm/addon-search'),
          import('@xterm/addon-serialize'),
          import('@xterm/addon-unicode11'),
        ]);

      if (disposed) return;

      const xtermTheme = buildXtermTheme();
      const termOptions: Record<string, unknown> = {
        fontSize,
        fontFamily: fontFamily || "'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace",
        theme: xtermTheme,
        allowTransparency,
        cursorBlink,
        convertEol,
        scrollback,
        macOptionIsMeta,
        macOptionClickForcesSelection,
        allowProposedApi: true,
        drawBoldTextInBrightColors,
      };

      if (fontWeight !== undefined) termOptions.fontWeight = fontWeight;
      if (fontWeightBold !== undefined) termOptions.fontWeightBold = fontWeightBold;
      if (disableStdin !== undefined) termOptions.disableStdin = disableStdin;
      if (cursorStyle !== undefined) termOptions.cursorStyle = cursorStyle;
      if (cursorWidth !== undefined) termOptions.cursorWidth = cursorWidth;
      if (lineHeight !== undefined) termOptions.lineHeight = lineHeight;
      if (letterSpacing !== undefined) termOptions.letterSpacing = letterSpacing;
      if (initialRows !== undefined) termOptions.rows = initialRows;
      if (initialCols !== undefined) termOptions.cols = initialCols;
      if (screenReaderMode !== undefined) termOptions.screenReaderMode = screenReaderMode;
      if (minimumContrastRatio !== undefined) termOptions.minimumContrastRatio = minimumContrastRatio;

      const term = new XTerminal(termOptions);

      if (customKeyEventHandler) {
        (term as unknown as { attachCustomKeyEventHandler: (h: (e: KeyboardEvent) => boolean) => void })
          .attachCustomKeyEventHandler(customKeyEventHandler);
      }

      const loadedAddons: Array<{ dispose: () => void }> = [];

      const fitAddon = new FitAddon();
      const searchAddon = new SearchAddon();
      const serializeAddon = new SerializeAddon();
      const unicode11Addon = new Unicode11Addon();
      term.loadAddon(fitAddon);
      term.loadAddon(searchAddon);
      term.loadAddon(serializeAddon);
      term.loadAddon(unicode11Addon);
      loadedAddons.push(fitAddon, searchAddon, serializeAddon, unicode11Addon);

      // Activate unicode11 for proper emoji/CJK width
      (term as unknown as { unicode: { activeVersion: string } }).unicode.activeVersion = '11';

      // Load web links addon for clickable URLs
      if (linkHandling) {
        try {
          const { WebLinksAddon } = await import('@xterm/addon-web-links');
          if (!disposed) {
            const webLinksAddon = new WebLinksAddon();
            term.loadAddon(webLinksAddon);
            loadedAddons.push(webLinksAddon);
          }
        } catch {
          // Web links addon not available, non-critical
        }
      }

      if (disposed) {
        term.dispose();
        return;
      }

      // Open terminal in container
      term.open(container!);

      // Load renderer based on prop
      if (renderer === 'auto' || renderer === 'webgl') {
        try {
          const { WebglAddon } = await import('@xterm/addon-webgl');
          if (!disposed) {
            const webglAddon = new WebglAddon();
            webglAddon.onContextLoss(() => {
              webglAddon.dispose();
            });
            term.loadAddon(webglAddon);
            loadedAddons.push(webglAddon);
          }
        } catch {
          // WebGL not available, DOM renderer is used as fallback
        }
      }
      // renderer === 'dom' — no extra addon needed

      if (disposed) {
        for (const addon of loadedAddons) {
          try {
            addon.dispose();
          } catch {
            // ignore
          }
        }
        term.dispose();
        return;
      }

      // Initial fit
      fitAddon.fit();

      // Store refs
      termRef.current = term;
      fitAddonRef.current = fitAddon;
      searchAddonRef.current = searchAddon;
      serializeAddonRef.current = serializeAddon;
      addonsRef.current = loadedAddons;

      // Wire up callbacks via stable refs
      term.onData((data: string) => {
        callbacksRef.current.onData?.(data);
      });

      term.onBinary((data: string) => {
        callbacksRef.current.onBinaryData?.(data);
      });

      term.onResize(({ cols, rows }: { cols: number; rows: number }) => {
        callbacksRef.current.onResize?.(cols, rows);
      });

      (term as unknown as { onBell: (cb: () => void) => void }).onBell(() => {
        callbacksRef.current.onBell?.();
      });

      (term as unknown as { onTitleChange: (cb: (t: string) => void) => void }).onTitleChange(
        (title: string) => {
          callbacksRef.current.onTitleChange?.(title);
        },
      );

      (term as unknown as { onKey: (cb: (e: { key: string; domEvent: KeyboardEvent }) => void) => void }).onKey(
        (event: { key: string; domEvent: KeyboardEvent }) => {
          callbacksRef.current.onKey?.(event);
        },
      );

      (term as unknown as { onSelectionChange: (cb: () => void) => void }).onSelectionChange(() => {
        callbacksRef.current.onSelectionChange?.();
      });

      (term as unknown as { onLineFeed: (cb: () => void) => void }).onLineFeed(() => {
        callbacksRef.current.onLineFeed?.();
      });

      (term as unknown as { onScroll: (cb: (p: number) => void) => void }).onScroll((pos: number) => {
        callbacksRef.current.onScroll?.(pos);
      });

      (term as unknown as { onWriteParsed: (cb: () => void) => void }).onWriteParsed(() => {
        callbacksRef.current.onWriteParsed?.();
      });

      // Debounced fit for resize handling (10ms debounce like legacy impl)
      const debouncedFit = debounce(() => {
        try {
          fitAddon.fit();
        } catch {
          // Ignore fit errors (zero-size container, etc.)
        }
      }, 10);
      debouncedFitRef.current = debouncedFit;

      // ResizeObserver for container resize
      const resizeObserver = new ResizeObserver(() => {
        debouncedFit.run();
      });
      resizeObserver.observe(container!);
      observerRef.current = resizeObserver;

      // Window resize handler as additional safety
      const handleWindowResize = () => {
        debouncedFit.run();
      };
      window.addEventListener('resize', handleWindowResize);

      // Store window resize cleanup
      (container as HTMLDivElement & { __windowResizeCleanup?: () => void }).__windowResizeCleanup =
        () => {
          window.removeEventListener('resize', handleWindowResize);
        };

      // Auto-focus if requested
      if (autoFocus) {
        term.focus();
      }

      // Notify consumer that the terminal is ready
      callbacksRef.current.onReady?.({ cols: term.cols, rows: term.rows });
    }

    init().catch((err) => {
      callbacksRef.current.onError?.(err instanceof Error ? err : new Error(String(err)));
    });

    return () => {
      disposed = true;

      // Cancel pending debounced fit
      debouncedFitRef.current?.cancel();
      debouncedFitRef.current = null;

      // Disconnect resize observer
      observerRef.current?.disconnect();
      observerRef.current = null;

      // Remove window resize listener
      const windowCleanup = (container as HTMLDivElement & { __windowResizeCleanup?: () => void })
        .__windowResizeCleanup;
      windowCleanup?.();

      // Dispose addons first, then terminal (proper order)
      for (const addon of addonsRef.current) {
        try {
          addon.dispose();
        } catch {
          // ignore addon disposal errors
        }
      }
      addonsRef.current = [];

      // Dispose terminal
      const term = termRef.current as { dispose?: () => void } | null;
      try {
        term?.dispose?.();
      } catch {
        // ignore terminal disposal errors
      }

      termRef.current = null;
      fitAddonRef.current = null;
      searchAddonRef.current = null;
      serializeAddonRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update theme dynamically without recreating terminal
  useEffect(() => {
    const term = termRef.current as { options?: { theme: unknown } } | null;
    if (term?.options) {
      term.options.theme = buildXtermTheme();
    }
  }, [theme]);

  // Update font size dynamically
  useEffect(() => {
    const term = termRef.current as { options?: { fontSize: number } } | null;
    if (term?.options) {
      term.options.fontSize = fontSize;
      debouncedFitRef.current?.run();
    }
  }, [fontSize]);

  // Update dynamically updatable options
  useEffect(() => {
    const term = termRef.current as { options?: Record<string, unknown> } | null;
    if (!term?.options) return;
    if (cursorBlink !== undefined) term.options.cursorBlink = cursorBlink;
  }, [cursorBlink]);

  useEffect(() => {
    const term = termRef.current as { options?: Record<string, unknown> } | null;
    if (!term?.options) return;
    if (cursorStyle !== undefined) term.options.cursorStyle = cursorStyle;
  }, [cursorStyle]);

  useEffect(() => {
    const term = termRef.current as { options?: Record<string, unknown> } | null;
    if (!term?.options) return;
    if (scrollback !== undefined) term.options.scrollback = scrollback;
  }, [scrollback]);

  useEffect(() => {
    const term = termRef.current as { options?: Record<string, unknown> } | null;
    if (!term?.options) return;
    if (lineHeight !== undefined) {
      term.options.lineHeight = lineHeight;
      debouncedFitRef.current?.run();
    }
  }, [lineHeight]);

  useEffect(() => {
    const term = termRef.current as { options?: Record<string, unknown> } | null;
    if (!term?.options) return;
    if (letterSpacing !== undefined) {
      term.options.letterSpacing = letterSpacing;
      debouncedFitRef.current?.run();
    }
  }, [letterSpacing]);

  return <div ref={containerRef} className={cn(styles.Root, className)} data-testid="terminal" />;
});

Terminal.displayName = 'Terminal';
