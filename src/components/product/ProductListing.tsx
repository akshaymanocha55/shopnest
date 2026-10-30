'use client';

import { useQuery } from '@tanstack/react-query';
import { PackageSearch, SlidersHorizontal } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { CATEGORY_BY_SLUG } from '@/constants';
import { useProductFilters } from '@/hooks/useProductFilters';
import { applyFilters, countActiveFilters } from '@/lib/product-filters';
import { cn } from '@/lib/utils';
import { productQueries } from '@/services/queries/product.queries';
import type { Product, ProductFilters, SortOption } from '@/types/product';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { ActiveFilters } from './filters/ActiveFilters';
import { FiltersPanel } from './filters/FiltersPanel';
import { SortSelect } from './filters/SortSelect';
import { ProductGrid } from './ProductGrid';

const MobileFiltersSheet = dynamic(() => import('./filters/MobileFiltersSheet'), { ssr: false });

function headingFor(filters: ProductFilters): string {
  if (filters.q) return `Results for “${filters.q}”`;
  if (filters.sub) return filters.sub;
  if (filters.categories.length === 1) return CATEGORY_BY_SLUG[filters.categories[0]].label;
  return 'All products';
}

/**
 * Product listing: search, filters and sort, all driven by URL params.
 * Server-rendered data seeds the TanStack Query cache (`initialData`) so there is no loading
 * flash, and filtering is a memoised pure function over the cached list.
 */
export function ProductListing({ initialProducts }: { initialProducts: Product[] }) {
  const {
    data: products = initialProducts,
    isError,
    refetch,
  } = useQuery({
    ...productQueries.list(),
    initialData: initialProducts,
  });
  const { filters, setFilters, resetFilters, isPending } = useProductFilters();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Filtering runs against the deferred value, so clicks paint first (better INP).
  const deferredFilters = useDeferredValue(filters);
  const results = useMemo(
    () => applyFilters(products, deferredFilters),
    [products, deferredFilters],
  );
  const isStale = isPending || deferredFilters !== filters;

  const onSortChange = useCallback((sort: SortOption) => setFilters({ sort }), [setFilters]);
  const closeSheet = useCallback(() => setSheetOpen(false), []);
  const activeCount = countActiveFilters(filters);

  return (
    <div className="container-page py-8 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">{headingFor(filters)}</h1>
          <p className="mt-1 text-ink-500" aria-live="polite">
            {results.length} {results.length === 1 ? 'product' : 'products'}
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

      <div className="mt-6 grid gap-8 lg:grid-cols-[250px_1fr]">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-36 rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-mist">
            <FiltersPanel products={products} filters={filters} onChange={setFilters} />
          </div>
        </aside>

        <section
          aria-label="Products"
          className={cn('transition-opacity duration-200', isStale && 'opacity-60')}
        >
          {isError && (
            <p className="mb-4 rounded-xl bg-marigold-50 px-4 py-3 text-sm text-ink-700">
              Showing saved results. Live prices could not be refreshed.{' '}
              <button type="button" onClick={() => refetch()} className="font-semibold underline">
                Retry
              </button>
            </p>
          )}
          <ErrorBoundary title="Products could not be displayed">
            {results.length > 0 ? (
              <ProductGrid products={results} />
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
          products={products}
          filters={filters}
          resultCount={results.length}
          onChange={setFilters}
          onClear={resetFilters}
          onClose={closeSheet}
        />
      )}
    </div>
  );
}
