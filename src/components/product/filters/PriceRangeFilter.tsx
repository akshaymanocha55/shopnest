'use client';

import { memo, useState } from 'react';
import { PRICE_PRESETS, TIMING } from '@/constants';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

interface PriceRangeFilterProps {
  /** Cheapest and most expensive product in the catalogue. */
  bounds: { min: number; max: number };
  min: number | null;
  max: number | null;
  onChange: (range: { minPrice: number | null; maxPrice: number | null }) => void;
}

const STEP = 100;

/** Dual-handle range slider + quick preset chips. Dragging is debounced before the URL updates. */
export const PriceRangeFilter = memo(function PriceRangeFilter({
  bounds,
  min,
  max,
  onChange,
}: PriceRangeFilterProps) {
  const floor = Math.floor(bounds.min / STEP) * STEP;
  const ceil = Math.ceil(bounds.max / STEP) * STEP;
  const [draft, setDraft] = useState({ low: min ?? floor, high: max ?? ceil });
  const [synced, setSynced] = useState({ min, max, floor, ceil });

  // Follow outside changes (presets, "Clear all", back button) without an effect.
  if (synced.min !== min || synced.max !== max || synced.floor !== floor || synced.ceil !== ceil) {
    setSynced({ min, max, floor, ceil });
    setDraft({ low: min ?? floor, high: max ?? ceil });
  }

  const commit = useDebouncedCallback((low: number, high: number) => {
    onChange({ minPrice: low <= floor ? null : low, maxPrice: high >= ceil ? null : high });
  }, TIMING.priceFilterDebounceMs);

  const update = (low: number, high: number) => {
    setDraft({ low, high });
    commit(low, high);
  };

  const pct = (value: number) => ((value - floor) / (ceil - floor || 1)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="rounded-lg bg-paper px-2.5 py-1 font-semibold text-ink-800 tabular-nums">
          {formatPrice(draft.low)}
        </span>
        <span className="text-ink-300">to</span>
        <span className="rounded-lg bg-paper px-2.5 py-1 font-semibold text-ink-800 tabular-nums">
          {formatPrice(draft.high)}
          {draft.high >= ceil && '+'}
        </span>
      </div>

      <div className="relative mt-4 h-6">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-mist" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink-800"
          style={{ left: `${pct(draft.low)}%`, right: `${100 - pct(draft.high)}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={floor}
          max={ceil}
          step={STEP}
          value={draft.low}
          onChange={(e) => update(Math.min(Number(e.target.value), draft.high - STEP), draft.high)}
          className="range-thumb absolute inset-0 h-6 w-full"
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={floor}
          max={ceil}
          step={STEP}
          value={draft.high}
          onChange={(e) => update(draft.low, Math.max(Number(e.target.value), draft.low + STEP))}
          className="range-thumb absolute inset-0 h-6 w-full"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRICE_PRESETS.map((preset) => {
          const active = preset.min === min && preset.max === max;
          return (
            <button
              key={preset.label}
              type="button"
              aria-pressed={active}
              onClick={() =>
                onChange(
                  active
                    ? { minPrice: null, maxPrice: null }
                    : { minPrice: preset.min, maxPrice: preset.max },
                )
              }
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ring-inset active:scale-95',
                active
                  ? 'bg-ink-800 text-white ring-ink-800'
                  : 'bg-white text-ink-600 ring-mist hover:ring-ink-300',
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});
