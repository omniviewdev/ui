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
import type { SurfaceType, SurfaceElevation } from '../../system/types';
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
  /** Optional title displayed above the message. */
  title?: string;
}

export interface ToastPromiseMessages<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((err: unknown) => string);
}

export interface ToastProviderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Screen corner for the toast container. @default 'bottom-right' */
  position?: ToastPosition;
  /** Maximum visible toasts before older ones are dismissed. @default 5 */
  maxVisible?: number;
  /** Background surface level for toasts. @default 'raised' */
  surface?: SurfaceType;
  /** Shadow elevation level. @default 2 */
  elevation?: SurfaceElevation;
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Internal item type
// ---------------------------------------------------------------------------

interface ToastItem {
  id: string;
  message: string;
  title?: string;
  severity: ToastSeverity;
  duration: number;
  action?: { label: string; onClick: () => void };
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface ToastContextValue {
  toast: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  promise: <T>(promise: Promise<T>, messages: ToastPromiseMessages<T>) => Promise<T>;
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
    if (item.duration > 0 && !item.loading) {
      timerRef.current = setTimeout(startExit, item.duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [item.duration, item.loading, startExit]);

  return (
    <div
      className={cn(
        styles.Toast,
        exiting && styles.ToastExiting,
        item.loading && styles.ToastLoading,
      )}
      data-ov-component="toast"
      data-ov-severity={item.severity}
      data-ov-exiting={exiting ? '' : undefined}
      data-ov-loading={item.loading ? '' : undefined}
      role="status"
      aria-live="polite"
    >
      <div className={styles.MessageGroup}>
        {item.title && <span className={styles.Title}>{item.title}</span>}
        <span className={styles.Message}>{item.message}</span>
      </div>

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

      {!item.loading && (
        <button
          type="button"
          className={styles.Close}
          aria-label="Close"
          onClick={() => startExit()}
        >
          <LuX aria-hidden size={14} />
        </button>
      )}
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
  { position = 'bottom-right', maxVisible = 5, surface = 'raised', elevation = 2, className, children, ...containerProps },
  ref,
) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setItems([]);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<ToastItem>) => {
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const toast = useCallback(
    (message: string, options?: ToastOptions): string => {
      const id = generateId();
      const newItem: ToastItem = {
        id,
        message,
        title: options?.title,
        severity: options?.severity ?? 'info',
        duration: options?.duration ?? 5000,
        action: options?.action,
      };

      setItems((prev) => {
        const next = [newItem, ...prev];
        if (next.length > maxVisible) {
          return next.slice(0, maxVisible);
        }
        return next;
      });

      return id;
    },
    [maxVisible],
  );

  const toastPromise = useCallback(
    <T,>(promise: Promise<T>, messages: ToastPromiseMessages<T>): Promise<T> => {
      const id = generateId();
      const loadingItem: ToastItem = {
        id,
        message: messages.loading,
        severity: 'info',
        duration: 0,
        loading: true,
      };

      setItems((prev) => {
        const next = [loadingItem, ...prev];
        if (next.length > maxVisible) {
          return next.slice(0, maxVisible);
        }
        return next;
      });

      promise.then(
        (data) => {
          const msg =
            typeof messages.success === 'function' ? messages.success(data) : messages.success;
          updateItem(id, {
            message: msg,
            severity: 'success',
            loading: false,
            duration: 5000,
          });
        },
        (err) => {
          const msg = typeof messages.error === 'function' ? messages.error(err) : messages.error;
          updateItem(id, {
            message: msg,
            severity: 'danger',
            loading: false,
            duration: 5000,
          });
        },
      );

      return promise;
    },
    [maxVisible, updateItem],
  );

  const contextValue: ToastContextValue = {
    toast,
    dismiss,
    dismissAll,
    promise: toastPromise,
  };

  // Determine stack order: for top positions, newest first; for bottom, newest last
  const isTop = position.startsWith('top');
  const orderedItems = isTop ? items : [...items].reverse();

  // Copy theme attributes from document root so the portal inherits the theme
  const portalAttrs: Record<string, string> = {};
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    for (const attr of root.getAttributeNames()) {
      if (attr.startsWith('data-ov-')) {
        portalAttrs[attr] = root.getAttribute(attr) ?? '';
      }
    }
  }

  const container =
    typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={ref}
            className={cn(styles.Container, className)}
            data-ov-component="toast-container"
            data-ov-position={position}
            data-ov-surface={surface}
            data-ov-elevation={elevation}
            {...portalAttrs}
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
