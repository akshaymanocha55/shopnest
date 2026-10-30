'use client';

import { ChevronDown } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CATEGORIES, FILTER_PARAMS, ROUTES } from '@/constants';
import { cn } from '@/lib/utils';
import type { CategorySlug } from '@/types/product';

const MegaMenuPanel = dynamic(() => import('./MegaMenuPanel'), {
  ssr: false,
  loading: () => <div className="container-page h-56" />,
});

const OPEN_DELAY = 120;
const CLOSE_DELAY = 150;

/**
 * Desktop category bar with a full-width mega menu.
 * - Opens on hover (short delay so passing the cursor over it does not flash it open).
 * - Closes as soon as the pointer leaves the bar + panel, after any click inside the panel,
 *   on navigation, on Escape, on scroll and on a click outside.
 * - Click / Enter / Space on a category toggles it for touch and keyboard users.
 */
export function NavBar() {
  const [active, setActive] = useState<CategorySlug | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const close = useCallback(() => {
    clearTimer();
    setActive(null);
  }, [clearTimer]);

  const openWithDelay = useCallback(
    (slug: CategorySlug) => {
      clearTimer();
      // Switching between categories while open is instant.
      timer.current = setTimeout(() => setActive(slug), active ? 0 : OPEN_DELAY);
    },
    [active, clearTimer],
  );

  const closeWithDelay = useCallback(() => {
    clearTimer();
    timer.current = setTimeout(() => setActive(null), CLOSE_DELAY);
  }, [clearTimer]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) close();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('scroll', close, { passive: true });
    // Back/forward navigation. Link clicks are handled by onNavigate below.
    window.addEventListener('popstate', close);
    return () => {
      window.removeEventListener('popstate', close);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('scroll', close);
    };
  }, [active, close]);

  useEffect(() => clearTimer, [clearTimer]);

  /** Any click on a link inside the panel closes it and drops focus, so nothing keeps it open. */
  const onNavigate = useCallback(() => {
    close();
    (document.activeElement as HTMLElement | null)?.blur();
  }, [close]);

  return (
    <nav
      ref={navRef}
      aria-label="Categories"
      className="relative hidden border-t border-mist lg:block"
      onPointerLeave={(e) => e.pointerType === 'mouse' && closeWithDelay()}
    >
      <ul className="container-page flex h-12 items-center gap-1">
        <li onPointerEnter={(e) => e.pointerType === 'mouse' && closeWithDelay()}>
          <Link
            href={ROUTES.products}
            onClick={onNavigate}
            className="flex h-12 items-center px-3 text-sm font-semibold text-ink-700 transition hover:text-ink-900"
          >
            All products
          </Link>
        </li>
        {CATEGORIES.map((category) => {
          const isActive = active === category.slug;
          return (
            <li
              key={category.slug}
              onPointerEnter={(e) => e.pointerType === 'mouse' && openWithDelay(category.slug)}
            >
              <button
                type="button"
                aria-expanded={isActive}
                aria-controls="mega-menu"
                onClick={() => {
                  clearTimer();
                  setActive(isActive ? null : category.slug);
                }}
                className={cn(
                  'relative flex h-12 items-center gap-1 px-3 text-sm font-semibold transition-colors',
                  isActive ? 'text-ink-900' : 'text-ink-600 hover:text-ink-900',
                )}
              >
                {category.shortLabel}
                <ChevronDown
                  className={cn(
                    'size-4 transition-transform duration-200',
                    isActive && 'rotate-180',
                  )}
                  aria-hidden
                />
                <span
                  className={cn(
                    'absolute inset-x-3 bottom-0 h-0.5 origin-left rounded-full bg-marigold-400 transition-transform duration-300',
                    isActive ? 'scale-x-100' : 'scale-x-0',
                  )}
                />
              </button>
            </li>
          );
        })}
        <li
          className="ml-auto"
          onPointerEnter={(e) => e.pointerType === 'mouse' && closeWithDelay()}
        >
          <Link
            href={`${ROUTES.products}?${FILTER_PARAMS.sort}=discount`}
            onClick={onNavigate}
            className="flex h-12 items-center px-3 text-sm font-semibold text-marigold-600 transition hover:text-marigold-500"
          >
            Today’s deals
          </Link>
        </li>
      </ul>

      {active && (
        <div
          id="mega-menu"
          className="absolute inset-x-0 top-full z-40 border-t border-mist bg-white shadow-pop"
          onPointerEnter={clearTimer}
          onClickCapture={(e) => {
            if ((e.target as HTMLElement).closest('a')) onNavigate();
          }}
        >
          <MegaMenuPanel category={active} onNavigate={onNavigate} />
        </div>
      )}
    </nav>
  );
}
