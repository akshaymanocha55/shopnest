import {
  applyFilters,
  countActiveFilters,
  DEFAULT_FILTERS,
  filtersToSearchParams,
  matchesQuery,
  parseFilters,
} from '@/lib/product-filters';
import { jacket, products } from '@/test-utils/fixtures';

describe('parseFilters', () => {
  it('returns defaults for an empty query', () => {
    expect(parseFilters(new URLSearchParams())).toEqual(DEFAULT_FILTERS);
  });

  it('parses valid values and ignores invalid ones', () => {
    const filters = parseFilters(
      new URLSearchParams('q=jacket&category=jewellery,bogus&min=100&max=abc&rating=4&sort=nope'),
    );
    expect(filters).toMatchObject({
      q: 'jacket',
      categories: ['jewellery'],
      minPrice: 100,
      maxPrice: null,
      minRating: 4,
      sort: 'featured',
    });
  });

  it('round-trips through filtersToSearchParams', () => {
    const filters = {
      ...DEFAULT_FILTERS,
      q: 'ssd',
      categories: ['electronics' as const],
      sort: 'price-asc' as const,
    };
    expect(parseFilters(filtersToSearchParams(filters))).toEqual(filters);
  });

  it('drops default values from the query string', () => {
    expect(filtersToSearchParams(DEFAULT_FILTERS).toString()).toBe('');
  });
});

describe('applyFilters', () => {
  it('filters by category', () => {
    const result = applyFilters(products, { ...DEFAULT_FILTERS, categories: ['jewellery'] });
    expect(result).toHaveLength(4);
    expect(result.every((p) => p.category === 'jewellery')).toBe(true);
  });

  it('filters by price range (inclusive)', () => {
    const result = applyFilters(products, { ...DEFAULT_FILTERS, minPrice: 1000, maxPrice: 5000 });
    expect(result.every((p) => p.price >= 1000 && p.price <= 5000)).toBe(true);
  });

  it('filters by minimum rating', () => {
    const result = applyFilters(products, { ...DEFAULT_FILTERS, minRating: 4.5 });
    expect(result.every((p) => p.rating >= 4.5)).toBe(true);
  });

  it('sorts by price ascending and descending', () => {
    const asc = applyFilters(products, { ...DEFAULT_FILTERS, sort: 'price-asc' }).map(
      (p) => p.price,
    );
    const desc = applyFilters(products, { ...DEFAULT_FILTERS, sort: 'price-desc' }).map(
      (p) => p.price,
    );
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  it('does not mutate the input array', () => {
    const copy = [...products];
    applyFilters(products, { ...DEFAULT_FILTERS, sort: 'price-asc' });
    expect(products).toEqual(copy);
  });

  it('returns an empty list when nothing matches', () => {
    expect(applyFilters(products, { ...DEFAULT_FILTERS, q: 'zzzz-not-a-product' })).toEqual([]);
  });
});

describe('matchesQuery', () => {
  it('matches every word, case-insensitively, across title and sub-category', () => {
    expect(matchesQuery(jacket, 'COTTON jacket')).toBe(true);
    expect(matchesQuery(jacket, 'cotton monitor')).toBe(false);
  });
});

describe('countActiveFilters', () => {
  it('counts categories, sub-category, price and rating', () => {
    expect(
      countActiveFilters({
        ...DEFAULT_FILTERS,
        categories: ['jewellery', 'electronics'],
        minPrice: 10,
        minRating: 3,
      }),
    ).toBe(4);
  });
});
