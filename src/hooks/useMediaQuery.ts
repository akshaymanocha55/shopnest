import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribes to a CSS media query. useSyncExternalStore avoids tearing and
 * hydration mismatches (the server snapshot is `serverDefault`).
 */
export function useMediaQuery(query: string, serverDefault = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverDefault,
  );
}
