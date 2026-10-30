'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectLoginPromptOpen } from '@/store/slices/ui.slice';

const LoginPromptModal = dynamic(() => import('./LoginPromptModal'), { ssr: false });

/** Downloads the login popup code only the first time a guest needs it. */
export function LoginPromptHost() {
  const open = useAppSelector(selectLoginPromptOpen);
  const [hasOpened, setHasOpened] = useState(false);
  if (open && !hasOpened) setHasOpened(true);
  return hasOpened ? <LoginPromptModal /> : null;
}
