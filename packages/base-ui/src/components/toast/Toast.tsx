import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
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

export type ToastSeverity = 'success' | 'warning' | 'danger' | 'info';
export type ToastPosition =
  'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
export type ToastDismissReason =
  'programmatic' | 'close' | 'action' | 'timeout' | 'overflow' | 'dismissAll';

export interface ToastOptions {
  /** Caller-scoped identity. Reusing a visible ID updates without moving or remounting it. */
  id?: string;
  severity?: ToastSeverity;
  /** Auto-dismiss in ms. Zero is persistent. Content updates do not restart expiry. */
  duration?: number;
  action?: { label: string; onClick: () => void };
  title?: string;
  /** Trusted composition replaces all default visible content, including close/action controls. */
  content?: ReactNode;
  /** Ordinary action buttons dismiss by default. */
  dismissOnAction?: boolean;
  /** Called once when this presentation leaves, never an instruction to delete domain data. */
  onDismiss?: (reason: ToastDismissReason) => void;
}
export type ToastUpdate = Partial<Omit<ToastOptions, 'id'>> & { message?: string };
export interface ToastPromiseMessages<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((err: unknown) => string);
}
export interface ToastProviderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  position?: ToastPosition;
  /** Oldest presentations overflow first. Their callbacks receive `overflow`. */
  maxVisible?: number;
  surface?: SurfaceType;
  elevation?: SurfaceElevation;
  children: ReactNode;
}
interface ToastItem extends ToastOptions {
  id: string;
  message: string;
  severity: ToastSeverity;
  duration: number;
  exiting?: boolean;
  loading?: boolean;
}
export interface ToastController {
  toast: (message: string, options?: ToastOptions) => string;
  update: (id: string, patch: ToastUpdate) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  promise: <T>(promise: Promise<T>, messages: ToastPromiseMessages<T>) => Promise<T>;
}
const ToastContext = createContext<ToastController | null>(null);
export function useToast(): ToastController {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
  return ctx;
}

