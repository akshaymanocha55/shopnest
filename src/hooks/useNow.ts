import { useSyncExternalStore } from 'react';

const MINUTE = 60_000;

function subscribe(onChange: () => void) {
  const timer = setInterval(onChange, MINUTE);
  return () => clearInterval(timer);
}

// Rounded to the minute so the snapshot is stable between renders.
const snapshot = () => Math.floor(Date.now() / MINUTE) * MINUTE;

/** Current time (ms), updated every minute. Returns 0 on the server. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, snapshot, () => 0);
}
