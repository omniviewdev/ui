import { forwardRef, useCallback, useEffect, useRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './StreamingText.module.css';

export interface StreamingTextProps extends HTMLAttributes<HTMLSpanElement> {
  /** Full text content to stream through */
  content: string;
  /** Characters per second (default: 30) */
  speed?: number;
  /** Show blinking cursor (default: true) */
  cursor?: boolean;
  /** Callback when all text is revealed */
  onComplete?: () => void;
  /** Skip animation, show all text immediately (default: false) */
  immediate?: boolean;
}

export const StreamingText = forwardRef<HTMLSpanElement, StreamingTextProps>(
  function StreamingText(
    {
      content,
      speed = 30,
      cursor = true,
      onComplete,
      immediate = false,
      className,
      ...rest
    },
    ref,
  ) {
    const textRef = useRef<HTMLSpanElement>(null);
    const indexRef = useRef(0);
    const rafRef = useRef<number>(0);
    const lastTimeRef = useRef(0);
    const completeRef = useRef(false);

    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    const setRef = useCallback(
      (node: HTMLSpanElement | null) => {
        (textRef as { current: HTMLSpanElement | null }).current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as { current: HTMLSpanElement | null }).current = node;
        }
      },
      [ref],
    );

    // Check if reduced motion is preferred
    const shouldAnimate = useCallback(() => {
      if (immediate) return false;
      if (typeof document === 'undefined') return false;
      const root = document.documentElement;
      if (root.getAttribute('data-ov-motion') === 'reduced') return false;
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
      return true;
    }, [immediate]);

    useEffect(() => {
      const el = textRef.current;
      if (!el) return;

      // Reset on content change
      indexRef.current = 0;
      completeRef.current = false;
      lastTimeRef.current = 0;

      if (!shouldAnimate()) {
        el.textContent = content;
        completeRef.current = true;
        onCompleteRef.current?.();
        return;
      }

      el.textContent = '';
      const interval = 1000 / speed;

      const tick = (time: number) => {
        if (completeRef.current) return;

        if (!lastTimeRef.current) {
          lastTimeRef.current = time;
        }

        const elapsed = time - lastTimeRef.current;

        if (elapsed >= interval) {
          // Variable chunk size for natural feel
          const chunks = Math.min(
            Math.floor(elapsed / interval),
            3,
          );
          const nextIndex = Math.min(indexRef.current + chunks, content.length);
          el.textContent = content.slice(0, nextIndex);
          indexRef.current = nextIndex;
          lastTimeRef.current = time;

          if (nextIndex >= content.length) {
            completeRef.current = true;
            onCompleteRef.current?.();
            return;
          }
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);

      return () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      };
    }, [content, speed, shouldAnimate]);

    return (
      <span
        ref={setRef}
        className={cn(styles.Root, className)}
        data-ov-cursor={cursor ? 'true' : 'false'}
        data-ov-complete={completeRef.current ? 'true' : 'false'}
        {...rest}
      />
    );
  },
);
