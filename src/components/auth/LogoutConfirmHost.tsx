'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectLogoutConfirmOpen } from '@/store/slices/ui.slice';

const LogoutConfirmModal = dynamic(() => import('./LogoutConfirmModal'), { ssr: false });

/** Loads the logout dialog code only the first time it is needed. */
export function LogoutConfirmHost() {
  const open = useAppSelector(selectLogoutConfirmOpen);
  const [hasOpened, setHasOpened] = useState(false);
  if (open && !hasOpened) setHasOpened(true);
  return hasOpened ? <LogoutConfirmModal /> : null;
}
