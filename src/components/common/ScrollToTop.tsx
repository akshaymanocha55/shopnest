'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Every new page starts at the top. Next.js 16 keeps the scroll position when the new page is
 * already "visible", which felt wrong when opening a product from a scrolled listing.
 * Back/forward navigation is left alone, so the browser restores the previous position.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const isHistoryNavigation = useRef(false);
  const firstRender = useRef(true);

  useEffect(() => {
    const onPopState = () => {
      isHistoryNavigation.current = true;
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (isHistoryNavigation.current) {
      isHistoryNavigation.current = false;
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
