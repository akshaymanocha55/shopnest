import { useEffect, useRef, useState } from 'react';
import { TIMING } from '@/constants';
import { useThrottledCallback } from './useThrottledCallback';

interface ScrollState {
  scrolled: boolean;
  hidden: boolean;
  showBackToTop: boolean;
}

const isSame = (a: ScrollState, b: ScrollState) =>
  a.scrolled === b.scrolled && a.hidden === b.hidden && a.showBackToTop === b.showBackToTop;

/** Throttled scroll tracking for the sticky header and back-to-top button. */
export function useScrollState(threshold = 8): ScrollState {
  const [state, setState] = useState<ScrollState>({
    scrolled: false,
    hidden: false,
    showBackToTop: false,
  });
  const lastYRef = useRef(0);

  const onScroll = useThrottledCallback(() => {
    const y = window.scrollY;
    const next: ScrollState = {
      scrolled: y > threshold,
      hidden: y > 160 && y > lastYRef.current,
      showBackToTop: y > 800,
    };
    lastYRef.current = y;
    // Returning the previous object skips the re-render when nothing visible changed.
    setState((prev) => (isSame(prev, next) ? prev : next));
  }, TIMING.scrollThrottleMs);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return state;
}
