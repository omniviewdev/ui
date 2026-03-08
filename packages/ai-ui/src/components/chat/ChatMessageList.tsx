import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
} from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '../../system/classnames';
import styles from './ChatMessageList.module.css';

export interface ChatMessageListProps extends HTMLAttributes<HTMLDivElement> {
  /** Auto-scroll to bottom on new children (default: true) */
  autoScroll?: boolean;
  /** Callback when user scrolls to top (for loading older messages) */
  onScrollToTop?: () => void;
  /** Total number of items for virtualization */
  count: number;
  /** Estimated height per item in pixels (default: 80) */
  estimateSize?: number;
  /** Render function for each item by index */
  renderItem: (index: number) => React.ReactNode;
}

export const ChatMessageList = forwardRef<HTMLDivElement, ChatMessageListProps>(
  function ChatMessageList(
    {
      autoScroll = true,
      onScrollToTop,
      count,
      estimateSize = 80,
      renderItem,
      className,
      ...rest
    },
    ref,
  ) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showNewIndicator, setShowNewIndicator] = useState(false);
    const prevCountRef = useRef(count);

    const virtualizer = useVirtualizer({
      count,
      getScrollElement: () => scrollRef.current,
      estimateSize: () => estimateSize,
      overscan: 5,
    });

    const scrollToBottom = useCallback(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        setIsAtBottom(true);
        setShowNewIndicator(false);
      }
    }, []);

    const handleScroll = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;

      const threshold = 50;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      setIsAtBottom(atBottom);

      if (atBottom) {
        setShowNewIndicator(false);
      }

      if (el.scrollTop === 0 && onScrollToTop) {
        onScrollToTop();
      }
    }, [onScrollToTop]);

    // Auto-scroll when new messages arrive and user is at bottom
    useEffect(() => {
      if (count > prevCountRef.current) {
        if (autoScroll && isAtBottom) {
          // Use rAF to allow DOM to update first
          requestAnimationFrame(scrollToBottom);
        } else if (!isAtBottom) {
          setShowNewIndicator(true);
        }
      }
      prevCountRef.current = count;
    }, [count, autoScroll, isAtBottom, scrollToBottom]);

    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        (scrollRef as { current: HTMLDivElement | null }).current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as { current: HTMLDivElement | null }).current = node;
        }
      },
      [ref],
    );

    return (
      <div className={cn(styles.Wrapper, className)} {...rest}>
        <div
          ref={setRef}
          className={styles.Root}
          onScroll={handleScroll}
        >
          <div
            className={styles.Inner}
            style={{ height: `${virtualizer.getTotalSize()}px` }}
          >
            {virtualizer.getVirtualItems().map((item) => (
              <div
                key={item.key}
                className={styles.Item}
                data-index={item.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${item.start}px)`,
                }}
              >
                {renderItem(item.index)}
              </div>
            ))}
          </div>
        </div>
        {showNewIndicator && (
          <button
            type="button"
            className={styles.NewMessages}
            onClick={scrollToBottom}
          >
            ↓ New messages
          </button>
        )}
      </div>
    );
  },
);
