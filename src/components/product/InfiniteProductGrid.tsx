'use client';

import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { Product } from '@/types/product';
import { Button } from '../ui/Button';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface InfiniteProductGridProps {
  products: Product[];
  total: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

const GRID = 'grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3';
/** Start loading the next page when this many rows are left below the viewport. */
const PREFETCH_ROWS = 2;

function useColumnCount() {
  // Matches the GRID classes: 2 columns on mobile, 3 from md (the sidebar takes the rest).
  return useMediaQuery('(min-width: 768px)', true) ? 3 : 2;
}

/**
 * Infinite scroll + window virtualization.
 * - Only rows near the viewport are in the DOM (TanStack Virtual), so 20 or 20,000 products
 *   scroll equally smoothly.
 * - When the user nears the last loaded row, the next page is fetched.
 * - A "Load more" button is kept as a fallback for keyboard users and if auto-loading is missed.
 */
export function InfiniteProductGrid({
  products,
  total,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: InfiniteProductGridProps) {
  const columns = useColumnCount();
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  // Products from the first (server-rendered) page are not animated in.
  const [firstPageCount] = useState(products.length);

  const rows = useMemo(() => {
    const result: Product[][] = [];
    for (let i = 0; i < products.length; i += columns) result.push(products.slice(i, i + columns));
    return result;
  }, [products, columns]);

  // Distance from the top of the page to the list; re-measured when content above it changes.
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const measure = () => setScrollMargin(el.getBoundingClientRect().top + window.scrollY);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 470,
    overscan: 2,
    scrollMargin,
    // Render the first rows during SSR so the page is not empty before hydration.
    initialRect: { width: 1280, height: 1600 },
  });

  const virtualRows = virtualizer.getVirtualItems();
  const lastVisibleRow = virtualRows.at(-1)?.index ?? 0;

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Auto-load when the virtualizer reaches the last loaded rows.
  useEffect(() => {
    if (lastVisibleRow >= rows.length - PREFETCH_ROWS) loadMore();
  }, [lastVisibleRow, rows.length, loadMore]);

  return (
    <>
      <div ref={listRef} className="relative" style={{ height: virtualizer.getTotalSize() }}>
        {virtualRows.map((row) => (
          <div
            key={row.key}
            data-index={row.index}
            ref={virtualizer.measureElement}
            className={`${GRID} absolute inset-x-0 top-0 pb-3 sm:pb-5`}
            style={{ transform: `translateY(${row.start - virtualizer.options.scrollMargin}px)` }}
          >
            {rows[row.index].map((product, col) => {
              const index = row.index * columns + col;
              const isNew = index >= firstPageCount;
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 3}
                  // Cards from later pages fade in as they arrive.
                  className={isNew ? 'animate-rise' : undefined}
                  style={isNew ? { animationDelay: `${(col % columns) * 60}ms` } : undefined}
                />
              );
            })}
          </div>
        ))}
      </div>

      {isFetchingNextPage && (
        <div className={`${GRID} mt-3 sm:mt-5`} aria-busy aria-label="Loading more products">
          {Array.from({ length: columns }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-ink-500" aria-live="polite">
          Showing {products.length} of {total} products
        </p>
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-mist">
          <div
            className="h-full rounded-full bg-ink-800 transition-[width] duration-500"
            style={{ width: `${total ? (products.length / total) * 100 : 0}%` }}
          />
        </div>
        {hasNextPage ? (
          <Button variant="secondary" onClick={loadMore} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? <Loader2 className="size-4 animate-spin" /> : null}
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        ) : (
          products.length > 0 && (
            <p className="text-sm font-medium text-ink-400">You’ve seen everything</p>
          )
        )}
      </div>
    </>
  );
}
