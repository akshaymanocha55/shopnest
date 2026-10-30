'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { REDIRECT_PARAM, ROUTES, TOAST } from '@/constants';
import { useAppDispatch } from '@/store/hooks';
import { startUserSession } from '@/store/thunks';
import type { User } from '@/types/auth';

/** Only allow same-site relative paths, to avoid open redirects. */
export function safeRedirect(target: string | null): string {
  return target && target.startsWith('/') && !target.startsWith('//') ? target : ROUTES.home;
}

/** After login/signup: start the session, finish any pending add-to-cart, then redirect. */
export function useAuthRedirect() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  return useCallback(
    async (user: User, message: string) => {
      const { addedPendingItem } = await dispatch(startUserSession(user)).unwrap();
      toast.success(message);
      if (addedPendingItem) toast.success(TOAST.addedToCart(addedPendingItem.slice(0, 40)));
      router.replace(safeRedirect(searchParams.get(REDIRECT_PARAM)));
    },
    [dispatch, router, searchParams],
  );
}
