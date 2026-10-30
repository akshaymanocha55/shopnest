import { queryOptions } from '@tanstack/react-query';
import { CACHE } from '@/constants';
import { productService } from '../product.service';

/**
 * TanStack Query keys + options in one place, so the PLP, header search and PDP
 * share the same cache entry (one network request for all of them).
 */
export const productKeys = {
  all: ['products'] as const,
  list: () => [...productKeys.all, 'list'] as const,
};

export const productQueries = {
  list: () =>
    queryOptions({
      queryKey: productKeys.list(),
      queryFn: ({ signal }) => productService.getAll({ signal }),
      staleTime: CACHE.productsStaleTime,
      gcTime: CACHE.productsGcTime,
    }),
};
