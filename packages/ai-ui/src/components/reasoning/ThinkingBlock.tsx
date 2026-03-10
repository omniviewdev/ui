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
import { Collapsible, CollapsibleContent } from '@omniview/base-ui';
import { cn } from '../../system/classnames';
import { LuChevronDown } from '../../system/icons';
import { BrainIcon } from './BrainIcon';
import styles from './ThinkingBlock.module.css';

// ---------------------------------------------------------------------------
// Context for compound component pattern
// ---------------------------------------------------------------------------

interface ThinkingContextValue {
  isOpen: boolean;
  isStreaming: boolean;
  duration: number;
  toggle: () => void;
}

const ThinkingContext = createContext<ThinkingContextValue | null>(null);

function useThinking() {
  const ctx = useContext(ThinkingContext);
  if (!ctx) throw new Error('ThinkingBlock sub-components must be used within ThinkingBlock');
  return ctx;
}

// ---------------------------------------------------------------------------
// ThinkingBlock (root)
// ---------------------------------------------------------------------------

export interface ThinkingBlockProps extends HTMLAttributes<HTMLDivElement> {
  /** Static reasoning text content (use `stream` for incremental input) */
  content?: string;
  /** Async iterable that yields thinking text chunks — the primary API for
   *  real model integrations where thinking tokens arrive incrementally.
   *  Automatically manages streaming state and duration measurement. */
  stream?: AsyncIterable<string>;
  /** Start expanded (default: false) */
  defaultExpanded?: boolean;
  /** Whether content is still streaming in (only needed with `content` prop;
   *  automatically managed when using `stream`) */
  streaming?: boolean;
  /** Thinking duration in ms (automatically measured when using `stream`) */
  duration?: number;
  /** Callback fired when the stream finishes */
  onComplete?: () => void;
  /** Auto-close after streaming completes (default: true) */
  autoClose?: boolean;
  /** Delay before auto-closing in ms (default: 1000) */
  autoCloseDelay?: number;
  /** Custom trigger content (replaces default trigger) */
  trigger?: ReactNode;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds === 1) return '1 second';
  return `${seconds} seconds`;
}

function getThinkingLabel(streaming: boolean, duration?: number): string {
  if (streaming || duration == null) return 'Thinking\u2026';
  return `Thought for ${formatDuration(duration)}`;
}

