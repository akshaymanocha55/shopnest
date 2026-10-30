import { useCallback, useEffect, useRef } from 'react';

/** Stable function that delays `callback` until calls stop for `delay` ms. Pending calls are cancelled on unmount. */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => cancel, [cancel]);

  return useCallback(
    (...args: Args) => {
      cancel();
      timerRef.current = setTimeout(() => callbackRef.current(...args), delay);
    },
    [cancel, delay],
  );
}
