'use client';

import { useQuery } from '@tanstack/react-query';
import { MapPin, Truck } from 'lucide-react';
import { useState, useSyncExternalStore, type FormEvent } from 'react';
import { toast } from 'sonner';
import { PRICING, TOAST } from '@/constants';
import { formatDay } from '@/lib/format';
import { locationQueries } from '@/services/queries/location.queries';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectDeliveryLocation, setDeliveryLocation } from '@/store/slices/location.slice';
import { CountrySelect } from '../location/CountrySelect';
import { SuggestInput } from '../location/SuggestInput';
import { Button } from '../ui/Button';

const noop = () => () => {};

/** "Today + n days", computed on the client only to avoid hydration mismatches. */
function useDeliveryDate(days: number) {
  return useSyncExternalStore(
    noop,
    () => {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return formatDay(date.toISOString());
    },
    () => null,
  );
}

/** Delivery location picker (countries + cities from the API) and delivery date. */
export function DeliveryEstimate() {
  const dispatch = useAppDispatch();
  const location = useAppSelector(selectDeliveryLocation);
  // null = not chosen by the user yet: show the form until a city is saved.
  const [editingChoice, setEditing] = useState<boolean | null>(null);
  const editing = editingChoice ?? !location.city;
  const [draft, setDraft] = useState(location);
  const { data: cities = [], isFetching } = useQuery(locationQueries.cities(draft.country));

  const domestic = location.country === 'India';
  const days = domestic ? PRICING.deliveryDays : PRICING.internationalDeliveryDays;
  const date = useDeliveryDate(days);

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.city.trim()) return;
    const next = { country: draft.country, city: draft.city.trim() };
    dispatch(setDeliveryLocation(next));
    setEditing(false);
    toast.success(TOAST.locationUpdated(`${next.city}, ${next.country}`));
  };

  return (
    <div className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-mist">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-leaf-50 text-leaf-600">
          <Truck className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink-900">
            {date ? `Delivered by ${date}` : `Delivered in ${days} days`}
            <span className="ml-2 rounded-full bg-leaf-50 px-2 py-0.5 text-xs font-semibold text-leaf-600">
              {days}-day delivery
            </span>
          </p>
          {location.city && !editing ? (
            <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-500">
              <MapPin className="size-3.5" /> {location.city}, {location.country}
              <button
                type="button"
                onClick={() => {
                  setDraft(location);
                  setEditing(true);
                }}
                className="ml-1 font-semibold text-ink-700 underline underline-offset-2"
              >
                Change
              </button>
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-ink-500">Choose where you want this delivered.</p>
          )}
        </div>
      </div>

      {editing && (
        <form
          onSubmit={save}
          className="mt-4 grid animate-fade-in gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
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
      )}
    </div>
  );
}
