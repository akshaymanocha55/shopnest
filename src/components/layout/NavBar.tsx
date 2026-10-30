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
const CLOSE_DELAY = 180;

/** Desktop category bar. Hover or keyboard focus opens a full-width mega menu. */
export function NavBar() {
  const [active, setActive] = useState<CategorySlug | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const schedule = useCallback((next: CategorySlug | null, delay: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(next), delay);
  }, []);

  const close = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setActive(null);
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, close]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <nav
      aria-label="Categories"
      className="relative hidden border-t border-mist lg:block"
      onMouseLeave={() => schedule(null, CLOSE_DELAY)}
    >
      <ul className="container-page flex h-12 items-center gap-1">
        <li>
          <Link
            href={ROUTES.products}
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
              onMouseEnter={() => schedule(category.slug, active ? 0 : OPEN_DELAY)}
            >
              <button
                type="button"
                aria-expanded={isActive}
                aria-haspopup="true"
                onClick={() => setActive(isActive ? null : category.slug)}
                onFocus={() => setActive(category.slug)}
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
        <li className="ml-auto">
          <Link
            href={`${ROUTES.products}?${FILTER_PARAMS.sort}=discount`}
            className="flex h-12 items-center px-3 text-sm font-semibold text-marigold-600 transition hover:text-marigold-500"
          >
            Today’s deals
          </Link>
        </li>
      </ul>

      {active && (
        <div
          className="absolute inset-x-0 top-full z-40 border-t border-mist bg-white shadow-pop"
          onMouseEnter={() => schedule(active, 0)}
        >
          <MegaMenuPanel category={active} onNavigate={close} />
        </div>
      )}
    </nav>
  );
}
