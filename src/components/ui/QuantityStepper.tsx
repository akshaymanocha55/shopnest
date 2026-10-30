'use client';

import { Minus, Plus } from 'lucide-react';
import { memo } from 'react';
import { cn } from '@/lib/utils';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md';
  label?: string;
}

export const QuantityStepper = memo(function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  size = 'md',
  label = 'Quantity',
}: QuantityStepperProps) {
  const btn = cn(
    'grid place-items-center rounded-full text-ink-700 transition active:scale-90 enabled:hover:bg-ink-50 disabled:opacity-30',
    size === 'sm' ? 'size-8' : 'size-10',
  );

  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded-full bg-white p-0.5 ring-1 ring-mist ring-inset"
    >
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" />
      </button>
      <output
        aria-live="polite"
        className={cn(
          'text-center font-semibold tabular-nums',
          size === 'sm' ? 'w-7 text-sm' : 'w-9',
        )}
      >
        {value}
      </output>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
});
