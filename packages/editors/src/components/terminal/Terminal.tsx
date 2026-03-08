import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { useEditorTheme } from '../../themes/useEditorTheme';
import { buildXtermTheme } from '../../themes/xterm';
import styles from './Terminal.module.css';

export interface TerminalProps {
  onData?: (data: string) => void;
  onResize?: (cols: number, rows: number) => void;
  fontSize?: number;
  fontFamily?: string;
  className?: string;
}

export interface TerminalHandle {
  write: (data: string) => void;
  writeln: (data: string) => void;
  clear: () => void;
  focus: () => void;
  fit: () => void;
}

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const Terminal = forwardRef<TerminalHandle, TerminalProps>(function Terminal(
  { onData, onResize, fontSize = 13, fontFamily, className },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<unknown>(null);
  const fitAddonRef = useRef<unknown>(null);
  const theme = useEditorTheme();

  const fit = useCallback(() => {
    const addon = fitAddonRef.current as { fit?: () => void } | null;
    addon?.fit?.();
  }, []);

  useImperativeHandle(ref, () => ({
    write: (data: string) => {
      const t = termRef.current as { write?: (d: string) => void } | null;
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
        allowTransparency: true,
        cursorBlink: true,
        convertEol: true,
      });

      const fitAddon = new FitAddon();
      const searchAddon = new SearchAddon();
      term.loadAddon(fitAddon);
      term.loadAddon(searchAddon);

      // Try WebGL renderer, fall back to canvas
      try {
        const { WebglAddon } = await import('@xterm/addon-webgl');
        if (!disposed) {
          const webglAddon = new WebglAddon();
          term.loadAddon(webglAddon);
        }
      } catch {
        // WebGL not available, canvas fallback is fine
      }

      if (disposed) {
        term.dispose();
        return;
      }

      term.open(container!);
      fitAddon.fit();

      termRef.current = term;
      fitAddonRef.current = fitAddon;

      if (onData) {
        term.onData(onData);
      }

      if (onResize) {
        term.onResize(({ cols, rows }) => onResize(cols, rows));
      }

      // Observe container resize
      const observer = new ResizeObserver(() => {
        fitAddon.fit();
      });
      observer.observe(container!);

      // Store cleanup references
      (container as HTMLDivElement & { __cleanup?: () => void }).__cleanup = () => {
        observer.disconnect();
        term.dispose();
        termRef.current = null;
        fitAddonRef.current = null;
      };
    }

    init();

    return () => {
      disposed = true;
      const cleanup = (container as HTMLDivElement & { __cleanup?: () => void }).__cleanup;
      cleanup?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update theme
  useEffect(() => {
    const term = termRef.current as { options?: { theme: unknown } } | null;
    if (term?.options) {
      term.options.theme = buildXtermTheme();
    }
  }, [theme]);

  return <div ref={containerRef} className={cn(styles.Root, className)} data-testid="terminal" />;
});

Terminal.displayName = 'Terminal';
