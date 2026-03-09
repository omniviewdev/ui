import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../system/classnames';
import styles from './ResizableSplitPane.module.css';

export type SplitDirection = 'horizontal' | 'vertical';

export interface ResizableSplitPaneProps extends HTMLAttributes<HTMLDivElement> {
  /** Split direction. 'horizontal' = side by side, 'vertical' = stacked. */
  direction?: SplitDirection;
  /** Initial size of the first pane in pixels. */
  defaultSize?: number;
  /** Minimum size of the first pane in pixels. */
  minSize?: number;
  /** Maximum size of the first pane in pixels. */
  maxSize?: number;
  /** Accessible label for the resize handle (role="separator"). */
  handleLabel?: string;
  /** Callback fired during resize with the current first-pane size in px. */
  onResize?: (size: number) => void;
  /** The two pane contents. */
  children: [ReactNode, ReactNode];
}

export interface ResizableSplitPanePaneProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface ResizableSplitPaneHandleProps extends HTMLAttributes<HTMLDivElement> {
  /** Orientation of the handle. Automatically set by parent context. */
  direction?: SplitDirection;
}

const KEYBOARD_STEP = 10;

const Pane = forwardRef<HTMLDivElement, ResizableSplitPanePaneProps>(
  function Pane({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={cn(styles.Pane, className)} {...props}>
        {children}
      </div>
    );
  },
);

Pane.displayName = 'ResizableSplitPane.Pane';

const Handle = forwardRef<HTMLDivElement, ResizableSplitPaneHandleProps>(
  function Handle({ className, direction = 'horizontal', ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(styles.Handle, className)}
        data-ov-direction={direction}
        role="separator"
        tabIndex={0}
        aria-orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
        {...props}
      />
    );
  },
);

Handle.displayName = 'ResizableSplitPane.Handle';

const ResizableSplitPaneRoot = forwardRef<HTMLDivElement, ResizableSplitPaneProps>(
  function ResizableSplitPaneRoot(
    {
      className,
      style,
      direction = 'horizontal',
      defaultSize = 200,
      minSize = 100,
      maxSize,
      handleLabel,
      onResize,
      children,
      ...props
    },
    ref,
  ) {
    // Clamp defaultSize before initializing state
    const initialSize = Math.max(defaultSize, minSize);
    const clampedInitial = maxSize != null ? Math.min(initialSize, maxSize) : initialSize;

    // React state only for keyboard/reset interactions — drag uses direct DOM
    const [size, setSize] = useState(clampedInitial);
    const rootRef = useRef<HTMLDivElement>(null);
    const sizeRef = useRef(clampedInitial);
    const dragging = useRef(false);
    const startPos = useRef(0);
    const startSize = useRef(0);

    // Keep refs in sync with callbacks
    const onResizeRef = useRef(onResize);
    onResizeRef.current = onResize;

    const clamp = useCallback(
      (value: number) => {
        let clamped = Math.max(value, minSize);
        if (maxSize != null) {
          clamped = Math.min(clamped, maxSize);
        }
        return clamped;
      },
      [minSize, maxSize],
    );

    // Re-clamp when bounds change after mount
    useEffect(() => {
      const clamped = clamp(sizeRef.current);
      if (clamped !== sizeRef.current) {
        sizeRef.current = clamped;
        setSize(clamped);
        const el = rootRef.current;
        if (el) {
          el.style.setProperty('--_ov-split-size', `${clamped}px`);
        }
        onResizeRef.current?.(clamped);
      }
    }, [clamp]);

    // Direct DOM update for 60fps drag — bypasses React reconciliation
    const applySize = useCallback(
      (newSize: number) => {
        const el = rootRef.current;
        if (el) {
          el.style.setProperty('--_ov-split-size', `${newSize}px`);
        }
        sizeRef.current = newSize;
        onResizeRef.current?.(newSize);
      },
      [],
    );

    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        e.preventDefault();
        dragging.current = true;
        startPos.current = direction === 'horizontal' ? e.clientX : e.clientY;
        startSize.current = sizeRef.current;
        const target = e.target as HTMLElement;
        if (target.setPointerCapture) {
          target.setPointerCapture(e.pointerId);
        }
        // Set dragging attribute on root for cursor override
        rootRef.current?.setAttribute('data-ov-dragging', '');
      },
      [direction],
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!dragging.current) return;
        const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
        const delta = currentPos - startPos.current;
        const newSize = clamp(startSize.current + delta);
        applySize(newSize);
      },
      [direction, clamp, applySize],
    );

    const handlePointerUp = useCallback(() => {
      dragging.current = false;
      // Sync React state for keyboard handlers
      setSize(sizeRef.current);
      rootRef.current?.removeAttribute('data-ov-dragging');
    }, []);

    const handleDoubleClick = useCallback(() => {
      const reset = clamp(defaultSize);
      setSize(reset);
      applySize(reset);
    }, [defaultSize, clamp, applySize]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        const isHorizontal = direction === 'horizontal';
        let delta = 0;
        let handled = false;

        if (
          (isHorizontal && e.key === 'ArrowRight') ||
          (!isHorizontal && e.key === 'ArrowDown')
        ) {
          delta = KEYBOARD_STEP;
          handled = true;
        } else if (
          (isHorizontal && e.key === 'ArrowLeft') ||
          (!isHorizontal && e.key === 'ArrowUp')
        ) {
          delta = -KEYBOARD_STEP;
          handled = true;
        } else if (e.key === 'Home') {
          delta = -(size - minSize);
          handled = true;
        } else if (e.key === 'End' && maxSize != null) {
          delta = maxSize - size;
          handled = true;
        }

        if (handled) {
          e.preventDefault();
          if (delta !== 0) {
            const newSize = clamp(size + delta);
            setSize(newSize);
            applySize(newSize);
          }
        }
      },
      [direction, size, minSize, maxSize, clamp, applySize],
    );

    // Merge external ref with internal ref
    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const mergedStyle: CSSProperties = {
      '--_ov-split-size': `${size}px`,
      ...style,
    } as CSSProperties;

    return (
      <div
        ref={setRefs}
        className={cn(styles.Root, className)}
        style={mergedStyle}
        data-ov-direction={direction}
        {...props}
      >
        <Pane>{children[0]}</Pane>
        <Handle
          direction={direction}
          aria-label={handleLabel}
          aria-valuenow={size}
          aria-valuemin={minSize}
          aria-valuemax={maxSize}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onLostPointerCapture={handlePointerUp}
          onDoubleClick={handleDoubleClick}
          onKeyDown={handleKeyDown}
        />
        <Pane>{children[1]}</Pane>
      </div>
    );
  },
);

ResizableSplitPaneRoot.displayName = 'ResizableSplitPane';

export const ResizableSplitPane = ResizableSplitPaneRoot;
