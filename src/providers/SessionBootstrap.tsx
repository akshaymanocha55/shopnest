'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { ROUTES, TOAST } from '@/constants';
import { tokenManager } from '@/services/auth/token-manager';
import { useAppDispatch } from '@/store/hooks';
import { endUserSession, restoreSession } from '@/store/thunks';

/**
 * Runs once on app start: restores the user from encrypted cookies (refreshing the access
 * token if needed) and listens for "session expired" from the API layer.
 */
export function SessionBootstrap() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    void dispatch(restoreSession());

    return tokenManager.onSessionExpired(() => {
      void dispatch(endUserSession());
      toast.error(TOAST.sessionExpired);
      router.replace(ROUTES.login);
    });
  }, [dispatch, router]);

  return null;
}
