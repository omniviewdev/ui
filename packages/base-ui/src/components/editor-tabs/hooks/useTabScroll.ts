import { useCallback, useEffect, useRef, useState } from 'react';
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
      setScrollState(computeScrollState(el));
    }
  }, []);

  const scrollTo = useCallback((direction: 'left' | 'right') => {
    const el = viewportRef.current;
    if (!el) return;
    const delta = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const el = viewportRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    }
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    updateScrollState();

    el.addEventListener('scroll', updateScrollState, { passive: true });

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState]);

  return { scrollState, scrollTo, handleWheel, viewportRef };
}
