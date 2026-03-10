import { forwardRef, useCallback, useEffect, useRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './StreamingText.module.css';

export interface StreamingTextProps extends HTMLAttributes<HTMLDivElement> {
  /** Async iterable that yields text chunks (e.g., from an LLM API) */
  stream?: AsyncIterable<string>;
  /** Static content to display (no streaming animation) */
  content?: string;
  /** Show blinking cursor while streaming (default: true) */
  cursor?: boolean;
  /** Callback when streaming completes */
  onComplete?: () => void;
  /** Callback with accumulated text on each chunk */
  onChunk?: (accumulated: string) => void;
}

export const StreamingText = forwardRef<HTMLDivElement, StreamingTextProps>(
  function StreamingText(
    {
      stream,
      content,
      cursor = true,
      onComplete,
      onChunk,
      className,
      ...rest
    },
    ref,
  ) {
    const elRef = useRef<HTMLDivElement>(null);

    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    const onChunkRef = useRef(onChunk);
    onChunkRef.current = onChunk;

    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        (elRef as { current: HTMLDivElement | null }).current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as { current: HTMLDivElement | null }).current = node;
        }
      },
      [ref],
    );

    // Stream mode: iterate over async iterable and update DOM directly
    useEffect(() => {
      if (!stream) return;

      const el = elRef.current;
      if (!el) return;

      let cancelled = false;
      let accumulated = '';

      el.textContent = '';
      el.setAttribute('data-ov-streaming', 'true');

      (async () => {
        try {
          for await (const chunk of stream) {
            if (cancelled) break;
            accumulated += chunk;
            el.textContent = accumulated;
            onChunkRef.current?.(accumulated);
          }
        } catch {
          // Stream errored — treat as complete with whatever we have
        } finally {
          if (!cancelled) {
            el.setAttribute('data-ov-streaming', 'false');
            onCompleteRef.current?.();
          }
        }
      })();

      return () => {
        cancelled = true;
        el.setAttribute('data-ov-streaming', 'false');
      };
    }, [stream]);

    // Static content mode
    const isStatic = !stream;

    return (
      <div
        ref={setRef}
        className={cn(styles.Root, className)}
        data-ov-cursor={cursor ? 'true' : 'false'}
        data-ov-streaming={isStatic ? 'false' : 'true'}
        {...rest}
      >
        {isStatic ? content : null}
      </div>
    );
  },
);
