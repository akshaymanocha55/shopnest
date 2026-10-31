import { CATEGORIES, FILTER_PARAMS, SORT_OPTIONS } from '@/constants';
import type { CategorySlug, Product, ProductFilters, SortOption } from '@/types/product';

export const DEFAULT_FILTERS: ProductFilters = {
  q: '',
  categories: [],
  sub: '',
  minPrice: null,
  maxPrice: null,
  minRating: null,
  inStockOnly: false,
  sort: 'featured',
};

const VALID_CATEGORIES = new Set<string>(CATEGORIES.map((c) => c.slug));
const VALID_SORTS = new Set<string>(SORT_OPTIONS.map((s) => s.value));

function toNumber(value: string | null | undefined): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

type ParamReader = { get(name: string): string | null };

/** Parse URL search params into a safe, typed filter object. */
export function parseFilters(params: ParamReader): ProductFilters {
  const categories = (params.get(FILTER_PARAMS.category) ?? '')
    .split(',')
    .filter((c): c is CategorySlug => VALID_CATEGORIES.has(c));
  const sort = params.get(FILTER_PARAMS.sort) ?? '';

  return {
    q: (params.get(FILTER_PARAMS.q) ?? '').trim().slice(0, 100),
    categories,
    sub: (params.get(FILTER_PARAMS.sub) ?? '').trim(),
    minPrice: toNumber(params.get(FILTER_PARAMS.minPrice)),
    maxPrice: toNumber(params.get(FILTER_PARAMS.maxPrice)),
    minRating: toNumber(params.get(FILTER_PARAMS.rating)),
    inStockOnly: params.get(FILTER_PARAMS.inStock) === '1',
    sort: VALID_SORTS.has(sort) ? (sort as SortOption) : 'featured',
  };
}

/** Serialise filters back into a query string, dropping defaults. */
export function filtersToSearchParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set(FILTER_PARAMS.q, filters.q);
  if (filters.categories.length) params.set(FILTER_PARAMS.category, filters.categories.join(','));
  if (filters.sub) params.set(FILTER_PARAMS.sub, filters.sub);
  if (filters.minPrice != null) params.set(FILTER_PARAMS.minPrice, String(filters.minPrice));
  if (filters.maxPrice != null) params.set(FILTER_PARAMS.maxPrice, String(filters.maxPrice));
  if (filters.minRating != null) params.set(FILTER_PARAMS.rating, String(filters.minRating));
  if (filters.inStockOnly) params.set(FILTER_PARAMS.inStock, '1');
  if (filters.sort !== 'featured') params.set(FILTER_PARAMS.sort, filters.sort);
  return params;
}

export function countActiveFilters(filters: ProductFilters): number {
  return (
    filters.categories.length +
    (filters.sub ? 1 : 0) +
    (filters.minPrice != null || filters.maxPrice != null ? 1 : 0) +
    (filters.minRating != null ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0)
  );
}

/** Case-insensitive match on title, category and sub-category. Every word must match. */
export function matchesQuery(product: Product, query: string): boolean {
  if (!query) return true;
  const haystack = `${product.title} ${product.categoryLabel} ${product.subcategory}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

const sorters: Record<SortOption, (a: Product, b: Product) => number> = {
  featured: (a, b) => b.rating * Math.log(b.ratingCount) - a.rating * Math.log(a.ratingCount),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount,
  discount: (a, b) => b.discountPercent - a.discountPercent,
  newest: (a, b) => b.id - a.id,
};

/** Pure function: apply search, filters and sorting. Easy to unit-test and memoise. */
export function applyFilters(products: Product[], filters: ProductFilters): Product[] {
  const categories = new Set(filters.categories);
  return (
    products
      .filter(
        (p) =>
          (categories.size === 0 || categories.has(p.category)) &&
          (!filters.sub || p.subcategory === filters.sub) &&
          (filters.minPrice == null || p.price >= filters.minPrice) &&
          (filters.maxPrice == null || p.price <= filters.maxPrice) &&
          (filters.minRating == null || p.rating >= filters.minRating) &&
          (!filters.inStockOnly || p.inStock) &&
          matchesQuery(p, filters.q),
      )
      .sort(sorters[filters.sort])
      // Sold-out items always go to the end (sort is stable, so order is otherwise kept).
      .sort((a, b) => Number(b.inStock) - Number(a.inStock))
  );
}
