import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { useEditorTheme } from '../../themes/useEditorTheme';
import { buildXtermTheme } from '../../themes/xterm';
import styles from './Terminal.module.css';

/** Unix signal types that exec plugins may emit. */
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

export interface TerminalProps {
  /** Called when user types input. */
  onData?: (data: string) => void;
  /** Called when user pastes binary data. */
  onBinaryData?: (data: string) => void;
  /** Called on terminal resize with new dimensions. */
  onResize?: (cols: number, rows: number) => void;
  /** Called when a signal is received (for exec plugin integration). */
  onSignal?: (signal: TerminalSignal, payload?: unknown) => void;
  /** Called when the terminal session encounters an error. */
  onError?: (error: Error) => void;
  /** Called when the terminal session closes. */
  onClose?: (code?: number) => void;
  /** Font size in pixels. */
  fontSize?: number;
  /** Font family override. */
  fontFamily?: string;
  /** Maximum scrollback buffer lines. 0 = unlimited. */
  scrollback?: number;
  /** Enable cursor blink. */
  cursorBlink?: boolean;
  /** Convert \\n to \\r\\n for proper line endings. */
  convertEol?: boolean;
  /** Allow transparent background. */
  allowTransparency?: boolean;
  /** Treat macOS Option key as Meta (for proper Alt-key sequences). */
  macOptionIsMeta?: boolean;
  /** Allow macOS Option+Click to force selection. */
  macOptionClickForcesSelection?: boolean;
  /** Enable clickable URLs in terminal output. */
  linkHandling?: boolean;
  /** Custom CSS class. */
  className?: string;
}

export interface TerminalHandle {
  /** Write a string to the terminal. */
  write: (data: string | Uint8Array) => void;
  /** Write a string followed by a newline. */
  writeln: (data: string) => void;
  /** Clear the terminal viewport and scrollback. */
  clear: () => void;
  /** Focus the terminal. */
  focus: () => void;
  /** Re-fit the terminal to its container. */
  fit: () => void;
  /** Get the current terminal dimensions. */
  getDimensions: () => { cols: number; rows: number } | null;
  /** Reset the terminal (clear + reset state). */
  reset: () => void;
  /** Scroll to the bottom of the terminal. */
  scrollToBottom: () => void;
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

export const Terminal = forwardRef<TerminalHandle, TerminalProps>(function Terminal(
  {
    onData,
    onBinaryData,
    onResize,
    onSignal,
    onError,
    onClose,
    fontSize = 13,
    fontFamily,
    scrollback = 5000,
    cursorBlink = true,
    convertEol = true,
    allowTransparency = true,
    macOptionIsMeta = true,
    macOptionClickForcesSelection = true,
    linkHandling = true,
    className,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<unknown>(null);
  const fitAddonRef = useRef<unknown>(null);
  const addonsRef = useRef<Array<{ dispose: () => void }>>([]);
  const observerRef = useRef<ResizeObserver | null>(null);
  const debouncedFitRef = useRef<{ run: () => void; cancel: () => void } | null>(null);
  const theme = useEditorTheme();

  // Stable refs for callbacks to avoid re-initializing terminal
  const callbacksRef = useRef({ onData, onBinaryData, onResize, onSignal, onError, onClose });
  callbacksRef.current = { onData, onBinaryData, onResize, onSignal, onError, onClose };

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
  }));

  // Initialize xterm lazily
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;

    async function init() {
      const [{ Terminal: XTerminal }, { FitAddon }, { SearchAddon }] = await Promise.all([
        import('@xterm/xterm'),
        import('@xterm/addon-fit'),
        import('@xterm/addon-search'),
      ]);

      if (disposed) return;

      const xtermTheme = buildXtermTheme();
      const term = new XTerminal({
        fontSize,
        fontFamily: fontFamily || 'var(--ov-font-family-mono, monospace)',
        theme: xtermTheme,
        allowTransparency,
        cursorBlink,
        convertEol,
        scrollback,
        macOptionIsMeta,
        macOptionClickForcesSelection,
        allowProposedApi: true,
        drawBoldTextInBrightColors: true,
      });

      const loadedAddons: Array<{ dispose: () => void }> = [];

      const fitAddon = new FitAddon();
      const searchAddon = new SearchAddon();
      term.loadAddon(fitAddon);
      term.loadAddon(searchAddon);
      loadedAddons.push(fitAddon, searchAddon);

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

      // Try WebGL renderer first, then Canvas fallback
      let rendererLoaded = false;
      try {
        const { WebglAddon } = await import('@xterm/addon-webgl');
        if (!disposed) {
          const webglAddon = new WebglAddon();
          // Handle WebGL context loss gracefully
          webglAddon.onContextLoss(() => {
            webglAddon.dispose();
          });
          term.loadAddon(webglAddon);
          loadedAddons.push(webglAddon);
          rendererLoaded = true;
        }
      } catch {
        // WebGL not available
      }

      if (!rendererLoaded && !disposed) {
        try {
          const { CanvasAddon } = await import('@xterm/addon-canvas');
          if (!disposed) {
            const canvasAddon = new CanvasAddon();
            term.loadAddon(canvasAddon);
            loadedAddons.push(canvasAddon);
          }
        } catch {
          // Canvas addon not available, DOM renderer is used as final fallback
        }
      }

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
      // Re-fit after font size change
      debouncedFitRef.current?.run();
    }
  }, [fontSize]);

  return <div ref={containerRef} className={cn(styles.Root, className)} data-testid="terminal" />;
});

Terminal.displayName = 'Terminal';
