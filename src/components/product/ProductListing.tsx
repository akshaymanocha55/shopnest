'use client';

import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { PackageSearch, SlidersHorizontal } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { CATEGORY_BY_SLUG } from '@/constants';
import { useProductFilters } from '@/hooks/useProductFilters';
import { countActiveFilters } from '@/lib/product-filters';
import { cn } from '@/lib/utils';
import { productQueries } from '@/services/queries/product.queries';
import type { Product, ProductFilters, SortOption } from '@/types/product';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { ActiveFilters } from './filters/ActiveFilters';
import { FiltersPanel } from './filters/FiltersPanel';
import { SortSelect } from './filters/SortSelect';
import { InfiniteProductGrid } from './InfiniteProductGrid';

const MobileFiltersSheet = dynamic(() => import('./filters/MobileFiltersSheet'), { ssr: false });

function headingFor(filters: ProductFilters): string {
  if (filters.q) return `Results for “${filters.q}”`;
  if (filters.sub) return filters.sub;
  if (filters.categories.length === 1) return CATEGORY_BY_SLUG[filters.categories[0]].label;
  return 'All products';
}

/**
 * Product listing: search, filters and sort live in the URL; results load page by page
 * (infinite scroll) and render through a virtualized grid.
 * Server-rendered data seeds the first page, so there is no loading flash and the first
 * products are in the HTML for search engines.
 */
export function ProductListing({ initialProducts }: { initialProducts: Product[] }) {
  const queryClient = useQueryClient();
  const { filters, setFilters, resetFilters, isPending } = useProductFilters();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Full catalogue (shared cache) for filter counts and the price slider bounds.
  const { data: catalogue = initialProducts } = useQuery({
    ...productQueries.list(),
    initialData: initialProducts,
  });

  // Querying with the deferred filters keeps clicks responsive (better INP).
  const deferredFilters = useDeferredValue(filters);
  const pagesQuery = useInfiniteQuery(
    productQueries.pages(deferredFilters, queryClient, initialProducts),
  );
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isError, refetch } = pagesQuery;

  const products = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const total = data?.pages[0]?.total ?? 0;
  const isStale = isPending || deferredFilters !== filters;

  const onSortChange = useCallback((sort: SortOption) => setFilters({ sort }), [setFilters]);
  const onLoadMore = useCallback(() => void fetchNextPage(), [fetchNextPage]);
  const closeSheet = useCallback(() => setSheetOpen(false), []);
  const activeCount = countActiveFilters(filters);

  return (
    <div className="container-page py-8 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">{headingFor(filters)}</h1>
          <p className="mt-1 text-ink-500" aria-live="polite">
            {total} {total === 1 ? 'product' : 'products'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="h-10 lg:hidden"
            onClick={() => setSheetOpen(true)}
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {activeCount > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-marigold-400 text-[11px] font-bold text-ink-900">
                {activeCount}
              </span>
            )}
          </Button>
          <SortSelect value={filters.sort} onChange={onSortChange} />
        </div>
      </div>

      <div className="mt-5">
        <ActiveFilters filters={filters} onChange={setFilters} onClear={resetFilters} />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[270px_1fr]">
        <aside aria-label="Filters" className="hidden lg:block">
          {/* Sticks just below the header; moves up when the header hides (see Header.tsx). */}
          <div className="no-scrollbar sticky-below-header max-h-[calc(100dvh-var(--sticky-top,9rem)-24px)] overflow-y-auto rounded-[var(--radius-card)] bg-white p-5 shadow-lift ring-1 ring-mist">
            <FiltersPanel
              products={catalogue}
              filters={filters}
              onChange={setFilters}
              onClear={resetFilters}
            />
          </div>
        </aside>

        <section
          aria-label="Products"
          className={cn('min-w-0 transition-opacity duration-200', isStale && 'opacity-60')}
        >
          {isError && (
            <p className="mb-4 rounded-xl bg-marigold-50 px-4 py-3 text-sm text-ink-700">
              Some products could not be loaded.{' '}
              <button type="button" onClick={() => refetch()} className="font-semibold underline">
                Try again
              </button>
            </p>
          )}
          <ErrorBoundary title="Products could not be displayed">
            {products.length > 0 ? (
              <InfiniteProductGrid
                products={products}
                total={total}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={onLoadMore}
              />
            ) : (
              <EmptyState
                icon={<PackageSearch />}
                title="No products match these filters"
                description={
                  filters.q
                    ? `Nothing matches “${filters.q}”. Try a different word, or remove a filter.`
                    : 'Try removing a filter or widening the price range.'
                }
                action={<Button onClick={resetFilters}>Clear all filters</Button>}
                className="rounded-[var(--radius-card)] bg-white ring-1 ring-mist"
              />
            )}
          </ErrorBoundary>
        </section>
      </div>

      {sheetOpen && (
        <MobileFiltersSheet
          products={catalogue}
          filters={filters}
          resultCount={total}
          onChange={setFilters}
          onClear={resetFilters}
          onClose={closeSheet}
        />
      )}
    </div>
  );
}