function ToastEntry({
  item,
  onDismiss,
  onRemove,
}: {
  item: ToastItem;
  onDismiss: (id: string, reason: ToastDismissReason, animate?: boolean) => void;
  onRemove: (id: string) => void;
}) {
  const latest = useRef(item);
  useLayoutEffect(() => {
    latest.current = item;
  }, [item]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const remaining = useRef(0);
  const started = useRef(0);
  const hover = useRef(false);
  const focus = useRef(false);
  const summary = [item.title, item.message].filter(Boolean).join('. ');
  const pause = useCallback(() => {
    if (timer.current !== undefined) {
      clearTimeout(timer.current);
      timer.current = undefined;
      remaining.current = Math.max(0, remaining.current - (Date.now() - started.current));
    }
  }, []);
  const resume = useCallback(() => {
    if (
      hover.current ||
      focus.current ||
      latest.current.exiting ||
      !latest.current.duration ||
      timer.current !== undefined
    )
      return;
    started.current = Date.now();
    timer.current = setTimeout(() => {
      timer.current = undefined;
      onDismiss(latest.current.id, 'timeout', true);
    }, remaining.current);
  }, [onDismiss]);
  useEffect(() => {
    remaining.current = item.duration;
    if (item.duration > 0) resume();
    return pause;
  }, [item.duration, pause, resume]);
  useEffect(() => {
    if (!item.exiting) return;
    pause();
    const exit = setTimeout(() => onRemove(item.id), 200);
    return () => clearTimeout(exit);
  }, [item.exiting, item.id, onRemove, pause]);

  const custom = item.content !== undefined;
  return (
    <div
      className={cn(
        styles.Toast,
        custom && styles.ToastCustom,
        item.loading && styles.ToastLoading,
        item.exiting && styles.ToastExiting,
      )}
      data-ov-component="toast"
      data-ov-severity={item.severity}
      data-ov-exiting={item.exiting ? '' : undefined}
      data-ov-loading={item.loading ? '' : undefined}
      onMouseEnter={() => {
        hover.current = true;
        pause();
      }}
      onMouseLeave={() => {
        hover.current = false;
        resume();
      }}
      onFocusCapture={() => {
        focus.current = true;
        pause();
      }}
      onBlurCapture={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        focus.current = false;
        resume();
      }}
    >
      {custom ? (
        <>
          <span className={styles.Summary} role="status" aria-live="polite" aria-atomic="true">
            {summary}
          </span>
          {item.content}
        </>
      ) : (
        <>
          <div className={styles.MessageGroup} role="status" aria-live="polite" aria-atomic="true">
            {item.title && <span className={styles.Title}>{item.title}</span>}
            <span className={styles.Message}>{item.message}</span>
          </div>
          {item.action && (
            <button
              type="button"
              className={styles.Action}
              onClick={() => {
                item.action!.onClick();
                if (item.dismissOnAction !== false) onDismiss(item.id, 'action', true);
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
              onClick={() => onDismiss(item.id, 'close', true)}
            >
              <LuX aria-hidden size={14} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
let nextId = 0;
export const ToastProvider = forwardRef<HTMLDivElement, ToastProviderProps>(function ToastProvider(
  {
    position = 'bottom-right',
    maxVisible = 5,
    surface = 'raised',
    elevation = 2,
    className,
    children,
    ...containerProps
  },
  ref,
) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const current = useRef<ToastItem[]>([]);
  const mounted = useRef(true);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      current.current = [];
    };
  }, []);
  const commit = useCallback((next: ToastItem[]) => {
    current.current = next;
    if (mounted.current) setItems(next);
  }, []);
  const remove = useCallback(
    (id: string) => {
      commit(current.current.filter((item) => item.id !== id));
    },
    [commit],
  );
  const end = useCallback(
    (id: string, reason: ToastDismissReason, animate = false) => {
      const item = current.current.find((entry) => entry.id === id);
      if (!item || item.exiting) return;
      commit(
        animate
          ? current.current.map((entry) => (entry.id === id ? { ...entry, exiting: true } : entry))
          : current.current.filter((entry) => entry.id !== id),
      );
      item.onDismiss?.(reason);
    },
    [commit],
  );
  const dismiss = useCallback((id: string) => end(id, 'programmatic'), [end]);
  const dismissAll = useCallback(() => {
    const previous = current.current;
    commit([]);
    previous.forEach((item) => {
      if (!item.exiting) item.onDismiss?.('dismissAll');
    });
  }, [commit]);
  const update = useCallback(
    (id: string, patch: ToastUpdate & { loading?: boolean }) => {
      if (!mounted.current) return;
      commit(
        current.current.map((item) =>
          item.id === id && !item.exiting ? { ...item, ...patch } : item,
        ),
      );
    },
    [commit],
  );
  const toast = useCallback(
    (message: string, options?: ToastOptions) => {
      let id = options?.id;
      if (id === undefined) {
        do {
          id = `ov-toast-${++nextId}`;
        } while (current.current.some((item) => item.id === id));
      }
      if (!mounted.current) return id;
      if (current.current.some((item) => item.id === id)) {
        update(id, { ...options, message });
        return id;
      }
      const item: ToastItem = {
        ...options,
        id,
        message,
        severity: options?.severity ?? 'info',
        duration: options?.duration ?? 5000,
      };
      const next = [item, ...current.current];
      const admitted = next.slice(0, Math.max(0, maxVisible));
      const overflow = next.slice(admitted.length);
      commit(admitted);
      overflow.forEach((entry) => {
        if (!entry.exiting) entry.onDismiss?.('overflow');
      });
      return id;
    },
    [commit, maxVisible, update],
  );
  const promise = useCallback(
    <T,>(pending: Promise<T>, messages: ToastPromiseMessages<T>): Promise<T> => {
      const id = toast(messages.loading, { duration: 0 });
      update(id, { loading: true });
      pending.then(
        (data) =>
          update(id, {
            message:
              typeof messages.success === 'function' ? messages.success(data) : messages.success,
            severity: 'success',
            duration: 5000,
            loading: false,
          }),
        (error: unknown) =>
          update(id, {
            message: typeof messages.error === 'function' ? messages.error(error) : messages.error,
            severity: 'danger',
            duration: 5000,
            loading: false,
          }),
      );
      return pending;
    },
    [toast, update],
  );
  const ordered = position.startsWith('top') ? items : [...items].reverse();
  const portalAttrs: Record<string, string> = {};
  if (typeof document !== 'undefined') {
    for (const attr of document.documentElement.getAttributeNames()) {
      if (attr.startsWith('data-ov-'))
        portalAttrs[attr] = document.documentElement.getAttribute(attr) ?? '';
    }
  }
  return (
    <ToastContext.Provider value={{ toast, update, dismiss, dismissAll, promise }}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
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
            {ordered.map((item) => (
              <ToastEntry key={item.id} item={item} onDismiss={end} onRemove={remove} />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
});
ToastProvider.displayName = 'ToastProvider';
