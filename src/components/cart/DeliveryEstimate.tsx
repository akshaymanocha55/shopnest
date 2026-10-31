'use client';

import { useQuery } from '@tanstack/react-query';
import { Globe2, MapPin, Truck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { PRICING, TOAST } from '@/constants';
import { useDeliveryDate } from '@/hooks/useDeliveryDate';
import { useHydrated } from '@/hooks/useHydrated';
import { cn } from '@/lib/utils';
import { locationQueries } from '@/services/queries/location.queries';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCartSummary } from '@/store/slices/cart.slice';
import { selectDeliveryLocation, setDeliveryLocation } from '@/store/slices/location.slice';
import { PincodeCheck } from '../delivery/PincodeCheck';
import { CountrySelect } from '../location/CountrySelect';
import { SuggestInput } from '../location/SuggestInput';
import { Button } from '../ui/Button';

type Mode = 'india' | 'international';

/** International delivery: country + city from the countries API. */
function InternationalDelivery() {
  const dispatch = useAppDispatch();
  const saved = useAppSelector(selectDeliveryLocation);
  const initial = saved.country !== 'India' ? saved : { country: 'United Arab Emirates', city: '' };
  const [draft, setDraft] = useState({ country: initial.country, city: initial.city });
  const [editing, setEditing] = useState(!(saved.country !== 'India' && saved.city));
  const { data: cities = [], isFetching } = useQuery(locationQueries.cities(draft.country));
  const date = useDeliveryDate(PRICING.internationalDeliveryDays);

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.city.trim()) return;
    dispatch(
      setDeliveryLocation({
        country: draft.country,
        city: draft.city.trim(),
        pincode: '',
        area: '',
      }),
    );
    setEditing(false);
    toast.success(TOAST.locationUpdated(`${draft.city.trim()}, ${draft.country}`));
  };

  if (!editing && saved.country !== 'India') {
    return (
      <div className="animate-fade-in">
        <p className="font-semibold text-ink-900">
          {date ? `Delivery by ${date}` : `Delivery in ${PRICING.internationalDeliveryDays} days`}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-500">
          <MapPin className="size-3.5" /> {saved.city}, {saved.country}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="ml-1 font-semibold text-ink-700 underline underline-offset-2"
          >
            Change
          </button>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={save}
      className="grid animate-fade-in grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
    >
      <CountrySelect
        label="Country"
        name="delivery-country"
        value={draft.country}
        onChange={(e) => setDraft({ country: e.target.value, city: '' })}
      />
      <SuggestInput
        label="City"
        name="delivery-city"
        placeholder="Start typing your city"
        value={draft.city}
        suggestions={cities}
        loading={isFetching}
        onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
      />
      <Button type="submit" className="h-12" disabled={!draft.city.trim()}>
        Check
      </Button>
    </form>
  );
}

/** Delivery estimate on the cart: pincode check for India, country + city for international. */
export function DeliveryEstimate() {
  const hydrated = useHydrated();
  const saved = useAppSelector(selectDeliveryLocation);
  const summary = useAppSelector(selectCartSummary);
  const [modeChoice, setMode] = useState<Mode | null>(null);
  const mode: Mode =
    modeChoice ?? (hydrated && saved.country !== 'India' ? 'international' : 'india');

  return (
    <div className="rounded-[var(--radius-card)] bg-white p-4 ring-1 ring-mist sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-semibold text-ink-900">
          <span className="grid size-9 place-items-center rounded-xl bg-leaf-50 text-leaf-600">
            <Truck className="size-4.5" />
          </span>
          Delivery
        </p>
        <div
          role="tablist"
          aria-label="Delivery destination"
          className="flex rounded-full bg-paper p-1 text-xs font-semibold"
        >
          {(
            [
              { id: 'india', label: 'India', icon: MapPin },
              { id: 'international', label: 'Outside India', icon: Globe2 },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mode === id}
              onClick={() => setMode(id)}
              className={cn(
                'flex items-center gap-1 rounded-full px-3 py-1.5 transition',
                mode === id ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800',
              )}
            >
              <Icon className="size-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        {mode === 'india' ? <PincodeCheck orderValue={summary.total} /> : <InternationalDelivery />}
      </div>
    </div>
  );
}
