'use client';

import { memo, useState } from 'react';
import { PRICE_PRESETS, TIMING } from '@/constants';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { CheckboxRow } from './CheckboxRow';

interface PriceFilterProps {
  min: number | null;
  max: number | null;
  onChange: (range: { minPrice: number | null; maxPrice: number | null }) => void;
}

const parse = (value: string) => (value.trim() === '' ? null : Math.max(0, Number(value) || 0));

/** Preset ranges plus custom min/max inputs. Typing is debounced before the URL updates. */
export const PriceFilter = memo(function PriceFilter({ min, max, onChange }: PriceFilterProps) {
  const [draft, setDraft] = useState({ min: min?.toString() ?? '', max: max?.toString() ?? '' });
  const [synced, setSynced] = useState({ min, max });

  // Keep inputs in sync when filters change from outside (presets, "Clear all", back button).
  if (synced.min !== min || synced.max !== max) {
    setSynced({ min, max });
    setDraft({ min: min?.toString() ?? '', max: max?.toString() ?? '' });
  }

  const commit = useDebouncedCallback((next: { min: string; max: string }) => {
    onChange({ minPrice: parse(next.min), maxPrice: parse(next.max) });
  }, TIMING.priceFilterDebounceMs);

  const update = (key: 'min' | 'max', value: string) => {
    const next = { ...draft, [key]: value.replace(/\D/g, '') };
    setDraft(next);
    commit(next);
  };

  return (
    <div className="space-y-1">
      {PRICE_PRESETS.map((preset) => {
        const active = preset.min === min && preset.max === max;
        return (
          <CheckboxRow
            key={preset.label}
            type="radio"
            name="price-preset"
            label={preset.label}
            checked={active}
            onChange={() =>
              onChange(
                active
                  ? { minPrice: null, maxPrice: null }
                  : { minPrice: preset.min, maxPrice: preset.max },
              )
            }
          />
        );
      })}
      <div className="flex items-center gap-2 pt-3">
        {(['min', 'max'] as const).map((key, i) => (
          <label
            key={key}
            className="flex h-10 flex-1 items-center rounded-xl bg-white px-3 ring-1 ring-mist ring-inset focus-within:ring-2 focus-within:ring-ink-700"
          >
            <span className="text-sm text-ink-400">₹</span>
            <input
              inputMode="numeric"
              aria-label={key === 'min' ? 'Minimum price' : 'Maximum price'}
              placeholder={i === 0 ? 'Min' : 'Max'}
              value={draft[key]}
              onChange={(e) => update(key, e.target.value)}
              className="w-full min-w-0 bg-transparent pl-1 text-sm outline-none placeholder:text-ink-300"
            />
          </label>
        ))}
      </div>
    </div>
  );
});
