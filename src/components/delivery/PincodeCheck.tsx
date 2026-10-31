'use client';

import { useQuery } from '@tanstack/react-query';
import { CircleAlert, MapPin, Zap } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { COD_LIMIT, PRICING } from '@/constants';
import { useDeliveryDate } from '@/hooks/useDeliveryDate';
import { useHydrated } from '@/hooks/useHydrated';
import { isValidPincode } from '@/lib/delivery';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { pincodeQueries } from '@/services/queries/pincode.queries';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectDeliveryLocation, setDeliveryLocation } from '@/store/slices/location.slice';
import { Spinner } from '../ui/Spinner';

interface PincodeCheckProps {
  /** Order or item value, for the free-delivery and cash-on-delivery messages. */
  orderValue?: number;
  className?: string;
}

/**
 * Enter a pincode to see the exact delivery date and area name.
 * The pincode is remembered (Redux + localStorage) and shared by the product page and cart.
 */
export function PincodeCheck({ orderValue, className }: PincodeCheckProps) {
  const dispatch = useAppDispatch();
  const hydrated = useHydrated();
  const saved = useAppSelector(selectDeliveryLocation);
  const savedPincode = hydrated && saved.country === 'India' ? saved.pincode : '';

  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [error, setError] = useState<string>();
  const [editing, setEditing] = useState(false);

  // Show the remembered pincode once it is available (adjusting state during render, no effect).
  const [lastSaved, setLastSaved] = useState('');
  if (savedPincode !== lastSaved) {
    setLastSaved(savedPincode);
    if (savedPincode && !submitted) {
      setInput(savedPincode);
      setSubmitted(savedPincode);
    }
  }

  const { data: result, isFetching } = useQuery(pincodeQueries.check(submitted));
  const date = useDeliveryDate(result?.deliverable ? result.days : null);

  // Remember a deliverable pincode for next time (and for the cart / checkout).
  useEffect(() => {
    if (result?.deliverable && result.pincode !== saved.pincode) {
      dispatch(
        setDeliveryLocation({
          country: 'India',
          pincode: result.pincode,
          area: result.area ?? '',
          city: result.district ?? result.area ?? '',
        }),
      );
    }
  }, [result, saved.pincode, dispatch]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!isValidPincode(input)) {
      setError('Enter a valid 6-digit pincode');
      return;
    }
    setError(undefined);
    setSubmitted(input);
    setEditing(false);
  };

  const startEditing = () => {
    setEditing(true);
    setInput('');
  };

  const showForm = !result || editing || submitted !== result.pincode;
  const place = result ? [result.area, result.district].filter(Boolean).join(', ') : '';

  if (showForm) {
    return (
      <form onSubmit={submit} noValidate className={className}>
        <label htmlFor="pincode-input" className="text-sm font-medium text-ink-700">
          Check delivery date
        </label>
        <div
          className={cn(
            'mt-1.5 flex h-12 items-center rounded-xl bg-white pl-3 ring-1 ring-mist ring-inset focus-within:ring-2 focus-within:ring-ink-700',
            error && 'ring-rose-500',
          )}
        >
          <MapPin className="size-4 shrink-0 text-ink-400" />
          <input
            id="pincode-input"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            placeholder="Enter 6-digit pincode"
            value={input}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? 'pincode-error' : undefined}
            onChange={(e) => {
              setInput(e.target.value.replace(/\D/g, ''));
              setError(undefined);
            }}
            className="h-full min-w-0 flex-1 bg-transparent px-2 text-[15px] font-medium tracking-wider outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-ink-300"
          />
          <button
            type="submit"
            disabled={isFetching}
            className="mr-1 flex h-10 items-center gap-1.5 rounded-lg px-4 text-sm font-bold text-ink-800 transition hover:bg-ink-50 disabled:opacity-50"
          >
            {isFetching && <Spinner className="size-4" />}
            Check
          </button>
        </div>
        {error && (
          <p id="pincode-error" role="alert" className="mt-1.5 text-sm text-rose-600">
            {error}
          </p>
        )}
      </form>
    );
  }

  if (!result.deliverable) {
    return (
      <div className={cn('animate-fade-in', className)} role="alert">
        <p className="flex items-center gap-1.5 font-semibold text-rose-600">
          <CircleAlert className="size-4" /> We don’t deliver to {result.pincode} yet
        </p>
        <button
          type="button"
          onClick={startEditing}
          className="mt-1 text-sm font-semibold text-ink-700 underline underline-offset-2"
        >
          Try another pincode
        </button>
      </div>
    );
  }

  return (
    <div className={cn('animate-fade-in', className)} aria-live="polite">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-ink-900">
        {date ? `Delivery by ${date}` : `Delivery in ${result.days} days`}
        {result.zone === 'metro' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-leaf-50 px-2 py-0.5 text-xs font-bold text-leaf-600">
            <Zap className="size-3" fill="currentColor" /> {result.days}-day express
          </span>
        )}
      </p>
      <p className="mt-0.5 flex flex-wrap items-center gap-x-1 text-sm text-ink-500">
        <MapPin className="size-3.5" />
        {place ? `${place} ${result.pincode}` : result.pincode}
        <button
          type="button"
          onClick={startEditing}
          className="ml-1 font-semibold text-ink-700 underline underline-offset-2"
        >
          Change
        </button>
      </p>
      {orderValue != null && (
        <p className="mt-1 text-xs text-ink-500">
          {orderValue >= PRICING.freeDeliveryThreshold
            ? 'Free delivery'
            : `Free delivery over ${formatPrice(PRICING.freeDeliveryThreshold)}`}
          {orderValue <= COD_LIMIT ? ', cash on delivery available' : ', prepaid orders only'}
        </p>
      )}
    </div>
  );
}
