import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { cn } from '../../system/classnames';
import { SidebarContext, type SidebarContextValue } from './context';
import { firstFocusable, focusedWithin, isInert } from './focus';
import { registerSidebarShortcut } from './shortcut';
import type { SidebarActions, SidebarMode, SidebarRootProps, SidebarSnapshot } from './types';
import styles from './Sidebar.module.css';

const DEFAULT_EXPANDED_WIDTH = '240px';
const DEFAULT_RAIL_WIDTH = '48px';
/** Hover intent before the peek overlays the content, and grace before it closes. */
const PEEK_OPEN_DELAY = 280;
const PEEK_CLOSE_DELAY = 220;

// Absolute, font-relative, viewport and container lengths; zero needs no unit.
const CSS_LENGTH =
  /^[+-]?(?:(?:0+(?:\.0+)?|\.0+)(?:e[+-]?\d+)?|(?:\d*\.?\d+)(?:e[+-]?\d+)?(?:px|pt|pc|cm|mm|q|in|r?(?:em|ex|cap|ch|ic|lh)|[sld]?v(?:w|h|i|b|min|max)|cq(?:w|h|i|b|min|max)|%))$/i;
const CSS_FUNCTION = /^(?:var|calc|clamp|min|max|env)\(.+\)$/;

function hasBalancedParentheses(value: string): boolean {
  let depth = 0;
  for (const character of value) {
    if (character === '(') depth += 1;
    if (character === ')') depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}

/** Numbers are px; strings must be a CSS length or a var()/calc()/clamp()/min()/max() call. */
function resolveWidth(value: number | string, fallback: string): string {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? `${value}px` : fallback;
  }
  const text = value.trim();
  if (CSS_LENGTH.test(text)) return text;
  const isSafeFunction = CSS_FUNCTION.test(text) && hasBalancedParentheses(text);
  return isSafeFunction && !/[;{}]/.test(text) ? text : fallback;
}

function assignRef<T>(ref: ForwardedRef<T>, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) ref.current = node;
}

/** React focus capture includes owned portals that DOM containment cannot see. */
function hasSidebarFocus(root: HTMLElement | null, ownedFocus: HTMLElement | null): boolean {
  return Boolean(
    focusedWithin(root) ||
    (ownedFocus?.isConnected && ownedFocus.ownerDocument.activeElement === ownedFocus),
  );
}

