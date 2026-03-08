import { useCallback, useEffect, useRef, useState, type WheelEvent } from 'react';
import type { ScrollState } from '../context/EditorTabsContext';

const SCROLL_AMOUNT = 200;

function computeScrollState(el: HTMLElement): ScrollState {
  const { scrollLeft, scrollWidth, clientWidth } = el;
  return {
    canScrollLeft: scrollLeft > 1,
    canScrollRight: scrollLeft + clientWidth < scrollWidth - 1,
  };
}

export function useTabScroll() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [scrollState, setScrollState] = useState<ScrollState>({
    canScrollLeft: false,
    canScrollRight: false,
  });

  const updateScrollState = useCallback(() => {
    const el = viewportRef.current;
    if (el) {
      const next = computeScrollState(el);
      setScrollState((prev) => {
        if (
          prev.canScrollLeft === next.canScrollLeft &&
          prev.canScrollRight === next.canScrollRight
        ) {
          return prev;
        }
        return next;
      });
    }
  }, []);

  const scrollTo = useCallback((direction: 'left' | 'right') => {
    const el = viewportRef.current;
    if (!el) return;
    const delta = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    const el = viewportRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    if (e.deltaY > 0 && el.scrollLeft >= maxScroll) return;
    if (e.deltaY < 0 && el.scrollLeft <= 0) return;
    e.preventDefault();
    el.scrollLeft += e.deltaY;
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    updateScrollState();

    el.addEventListener('scroll', updateScrollState, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);

    const mutationObserver = new MutationObserver(updateScrollState);
    mutationObserver.observe(el, { childList: true, subtree: true });

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [updateScrollState]);

  return { scrollState, scrollTo, handleWheel, viewportRef };
}
