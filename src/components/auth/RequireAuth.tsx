'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { REDIRECT_PARAM, ROUTES } from '@/constants';
import { useHydrated } from '@/hooks/useHydrated';
import { useAppSelector } from '@/store/hooks';
import { selectAuthStatus } from '@/store/slices/auth.slice';

/**
 * Client-side guard for protected pages. The proxy already redirects guests on navigation;
 * this covers the client side (e.g. the session expiring while the page is open).
 */
export function RequireAuth({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const hydrated = useHydrated();
  const status = useAppSelector(selectAuthStatus);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'guest') {
      router.replace(`${ROUTES.login}?${REDIRECT_PARAM}=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  return hydrated && status === 'authenticated' ? children : fallback;
}
