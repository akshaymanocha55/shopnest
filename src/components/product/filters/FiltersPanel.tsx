'use client';

import { SlidersHorizontal, Star } from 'lucide-react';
import { memo, useMemo } from 'react';
import { CATEGORIES, RATING_FILTERS } from '@/constants';
import { applyFilters, countActiveFilters } from '@/lib/product-filters';
import { cn } from '@/lib/utils';
import type { CategorySlug, Product, ProductFilters } from '@/types/product';
import { Switch } from '../../ui/Switch';
import { CheckboxRow } from './CheckboxRow';
import { FilterSection } from './FilterSection';
import { PriceRangeFilter } from './PriceRangeFilter';

interface FiltersPanelProps {
  products: Product[];
  filters: ProductFilters;
  onChange: (changes: Partial<ProductFilters>) => void;
  onClear: () => void;
  /** Hide the "Filters" title row (the mobile sheet has its own header). */
  hideHeader?: boolean;
}

const countBadge = (n: number) =>
  n > 0 ? (
    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-marigold-400 px-1.5 text-[11px] font-bold text-ink-900">
      {n}
    </span>
  ) : null;

/**
 * Category, type, price, rating and availability filters.
 * Counts show how many products each option returns given the other active filters.
 */
export const FiltersPanel = memo(function FiltersPanel({
  products,
  filters,
  onChange,
  onClear,
  hideHeader,
}: FiltersPanelProps) {
  const categoryCounts = useMemo(() => {
    const base = applyFilters(products, { ...filters, categories: [], sub: '' });
    const counts = {} as Record<CategorySlug, number>;
    base.forEach((p) => (counts[p.category] = (counts[p.category] ?? 0) + 1));
    return counts;
  }, [products, filters]);

  const subcategories = useMemo(() => {
    if (filters.categories.length !== 1) return [];
    const base = applyFilters(products, { ...filters, sub: '' });
    const counts = new Map<string, number>();
    base.forEach((p) => counts.set(p.subcategory, (counts.get(p.subcategory) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [products, filters]);

  const priceBounds = useMemo(() => {
    const prices = products.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const toggleCategory = (slug: CategorySlug) => {
    const next = filters.categories.includes(slug)
      ? filters.categories.filter((c) => c !== slug)
      : [...filters.categories, slug];
    onChange({ categories: next, sub: '' });
  };

  const active = countActiveFilters(filters);

  return (
    <div>
      {!hideHeader && (
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-sans text-base font-bold text-ink-900">
            <SlidersHorizontal className="size-4" /> Filters
            {countBadge(active)}
          </h2>
          {active > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-sm font-semibold text-ink-500 underline-offset-4 hover:text-ink-900 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      <FilterSection title="Category" badge={countBadge(filters.categories.length)}>
        <div className="space-y-0.5">
          {CATEGORIES.map((category) => (
            <CheckboxRow
              key={category.slug}
              label={category.label}
              count={categoryCounts[category.slug] ?? 0}
              checked={filters.categories.includes(category.slug)}
              onChange={() => toggleCategory(category.slug)}
            />
          ))}
        </div>
      </FilterSection>

      {subcategories.length > 1 && (
        <FilterSection title="Type">
          <div className="flex flex-wrap gap-2">
            {subcategories.map(([sub, count]) => {
              const selected = filters.sub === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange({ sub: selected ? '' : sub })}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ring-inset active:scale-95',
                    selected
                      ? 'bg-ink-800 text-white ring-ink-800'
                      : 'bg-white text-ink-600 ring-mist hover:ring-ink-300',
                  )}
                >
                  {sub} <span className={selected ? 'text-ink-200' : 'text-ink-400'}>{count}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Price">
        <PriceRangeFilter
          bounds={priceBounds}
          min={filters.minPrice}
          max={filters.maxPrice}
          onChange={onChange}
        />
      </FilterSection>

      <FilterSection title="Customer rating">
        <div className="grid grid-cols-3 gap-2">
          {RATING_FILTERS.map((rating) => {
            const selected = filters.minRating === rating;
            return (
              <button
                key={rating}
                type="button"
                aria-pressed={selected}
                aria-label={`${rating} stars and above`}
                onClick={() => onChange({ minRating: selected ? null : rating })}
                className={cn(
                  'flex items-center justify-center gap-1 rounded-xl py-2 text-sm font-semibold ring-1 transition ring-inset active:scale-95',
                  selected
                    ? 'bg-ink-800 text-white ring-ink-800'
                    : 'bg-white text-ink-700 ring-mist hover:ring-ink-300',
                )}
              >
                {rating}
                <Star
                  className={cn(
                    'size-3.5',
                    selected
                      ? 'fill-marigold-300 text-marigold-300'
                      : 'fill-marigold-400 text-marigold-400',
                  )}
                />
                <span className="text-xs font-medium opacity-70">& up</span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Availability">
        <Switch
          label="In stock only"
          description="Hide items that are sold out"
          checked={filters.inStockOnly}
          onChange={(inStockOnly) => onChange({ inStockOnly })}
        />
      </FilterSection>
    </div>
  );
});
