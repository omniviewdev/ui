import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../system/classnames';
import { useDrawerResize, type DrawerAnchor } from './useDrawerResize';
import styles from './Drawer.module.css';

export type { DrawerAnchor };
export type DrawerHandleVariant = 'bar' | 'edge';

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  anchor?: DrawerAnchor;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  resizable?: boolean;
  handleVariant?: DrawerHandleVariant;
  overlay?: boolean;
  modal?: boolean;
  animate?: boolean;
  onSizeChange?: (size: number) => void;
  children?: ReactNode;
}

export type DrawerContentProps = HTMLAttributes<HTMLDivElement>;

const KEYBOARD_STEP = 10;
const KEYBOARD_LARGE_STEP = 50;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const DrawerRoot = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  {
    open,
    onOpenChange,
    anchor = 'bottom',
    defaultSize = 320,
    minSize = 120,
    maxSize,
    resizable = true,
    handleVariant = 'bar',
    overlay = false,
    modal = false,
    animate = true,
    onSizeChange,
    className,
    children,
    style,
    ...props
  },
  externalRef,
) {
  const internalRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // Merge refs: support both callback and object refs
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ref.current assignment
      (internalRef as any).current = node;
      if (typeof externalRef === 'function') {
        externalRef(node);
      } else if (externalRef) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ref.current assignment
        (externalRef as any).current = node;
      }
    },
    [externalRef],
  );

  // Compute maxSize default based on viewport
  const resolvedMaxSize = maxSize ?? (typeof window !== 'undefined'
    ? Math.round(
        (anchor === 'top' || anchor === 'bottom' ? window.innerHeight : window.innerWidth) * 0.8,
      )
    : 800);

  // Clamp initial size to min/max bounds
  const clampedDefaultSize = Math.min(Math.max(defaultSize, minSize), resolvedMaxSize);

  useDrawerResize(internalRef, handleRef, {
    anchor,
    minSize,
    maxSize: resolvedMaxSize,
    onSizeChange,
    enabled: resizable && open,
  });

  // Modal focus management: trap focus, restore on close
  useEffect(() => {
    if (!modal || !open) return;
    const root = internalRef.current;
    if (!root) return;

    // Save and move focus
    previousFocusRef.current = document.activeElement;
    const firstFocusable = root.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      root.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange?.(false);
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const first = focusable[0] as HTMLElement | undefined;
      const last = focusable[focusable.length - 1] as HTMLElement | undefined;
      if (!first || !last) return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      const prev = previousFocusRef.current;
      if (prev && prev instanceof HTMLElement) {
        prev.focus();
      }
    };
  }, [modal, open, onOpenChange]);

  // Keyboard resize on handle
  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      const root = internalRef.current;
      if (!root || !resizable) return;

      const vert = anchor === 'top' || anchor === 'bottom';
      let delta = 0;

      switch (e.key) {
        case 'ArrowUp':
          delta = vert ? -KEYBOARD_STEP : 0;
          break;
        case 'ArrowDown':
          delta = vert ? KEYBOARD_STEP : 0;
          break;
        case 'ArrowLeft':
          delta = vert ? 0 : -KEYBOARD_STEP;
          break;
        case 'ArrowRight':
          delta = vert ? 0 : KEYBOARD_STEP;
          break;
        case 'PageUp':
          delta = -KEYBOARD_LARGE_STEP;
          break;
        case 'PageDown':
          delta = KEYBOARD_LARGE_STEP;
          break;
        case 'Home':
          delta = -(resolvedMaxSize);
          break;
        case 'End':
          delta = resolvedMaxSize;
          break;
        default:
          return;
      }

      if (delta === 0) return;
      e.preventDefault();

      // For bottom/right, growing means negative direction visually
      const sign = anchor === 'bottom' || anchor === 'right' ? -1 : 1;
      const rect = root.getBoundingClientRect();
      const currentSize = vert ? rect.height : rect.width;
      const newSize = Math.min(resolvedMaxSize, Math.max(minSize, currentSize + delta * sign));

      root.style.setProperty('--_ov-size', `${newSize}px`);
      onSizeChange?.(newSize);
    },
    [anchor, minSize, resolvedMaxSize, resizable, onSizeChange],
  );

  const isVertical = anchor === 'top' || anchor === 'bottom';
  const handlePosition = anchor === 'bottom' || anchor === 'right' ? 'before' : 'after';

  // Current size for aria-valuenow (read from style or use default)
  const handle = resizable ? (
    <div
      ref={handleRef}
      className={cn(styles.Handle, handleVariant === 'edge' && styles.HandleEdge)}
      role="separator"
      aria-orientation={isVertical ? 'horizontal' : 'vertical'}
      aria-valuemin={minSize}
      aria-valuemax={resolvedMaxSize}
      aria-valuenow={clampedDefaultSize}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ cursor: isVertical ? 'row-resize' : 'col-resize' }}
    >
      {handleVariant === 'bar' && <div className={styles.HandleBar} />}
    </div>
  ) : null;

  return (
    <>
      {overlay && open && (
        <div
          className={styles.Backdrop}
          data-ov-state={open ? 'open' : 'closed'}
          data-ov-animate={animate ? 'true' : 'false'}
          onClick={() => onOpenChange?.(false)}
        />
      )}
      <div
        ref={mergedRef}
        className={cn(styles.Root, className)}
        data-ov-anchor={anchor}
        data-ov-state={open ? 'open' : 'closed'}
        data-ov-overlay={overlay ? 'true' : 'false'}
        data-ov-animate={animate ? 'true' : 'false'}
        data-ov-handle={handleVariant}
        role={modal ? 'dialog' : 'complementary'}
        aria-modal={modal ? true : undefined}
        tabIndex={modal ? -1 : undefined}
        style={{ '--_ov-size': `${clampedDefaultSize}px`, ...style } as React.CSSProperties}
        {...props}
      >
        {handlePosition === 'before' && handle}
        {children}
        {handlePosition === 'after' && handle}
      </div>
    </>
  );
});

const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(function DrawerContent(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn(styles.Content, className)} {...props} />;
});

DrawerRoot.displayName = 'Drawer';
DrawerContent.displayName = 'Drawer.Content';

type DrawerCompound = typeof DrawerRoot & {
  Content: typeof DrawerContent;
};

export const Drawer = Object.assign(DrawerRoot, {
  Content: DrawerContent,
}) as DrawerCompound;
