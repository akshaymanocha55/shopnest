'use client';

import { X } from 'lucide-react';
import { memo } from 'react';
import { CATEGORY_BY_SLUG } from '@/constants';
import { formatPrice } from '@/lib/format';
import { countActiveFilters } from '@/lib/product-filters';
import type { ProductFilters } from '@/types/product';

interface ActiveFiltersProps {
  filters: ProductFilters;
  onChange: (changes: Partial<ProductFilters>) => void;
  onClear: () => void;
}

function priceLabel(min: number | null, max: number | null) {
  if (min != null && max != null) return `${formatPrice(min)} – ${formatPrice(max)}`;
  if (min != null) return `Over ${formatPrice(min)}`;
  return `Under ${formatPrice(max!)}`;
}

/** Removable chips for each active filter, plus "Clear all". */
export const ActiveFilters = memo(function ActiveFilters({
  filters,
  onChange,
  onClear,
}: ActiveFiltersProps) {
  if (countActiveFilters(filters) === 0 && !filters.q) return null;

  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (filters.q)
    chips.push({ key: 'q', label: `“${filters.q}”`, remove: () => onChange({ q: '' }) });
  filters.categories.forEach((slug) =>
    chips.push({
      key: slug,
      label: CATEGORY_BY_SLUG[slug].label,
      remove: () => onChange({ categories: filters.categories.filter((c) => c !== slug), sub: '' }),
    }),
  );
  if (filters.sub)
    chips.push({ key: 'sub', label: filters.sub, remove: () => onChange({ sub: '' }) });
  if (filters.minPrice != null || filters.maxPrice != null)
    chips.push({
      key: 'price',
      label: priceLabel(filters.minPrice, filters.maxPrice),
      remove: () => onChange({ minPrice: null, maxPrice: null }),
    });
  if (filters.inStockOnly)
    chips.push({
      key: 'stock',
      label: 'In stock only',
      remove: () => onChange({ inStockOnly: false }),
    });
  if (filters.minRating != null)
    chips.push({
      key: 'rating',
      label: `${filters.minRating}★ & above`,
      remove: () => onChange({ minRating: null }),
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          aria-label={`Remove filter ${chip.label}`}
          className="inline-flex h-8 animate-pop-in items-center gap-1.5 rounded-full bg-ink-800 pr-2 pl-3 text-sm font-medium text-white transition hover:bg-ink-700 active:scale-95"
        >
          {chip.label}
          <X className="size-3.5" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="px-2 text-sm font-semibold text-ink-600 underline-offset-4 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
});
