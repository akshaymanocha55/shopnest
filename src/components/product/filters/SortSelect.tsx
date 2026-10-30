'use client';

import { ChevronDown } from 'lucide-react';
import { memo } from 'react';
import { SORT_OPTIONS } from '@/constants';
import type { SortOption } from '@/types/product';

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export const SortSelect = memo(function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className="relative inline-flex h-10 items-center rounded-full bg-white pr-9 pl-4 text-sm ring-1 ring-mist ring-inset focus-within:ring-2 focus-within:ring-ink-700">
      <span className="text-ink-400">Sort:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="cursor-pointer appearance-none bg-transparent pl-1.5 font-semibold text-ink-800 outline-none"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 size-4 text-ink-500"
        aria-hidden
      />
    </label>
  );
});
