import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * false on the server and while React is hydrating, true afterwards.
 *
 * Components that read browser-only state (saved session, wishlist, reviews) use this so
 * their first render matches the server HTML. This matters for content inside <Suspense>:
 * it can hydrate after the session was restored, which would otherwise cause a mismatch.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
