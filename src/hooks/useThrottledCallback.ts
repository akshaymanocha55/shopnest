import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a stable function that runs `callback` at most once per `wait` ms
 * (leading + trailing call). The latest callback is always used, so the returned
 * function never needs to change identity.
 */
export function useThrottledCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  wait: number,
): (...args: Args) => void {
  const callbackRef = useRef(callback);
  const lastRunRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Args | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return useCallback(
    (...args: Args) => {
      const now = Date.now();
      const remaining = wait - (now - lastRunRef.current);
      lastArgsRef.current = args;

      if (remaining <= 0) {
        lastRunRef.current = now;
        callbackRef.current(...args);
        return;
      }
      if (!timerRef.current) {
        timerRef.current = setTimeout(() => {
          lastRunRef.current = Date.now();
          timerRef.current = null;
          if (lastArgsRef.current) callbackRef.current(...lastArgsRef.current);
        }, remaining);
      }
    },
    [wait],
  );
}
