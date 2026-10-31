import { useSyncExternalStore } from 'react';
import { addDays } from '@/lib/delivery';
import { formatDay } from '@/lib/format';

const subscribe = () => () => {};

/** "Mon, 2 Nov" for today + n days. Client-only (the server returns null) to avoid hydration mismatches. */
export function useDeliveryDate(days: number | null): string | null {
  return useSyncExternalStore(
    subscribe,
    () => (days == null ? null : formatDay(addDays(new Date(), days).toISOString())),
    () => null,
  );
}
