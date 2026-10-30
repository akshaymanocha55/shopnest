'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/utils';
import { locationQueries } from '@/services/queries/location.queries';

interface CountrySelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  ref?: Ref<HTMLSelectElement>;
}

/** Country dropdown populated from the countries API (cached for a day). */
export function CountrySelect({
  label,
  error,
  id,
  className,
  ref,
  value,
  ...props
}: CountrySelectProps) {
  const { data: countries = [], isPending } = useQuery(locationQueries.countries());
  const selectId = id ?? props.name ?? 'country';
  // Keep the current value selectable while the list is still loading.
  const current = typeof value === 'string' ? value : undefined;
  const options =
    current && !countries.some((c) => c.name === current)
      ? [{ name: current, iso2: '' }, ...countries]
      : countries;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={selectId} className="text-sm font-medium text-ink-700">
        {label}
      </label>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          value={value}
          aria-invalid={Boolean(error) || undefined}
          aria-busy={isPending || undefined}
          className={cn(
            'h-12 w-full cursor-pointer appearance-none rounded-xl bg-white px-4 pr-10 text-[15px] ring-1 ring-mist outline-none ring-inset focus:ring-2 focus:ring-ink-700',
            error && 'ring-rose-500',
          )}
          {...props}
        >
          {options.length === 0 && <option value="">Loading countries…</option>}
          {options.map((country) => (
            <option key={country.name} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-400" />
      </div>
      {error && (
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
