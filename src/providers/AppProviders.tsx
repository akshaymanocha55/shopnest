'use client';

import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { QueryProvider } from './QueryProvider';
import { SessionBootstrap } from './SessionBootstrap';
import { StoreProvider } from './StoreProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <QueryProvider>
        <SessionBootstrap />
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          duration={3500}
          toastOptions={{ className: 'font-sans rounded-2xl!' }}
        />
      </QueryProvider>
    </StoreProvider>
  );
}
