'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useTransition } from 'react';
import { DEFAULT_FILTERS, filtersToSearchParams, parseFilters } from '@/lib/product-filters';
import type { ProductFilters } from '@/types/product';

/**
 * Filters live in the URL (shareable links, back button works, SEO-friendly).
 * Updates use history.replaceState, which Next.js syncs with useSearchParams without a server
 * round-trip, wrapped in a transition so typing and clicking stay responsive (good INP).
 */
export function useProductFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const setFilters = useCallback(
    (update: Partial<ProductFilters> | ((prev: ProductFilters) => Partial<ProductFilters>)) => {
      const current = parseFilters(new URLSearchParams(window.location.search));
      const changes = typeof update === 'function' ? update(current) : update;
      const query = filtersToSearchParams({ ...current, ...changes }).toString();
      startTransition(() => {
        window.history.replaceState(null, '', query ? `${pathname}?${query}` : pathname);
      });
    },
    [pathname],
  );

  const resetFilters = useCallback(() => setFilters({ ...DEFAULT_FILTERS, q: '' }), [setFilters]);

  return { filters, setFilters, resetFilters, isPending };
}
