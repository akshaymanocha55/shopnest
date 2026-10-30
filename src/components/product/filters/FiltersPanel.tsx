'use client';

import { Star } from 'lucide-react';
import { memo, useMemo } from 'react';
import { CATEGORIES, RATING_FILTERS } from '@/constants';
import { applyFilters } from '@/lib/product-filters';
import type { CategorySlug, Product, ProductFilters } from '@/types/product';
import { CheckboxRow } from './CheckboxRow';
import { FilterSection } from './FilterSection';
import { PriceFilter } from './PriceFilter';

interface FiltersPanelProps {
  products: Product[];
  filters: ProductFilters;
  onChange: (changes: Partial<ProductFilters>) => void;
}

/**
 * Category / sub-category / price / rating filters.
 * Counts show how many products each option would return given the other active filters.
 */
export const FiltersPanel = memo(function FiltersPanel({
  products,
  filters,
  onChange,
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

  const toggleCategory = (slug: CategorySlug) => {
    const next = filters.categories.includes(slug)
      ? filters.categories.filter((c) => c !== slug)
      : [...filters.categories, slug];
    onChange({ categories: next, sub: '' });
  };

  return (
    <div>
      <FilterSection title="Category">
        {CATEGORIES.map((category) => (
          <CheckboxRow
            key={category.slug}
            label={category.label}
            count={categoryCounts[category.slug] ?? 0}
            checked={filters.categories.includes(category.slug)}
            onChange={() => toggleCategory(category.slug)}
          />
        ))}
      </FilterSection>

      {subcategories.length > 1 && (
        <FilterSection title="Type">
          {subcategories.map(([sub, count]) => (
            <CheckboxRow
              key={sub}
              type="radio"
              name="subcategory"
              label={sub}
              count={count}
              checked={filters.sub === sub}
              onChange={() => onChange({ sub: filters.sub === sub ? '' : sub })}
            />
          ))}
        </FilterSection>
      )}

      <FilterSection title="Price">
        <PriceFilter min={filters.minPrice} max={filters.maxPrice} onChange={onChange} />
      </FilterSection>

      <FilterSection title="Customer rating">
        {RATING_FILTERS.map((rating) => (
          <CheckboxRow
            key={rating}
            type="radio"
            name="rating"
            label={`${rating}★ and above`}
            checked={filters.minRating === rating}
            onChange={() => onChange({ minRating: filters.minRating === rating ? null : rating })}
          />
        ))}
        <p className="mt-2 flex items-center gap-1 text-xs text-ink-400">
          <Star className="size-3" aria-hidden /> Based on verified buyer ratings
        </p>
      </FilterSection>
    </div>
  );
});
