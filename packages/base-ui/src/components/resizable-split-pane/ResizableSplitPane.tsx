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
      onResize,
      children,
      ...props
    },
    ref,
  ) {
    const [size, setSize] = useState(defaultSize);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);
    const startPos = useRef(0);
    const startSize = useRef(0);

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

    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        e.preventDefault();
        dragging.current = true;
        startPos.current = direction === 'horizontal' ? e.clientX : e.clientY;
        startSize.current = size;
        const target = e.target as HTMLElement;
        if (target.setPointerCapture) {
          target.setPointerCapture(e.pointerId);
        }
      },
      [direction, size],
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!dragging.current) return;
        const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
        const delta = currentPos - startPos.current;
        const newSize = clamp(startSize.current + delta);
        setSize(newSize);
        onResize?.(newSize);
      },
      [direction, clamp, onResize],
    );

    const handlePointerUp = useCallback(() => {
      dragging.current = false;
    }, []);

    const handleDoubleClick = useCallback(() => {
      const reset = clamp(defaultSize);
      setSize(reset);
      onResize?.(reset);
    }, [defaultSize, clamp, onResize]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        const isHorizontal = direction === 'horizontal';
        let delta = 0;
        if (
          (isHorizontal && e.key === 'ArrowRight') ||
          (!isHorizontal && e.key === 'ArrowDown')
        ) {
          delta = KEYBOARD_STEP;
        } else if (
          (isHorizontal && e.key === 'ArrowLeft') ||
          (!isHorizontal && e.key === 'ArrowUp')
        ) {
          delta = -KEYBOARD_STEP;
        } else if (e.key === 'Home') {
          delta = -(size - minSize);
        } else if (e.key === 'End' && maxSize != null) {
          delta = maxSize - size;
        }

        if (delta !== 0) {
          e.preventDefault();
          const newSize = clamp(size + delta);
          setSize(newSize);
          onResize?.(newSize);
        }
      },
      [direction, size, minSize, maxSize, clamp, onResize],
    );

    // Sync size when defaultSize changes externally
    useEffect(() => {
      setSize(clamp(defaultSize));
    }, [defaultSize, clamp]);

    const mergedStyle: CSSProperties = {
      '--_ov-split-size': `${size}px`,
      ...style,
    } as CSSProperties;

    return (
      <div
        ref={ref ?? containerRef}
        className={cn(styles.Root, className)}
        style={mergedStyle}
        data-ov-direction={direction}
        data-ov-dragging={dragging.current || undefined}
        {...props}
      >
        <Pane className={styles.FirstPane}>{children[0]}</Pane>
        <Handle
          direction={direction}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClick}
          onKeyDown={handleKeyDown}
        />
        <Pane className={styles.SecondPane}>{children[1]}</Pane>
      </div>
    );
  },
);

ResizableSplitPaneRoot.displayName = 'ResizableSplitPane';

type ResizableSplitPaneCompound = typeof ResizableSplitPaneRoot & {
  Pane: typeof Pane;
  Handle: typeof Handle;
};

export const ResizableSplitPane = Object.assign(ResizableSplitPaneRoot, {
  Pane,
  Handle,
}) as ResizableSplitPaneCompound;