export const ThinkingBlock = forwardRef<HTMLDivElement, ThinkingBlockProps>(
  function ThinkingBlock(
    {
      content: contentProp,
      stream,
      defaultExpanded = false,
      streaming: streamingProp = false,
      duration: durationProp,
      onComplete,
      autoClose = true,
      autoCloseDelay = 1000,
      trigger,
      className,
      ...rest
    },
    ref,
  ) {
    // --- Stream consumption ---
    const [streamedContent, setStreamedContent] = useState('');
    const [streamActive, setStreamActive] = useState(false);
    const [streamDuration, setStreamDuration] = useState(0);

    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    useEffect(() => {
      if (!stream) return;

      let cancelled = false;
      let accumulated = '';
      let rafId: number | null = null;
      let pendingFlush = false;
      const start = Date.now();

      setStreamActive(true);
      setStreamedContent('');
      setStreamDuration(0);

      const flush = () => {
        if (!cancelled) {
          setStreamedContent(accumulated);
          pendingFlush = false;
        }
      };

      (async () => {
        try {
          for await (const chunk of stream) {
            if (cancelled) break;
            accumulated += chunk;

            if (!pendingFlush) {
              pendingFlush = true;
              rafId = requestAnimationFrame(flush);
            }
          }
        } catch {
          // Stream errored — render whatever we accumulated
        } finally {
          if (!cancelled) {
            if (rafId != null) cancelAnimationFrame(rafId);
            setStreamedContent(accumulated);
            const elapsed = Date.now() - start;
            setStreamDuration(elapsed);
            setStreamActive(false);
            onCompleteRef.current?.();
          }
        }
      })();

      return () => {
        cancelled = true;
        if (rafId != null) cancelAnimationFrame(rafId);
      };
    }, [stream]);

    // --- Resolve content / streaming / duration from stream vs props ---
    const content = stream ? streamedContent : (contentProp ?? '');
    const streaming = stream ? streamActive : streamingProp;
    const resolvedDuration = durationProp ?? (stream ? streamDuration : 0);

    // --- Expand / collapse state ---
    const [isOpen, setIsOpen] = useState(defaultExpanded);
    const [measuredDuration, setMeasuredDuration] = useState(resolvedDuration);
    const startTimeRef = useRef<number | null>(null);
    const hasAutoClosedRef = useRef(false);

    // Track streaming duration for the `streaming` prop API (non-stream)
    useEffect(() => {
      if (streaming) {
        if (startTimeRef.current === null) {
          startTimeRef.current = Date.now();
          setIsOpen(true);
        }
      } else if (startTimeRef.current !== null) {
        const elapsed = Date.now() - startTimeRef.current;
        setMeasuredDuration(elapsed);
        startTimeRef.current = null;
      }
    }, [streaming]);

    // Sync resolved duration into measuredDuration
    useEffect(() => {
      if (resolvedDuration > 0) setMeasuredDuration(resolvedDuration);
    }, [resolvedDuration]);

    // Auto-close after streaming finishes
    useEffect(() => {
      if (autoClose && !streaming && isOpen && !hasAutoClosedRef.current && startTimeRef.current === null && measuredDuration > 0) {
        const timer = setTimeout(() => {
          setIsOpen(false);
          hasAutoClosedRef.current = true;
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    }, [streaming, isOpen, autoClose, autoCloseDelay, measuredDuration]);

    const toggle = useCallback(() => setIsOpen((v) => !v), []);

    const duration = durationProp ?? measuredDuration;

    const ctx: ThinkingContextValue = { isOpen, isStreaming: streaming, duration, toggle };

    return (
      <ThinkingContext.Provider value={ctx}>
        <div
          ref={ref}
          className={cn(styles.Root, className)}
          data-ov-expanded={isOpen ? 'true' : 'false'}
          data-ov-streaming={streaming ? 'true' : 'false'}
          {...rest}
        >
          {trigger ?? (
            <button
              type="button"
              className={styles.Trigger}
              onClick={toggle}
              aria-expanded={isOpen}
            >
              <span className={styles.BrainIcon} aria-hidden="true">
                <BrainIcon size={16} />
              </span>
              <span className={styles.Label}>
                {getThinkingLabel(streaming, streaming ? undefined : duration || undefined)}
              </span>
              <span
                className={styles.Chevron}
                data-ov-open={isOpen ? 'true' : 'false'}
                aria-hidden="true"
              >
                <LuChevronDown size={16} />
              </span>
            </button>
          )}

          <Collapsible open={isOpen} animation="default">
            <CollapsibleContent>
              <div className={styles.Content}>
                <p className={styles.Text}>{content}</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ThinkingContext.Provider>
    );
  },
);

// ---------------------------------------------------------------------------
// Sub-components (exported for compound pattern)
// ---------------------------------------------------------------------------

export { BrainIcon as ThinkingBrainIcon };

export function ThinkingTrigger({ children, className, ...rest }: HTMLAttributes<HTMLButtonElement>) {
  const { isOpen, isStreaming, duration, toggle } = useThinking();
  return (
    <button
      type="button"
      className={cn(styles.Trigger, className)}
      onClick={toggle}
      aria-expanded={isOpen}
      {...rest}
    >
      {children ?? (
        <>
          <span className={styles.BrainIcon} aria-hidden="true">
            <BrainIcon size={16} />
          </span>
          <span className={styles.Label}>
            {getThinkingLabel(isStreaming, isStreaming ? undefined : duration || undefined)}
          </span>
          <span
            className={styles.Chevron}
            data-ov-open={isOpen ? 'true' : 'false'}
            aria-hidden="true"
          >
            <LuChevronDown size={16} />
          </span>
        </>
      )}
    </button>
  );
}
