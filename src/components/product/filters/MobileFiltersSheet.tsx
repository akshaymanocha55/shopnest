'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';
import type { Product, ProductFilters } from '@/types/product';
import { Button } from '../../ui/Button';
import { FiltersPanel } from './FiltersPanel';

interface MobileFiltersSheetProps {
  products: Product[];
  filters: ProductFilters;
  resultCount: number;
  onChange: (changes: Partial<ProductFilters>) => void;
  onClear: () => void;
  onClose: () => void;
}

/** Bottom sheet for filters on small screens. Loaded with next/dynamic when first opened. */
export default function MobileFiltersSheet({
  products,
  filters,
  resultCount,
  onChange,
  onClear,
  onClose,
}: MobileFiltersSheetProps) {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Filters"
    >
      <button
        type="button"
        aria-label="Close filters"
        className="absolute inset-0 animate-fade-in bg-ink-900/50"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] animate-[rise_0.4s_var(--ease-out-expo)_both] flex-col rounded-t-[1.75rem] bg-white">
        <div className="flex items-center justify-between border-b border-mist px-5 py-4">
          <span className="font-display text-lg font-bold">Filters</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="grid size-10 place-items-center rounded-full hover:bg-ink-50"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <FiltersPanel
            products={products}
            filters={filters}
            onChange={onChange}
            onClear={onClear}
            hideHeader
          />
        </div>
        <div className="flex gap-3 border-t border-mist p-4">
          <Button variant="secondary" onClick={onClear} className="flex-1">
            Clear all
          </Button>
          <Button onClick={onClose} className="flex-[2]">
            Show {resultCount} {resultCount === 1 ? 'product' : 'products'}
          </Button>
        </div>
      </div>
    </div>
  );
}
