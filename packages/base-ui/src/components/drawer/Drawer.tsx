import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type HTMLAttributes,
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

  // Merge refs
  const rootRef = (externalRef as React.RefObject<HTMLDivElement | null>) ?? internalRef;

  // Compute maxSize default based on viewport
  const resolvedMaxSize = maxSize ?? (typeof window !== 'undefined'
    ? Math.round(
        (anchor === 'top' || anchor === 'bottom' ? window.innerHeight : window.innerWidth) * 0.8,
      )
    : 800);

  useDrawerResize(rootRef, handleRef, {
    anchor,
    minSize,
    maxSize: resolvedMaxSize,
    onSizeChange,
    enabled: resizable && open,
  });

  // Escape key closes when modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modal && open) {
        onOpenChange?.(false);
      }
    },
    [modal, open, onOpenChange],
  );

  useEffect(() => {
    if (modal && open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [modal, open, handleKeyDown]);

  const isVertical = anchor === 'top' || anchor === 'bottom';
  const handlePosition = anchor === 'bottom' || anchor === 'right' ? 'before' : 'after';

  const handle = resizable ? (
    <div
      ref={handleRef}
      className={cn(styles.Handle, handleVariant === 'edge' && styles.HandleEdge)}
      role="separator"
      aria-orientation={isVertical ? 'horizontal' : 'vertical'}
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
        ref={rootRef}
        className={cn(styles.Root, className)}
        data-ov-anchor={anchor}
        data-ov-state={open ? 'open' : 'closed'}
        data-ov-overlay={overlay ? 'true' : 'false'}
        data-ov-animate={animate ? 'true' : 'false'}
        data-ov-handle={handleVariant}
        role={modal ? 'dialog' : 'complementary'}
        aria-modal={modal ? true : undefined}
        style={{ '--_ov-size': `${defaultSize}px`, ...style } as React.CSSProperties}
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