export const SidebarRoot = forwardRef<HTMLElement, SidebarRootProps>(function SidebarRoot(
  {
    mode: modeProp,
    defaultMode = 'expanded',
    onModeChange,
    expandedWidth = DEFAULT_EXPANDED_WIDTH,
    railWidth = DEFAULT_RAIL_WIDTH,
    hoverPeek = false,
    shortcut = false,
    controller,
    id: idProp,
    className,
    style,
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    onPointerEnter,
    onFocusCapture,
    onPointerLeave,
    onKeyDown,
    onPointerDownCapture,
    onKeyDownCapture,
    ...rest
  },
  forwardedRef,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;

  const isControlled = modeProp !== undefined;
  const [uncontrolledMode, setUncontrolledMode] = useState<SidebarMode>(defaultMode);
  const mode = modeProp ?? uncontrolledMode;

  // A hover peek exists only over a rail that opted in; anything else ends it.
  const [peekRequested, setPeekRequested] = useState(false);
  const peekAllowed = hoverPeek && mode === 'rail';
  if (peekRequested && !peekAllowed) setPeekRequested(false);
  const peeking = peekRequested && peekAllowed;
  const collapsed = mode === 'rail' && !peeking;

  const latest = useRef({ mode, isControlled, onModeChange });
  useLayoutEffect(() => {
    latest.current = { mode, isControlled, onModeChange };
  });

  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const clearPeekTimers = useCallback(() => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    openTimer.current = undefined;
    closeTimer.current = undefined;
  }, []);
  useEffect(() => clearPeekTimers, [clearPeekTimers]);

  // Explicit changes only: peek never reaches onModeChange and never becomes the saved mode.
  const setMode = useCallback(
    (next: SidebarMode) => {
      clearPeekTimers();
      setPeekRequested(false);
      const current = latest.current;
      if (next === current.mode) return;
      if (!current.isControlled) {
        latest.current = { ...current, mode: next };
        setUncontrolledMode(next);
      }
      current.onModeChange?.(next);
    },
    [clearPeekTimers],
  );
  const toggle = useCallback(() => {
    setMode(latest.current.mode === 'expanded' ? 'rail' : 'expanded');
  }, [setMode]);

  const handlePointerEnter = (event: ReactPointerEvent<HTMLElement>) => {
    onPointerEnter?.(event);
    if (!hoverPeek || event.pointerType === 'touch') return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = undefined;
    if (mode !== 'rail' || peeking || openTimer.current !== undefined) return;
    // Peeking makes the rail inert, so it must not displace a focused rail control.
    if (hasSidebarFocus(rootElement.current, ownedFocus.current)) return;
    openTimer.current = window.setTimeout(() => {
      openTimer.current = undefined;
      if (hasSidebarFocus(rootElement.current, ownedFocus.current)) return;
      setPeekRequested(true);
    }, PEEK_OPEN_DELAY);
  };

  const handlePointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    onPointerLeave?.(event);
    window.clearTimeout(openTimer.current);
    openTimer.current = undefined;
    if (!peeking) return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = undefined;
      setPeekRequested(false);
    }, PEEK_CLOSE_DELAY);
  };

  const rootElement = useRef<HTMLElement | null>(null);
  const ownedFocus = useRef<HTMLElement | null>(null);
  const [panelElement, setPanelElement] = useState<HTMLElement | null>(null);
  const setRootElement = useCallback(
    (node: HTMLElement | null) => {
      rootElement.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef],
  );

  // Pointer peeks do not take focus, so dismissal belongs to the owning document.
  useLayoutEffect(() => {
    if (!peeking) return undefined;
    const ownerDocument = rootElement.current?.ownerDocument;
    if (!ownerDocument) return undefined;
    const dismissPeek = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return;
      clearPeekTimers();
      setPeekRequested(false);
    };
    ownerDocument.addEventListener('keydown', dismissPeek);
    return () => ownerDocument.removeEventListener('keydown', dismissPeek);
  }, [peeking, clearPeekTimers]);

  useEffect(() => {
    if (!shortcut) return undefined;
    return registerSidebarShortcut({ getElement: () => rootElement.current, toggle });
  }, [shortcut, toggle]);

  // Hidden slots become inert in the same commit. Keep focus from being stranded in them;
  // children (the navigation) move it first, this is the generic fallback.
  const previousCollapsed = useRef(collapsed);
  useLayoutEffect(() => {
    if (previousCollapsed.current === collapsed) return;
    previousCollapsed.current = collapsed;
    const root = rootElement.current;
    const active = focusedWithin(root);
    if (active && isInert(active)) firstFocusable(root)?.focus({ preventScroll: true });
  }, [collapsed]);

  const snapshot = useMemo<SidebarSnapshot>(
    () => ({ id, mode, peeking, collapsed, shortcut }),
    [id, mode, peeking, collapsed, shortcut],
  );
  const actions = useMemo<SidebarActions>(() => ({ setMode, toggle }), [setMode, toggle]);

  useLayoutEffect(() => {
    controller?.publish(snapshot, actions);
  }, [controller, snapshot, actions]);
  useLayoutEffect(
    () => () => {
      controller?.reset();
    },
    [controller],
  );

  const contextValue = useMemo<SidebarContextValue>(
    () => ({ ...snapshot, setMode, toggle, hoverPeek, panelElement }),
    [snapshot, setMode, toggle, hoverPeek, panelElement],
  );

  const widths = {
    '--_ov-sidebar-expanded-width': resolveWidth(expandedWidth, DEFAULT_EXPANDED_WIDTH),
    '--_ov-sidebar-rail-width': resolveWidth(railWidth, DEFAULT_RAIL_WIDTH),
    ...style,
  } as CSSProperties;

  return (
    <SidebarContext.Provider value={contextValue}>
      <nav
        {...rest}
        ref={setRootElement}
        id={id}
        className={cn(styles.Root, className)}
        style={widths}
        aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : 'Sidebar')}
        aria-labelledby={ariaLabelledBy}
        data-ov-sidebar-root=""
        data-ov-sidebar-mode={mode}
        data-ov-sidebar-collapsed={collapsed ? 'true' : 'false'}
        data-ov-sidebar-peeking={peeking ? 'true' : 'false'}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onKeyDown={onKeyDown}
        onFocusCapture={(event) => {
          ownedFocus.current = event.target;
          onFocusCapture?.(event);
        }}
        onPointerDownCapture={(event) => {
          onPointerDownCapture?.(event);
          clearTimeout(openTimer.current);
          openTimer.current = undefined;
        }}
        onKeyDownCapture={(event) => {
          onKeyDownCapture?.(event);
          clearTimeout(openTimer.current);
          openTimer.current = undefined;
        }}
      >
        <div ref={setPanelElement} className={styles.Panel} data-ov-sidebar-panel="">
          <div className={styles.Viewport}>
            <div className={styles.Inner}>{children}</div>
          </div>
        </div>
      </nav>
    </SidebarContext.Provider>
  );
});

SidebarRoot.displayName = 'Sidebar.Root';
