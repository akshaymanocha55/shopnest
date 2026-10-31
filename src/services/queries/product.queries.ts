import { infiniteQueryOptions, queryOptions, type QueryClient } from '@tanstack/react-query';
import { CACHE, LIMITS } from '@/constants';
import { applyFilters, filtersToSearchParams } from '@/lib/product-filters';
import { sleep } from '@/lib/utils';
import type { Product, ProductFilters } from '@/types/product';
import { productService } from '../product.service';

/**
 * TanStack Query keys + options in one place, so the PLP, header search and PDP
 * share the same cache entry (one network request for all of them).
 */
export const productKeys = {
  all: ['products'] as const,
  list: () => [...productKeys.all, 'list'] as const,
  pages: (filters: ProductFilters) =>
    [...productKeys.all, 'pages', filtersToSearchParams(filters).toString()] as const,
};

export interface ProductPage {
  items: Product[];
  total: number;
  nextPage: number | null;
}

/** Slice one page out of an already-filtered list. */
export function toPage(products: Product[], filters: ProductFilters, page: number): ProductPage {
  const filtered = applyFilters(products, filters);
  const start = page * LIMITS.pageSize;
  const end = start + LIMITS.pageSize;
  return {
    items: filtered.slice(start, end),
    total: filtered.length,
    nextPage: end < filtered.length ? page + 1 : null,
  };
}

export const productQueries = {
  list: () =>
    queryOptions({
      queryKey: productKeys.list(),
      queryFn: ({ signal }) => productService.getAll({ signal }),
      staleTime: CACHE.productsStaleTime,
      gcTime: CACHE.productsGcTime,
    }),

  /**
   * Paginated product list for infinite scroll.
   *
   * FakeStore has no server-side pagination or filtering, so this acts as a mock paginated
   * endpoint: it reads the cached catalogue and returns one page with a realistic delay.
   * With a real API, only `queryFn` changes, to `GET /products?page=&limit=&category=…`.
   */
  pages: (filters: ProductFilters, queryClient: QueryClient, initialProducts?: Product[]) =>
    infiniteQueryOptions({
      queryKey: productKeys.pages(filters),
      initialPageParam: 0,
      queryFn: async ({ pageParam }) => {
        const products = await queryClient.ensureQueryData(productQueries.list());
        if (pageParam > 0) await sleep(LIMITS.pageLoadDelayMs);
        return toPage(products, filters, pageParam);
      },
      getNextPageParam: (lastPage) => lastPage.nextPage,
      // The first page is computed from server-rendered data, so it is in the HTML (SEO, LCP).
      initialData: initialProducts
        ? { pages: [toPage(initialProducts, filters, 0)], pageParams: [0] }
        : undefined,
      staleTime: CACHE.productsStaleTime,
    }),
};
