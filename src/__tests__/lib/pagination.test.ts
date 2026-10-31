import { LIMITS } from '@/constants';
import { applyFilters, DEFAULT_FILTERS, parseFilters } from '@/lib/product-filters';
import { toPage } from '@/services/queries/product.queries';
import { products } from '@/test-utils/fixtures';

describe('infinite scroll pages', () => {
  it('splits the filtered list into pages with a next-page pointer', () => {
    const first = toPage(products, DEFAULT_FILTERS, 0);
    expect(first.items).toHaveLength(LIMITS.pageSize);
    expect(first.total).toBe(products.length);
    expect(first.nextPage).toBe(1);

    const pages = Math.ceil(products.length / LIMITS.pageSize);
    const last = toPage(products, DEFAULT_FILTERS, pages - 1);
    expect(last.nextPage).toBeNull();
  });

  it('pages contain every product exactly once', () => {
    const ids: number[] = [];
    for (let page = 0, next: number | null = 0; next !== null; page++) {
      const result = toPage(products, DEFAULT_FILTERS, page);
      ids.push(...result.items.map((p) => p.id));
      next = result.nextPage;
    }
    expect(new Set(ids).size).toBe(products.length);
  });

  it('applies filters before paging', () => {
    const filters = { ...DEFAULT_FILTERS, categories: ['jewellery' as const] };
    expect(toPage(products, filters, 0)).toMatchObject({ total: 4, nextPage: null });
  });
});

describe('stock', () => {
  it('marks product 16 as out of stock and sorts it last', () => {
    expect(products.find((p) => p.id === 16)?.inStock).toBe(false);
    const sorted = applyFilters(products, { ...DEFAULT_FILTERS, sort: 'price-asc' });
    expect(sorted.at(-1)?.id).toBe(16);
  });

  it('hides sold-out items with the in-stock filter', () => {
    const filters = parseFilters(new URLSearchParams('instock=1'));
    expect(filters.inStockOnly).toBe(true);
    expect(applyFilters(products, filters).some((p) => !p.inStock)).toBe(false);
  });
});
