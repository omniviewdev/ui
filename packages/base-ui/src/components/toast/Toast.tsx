import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { LuX } from 'react-icons/lu';
import { cn } from '../../system/classnames';
import styles from './Toast.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ToastSeverity = 'success' | 'warning' | 'danger' | 'info';
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

export interface ToastOptions {
  /** Severity colour band. @default 'info' */
  severity?: ToastSeverity;
  /** Auto-dismiss in ms. 0 = persistent. @default 5000 */
  duration?: number;
  /** Optional action button rendered inside the toast. */
  action?: { label: string; onClick: () => void };
}

export interface ToastProviderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Screen corner for the toast container. @default 'bottom-right' */
  position?: ToastPosition;
  /** Maximum visible toasts before older ones are dismissed. @default 5 */
  maxVisible?: number;
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Internal item type
// ---------------------------------------------------------------------------

interface ToastItem {
  id: string;
  message: string;
  severity: ToastSeverity;
  duration: number;
  action?: { label: string; onClick: () => void };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface ToastContextValue {
  toast: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ---------------------------------------------------------------------------
// useToast hook
// ---------------------------------------------------------------------------

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Individual Toast
// ---------------------------------------------------------------------------

interface ToastEntryProps {
  item: ToastItem;
  onDismiss: (id: string) => void;
}

function ToastEntry({ item, onDismiss }: ToastEntryProps) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitingRef = useRef(false);

  const startExit = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setExiting(true);
    setTimeout(() => onDismiss(item.id), 200);
  }, [item.id, onDismiss]);

  useEffect(() => {
    if (item.duration > 0) {
      timerRef.current = setTimeout(startExit, item.duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [item.duration, startExit]);

  return (
    <div
      className={cn(styles.Toast, exiting && styles.ToastExiting)}
      data-ov-component="toast"
      data-ov-severity={item.severity}
      data-ov-exiting={exiting ? '' : undefined}
      role="status"
      aria-live="polite"
    >
      <span className={styles.Message}>{item.message}</span>

      {item.action && (
        <button
          type="button"
          className={styles.Action}
          onClick={() => {
            item.action!.onClick();
            startExit();
          }}
        >
          {item.action.label}
        </button>
      )}

      <button type="button" className={styles.Close} aria-label="Close" onClick={() => startExit()}>
        <LuX aria-hidden size={14} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ToastProvider
// ---------------------------------------------------------------------------

let nextId = 0;
function generateId(): string {
  nextId += 1;
  return `ov-toast-${nextId}`;
}

export const ToastProvider = forwardRef<HTMLDivElement, ToastProviderProps>(function ToastProvider(
  { position = 'bottom-right', maxVisible = 5, className, children, ...containerProps },
  ref,
) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setItems([]);
  }, []);

  const toast = useCallback(
    (message: string, options?: ToastOptions): string => {
      const id = generateId();
      const newItem: ToastItem = {
        id,
        message,
        severity: options?.severity ?? 'info',
        duration: options?.duration ?? 5000,
        action: options?.action,
      };

      setItems((prev) => {
        const next = [newItem, ...prev];
        // Enforce maxVisible by trimming oldest
        if (next.length > maxVisible) {
          return next.slice(0, maxVisible);
        }
        return next;
      });

      return id;
    },
    [maxVisible],
  );

  const contextValue: ToastContextValue = { toast, dismiss, dismissAll };

  // Determine stack order: for top positions, newest first; for bottom, newest last
  const isTop = position.startsWith('top');
  const orderedItems = isTop ? items : [...items].reverse();

  const container =
    typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={ref}
            className={cn(styles.Container, className)}
            data-ov-component="toast-container"
            data-ov-position={position}
            {...containerProps}
          >
            {orderedItems.map((item) => (
              <ToastEntry key={item.id} item={item} onDismiss={dismiss} />
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {container}
    </ToastContext.Provider>
  );
});

ToastProvider.displayName = 'ToastProvider';
