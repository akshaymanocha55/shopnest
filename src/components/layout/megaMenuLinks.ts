import { FILTER_PARAMS, ROUTES } from '@/constants';
import type { CategorySlug, SortOption } from '@/types/product';

export function categoryHref(
  category: CategorySlug,
  options: { sub?: string; sort?: SortOption } = {},
) {
  const params = new URLSearchParams({ [FILTER_PARAMS.category]: category });
  if (options.sub) params.set(FILTER_PARAMS.sub, options.sub);
  if (options.sort) params.set(FILTER_PARAMS.sort, options.sort);
  return `${ROUTES.products}?${params}`;
}
