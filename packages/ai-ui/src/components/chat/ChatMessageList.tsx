import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type HTMLAttributes,
} from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button } from '@omniview/base-ui';
import { cn } from '../../system/classnames';
import { LuArrowDown } from '../../system/icons';
import styles from './ChatMessageList.module.css';

export interface ChatMessageListHandle {
  scrollToBottom: () => void;
  scrollToIndex: (index: number) => void;
  getScrollElement: () => HTMLDivElement | null;
}

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

export const ChatMessageList = forwardRef<ChatMessageListHandle, ChatMessageListProps>(
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
      useAnimationFrameWithResizeObserver: true,
    });

    const scrollToBottom = useCallback(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        setIsAtBottom(true);
        setShowNewIndicator(false);
      }
    }, []);

    useImperativeHandle(ref, () => ({
      scrollToBottom,
      scrollToIndex: (index: number) => {
        virtualizer.scrollToIndex(index, { align: 'start' });
      },
      getScrollElement: () => scrollRef.current,
    }), [scrollToBottom, virtualizer]);

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
          requestAnimationFrame(scrollToBottom);
        } else if (!isAtBottom) {
          setShowNewIndicator(true);
        }
      }
      prevCountRef.current = count;
    }, [count, autoScroll, isAtBottom, scrollToBottom]);

    // Auto-scroll when content height changes during streaming.
    // When the user is pinned to the bottom and a message grows (e.g.
    // ThinkingBlock/AIMarkdown streaming), keep the viewport pinned
    // so the user doesn't have to manually chase the content.
    const totalSize = virtualizer.getTotalSize();
    const prevTotalSizeRef = useRef(totalSize);
    useEffect(() => {
      if (totalSize !== prevTotalSizeRef.current) {
        prevTotalSizeRef.current = totalSize;
        if (autoScroll && isAtBottom) {
          requestAnimationFrame(scrollToBottom);
        }
      }
    }, [totalSize, autoScroll, isAtBottom, scrollToBottom]);

    return (
      <div className={cn(styles.Wrapper, className)} {...rest}>
        <div
          ref={scrollRef}
          className={styles.Root}
          onScroll={handleScroll}
        >
          <div
            className={styles.Inner}
            style={{ height: `${virtualizer.getTotalSize()}px` }} // eslint-disable-line react/forbid-component-props -- required by virtualizer
          >
            {virtualizer.getVirtualItems().map((item) => (
              <div
                key={item.key}
                className={styles.Item}
                data-index={item.index}
                ref={virtualizer.measureElement}
                style={{ // eslint-disable-line react/forbid-component-props -- required by virtualizer
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
          <Button
            size="sm"
            variant="soft"
            color="brand"
            className={styles.NewMessages}
            onClick={scrollToBottom}
          >
            <LuArrowDown size={14} /> New messages
          </Button>
        )}
      </div>
    );
  },
);
