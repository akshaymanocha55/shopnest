'use client';

import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { CACHE } from '@/constants';
import { getErrorMessage, isApiError } from '@/lib/errors';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: CACHE.productsStaleTime,
        gcTime: CACHE.productsGcTime,
        refetchOnWindowFocus: false,
        // Do not retry 4xx errors; retry network/5xx twice.
        retry: (count, error) =>
          count < 2 && !(isApiError(error) && error.status >= 400 && error.status < 500),
      },
    },
    // Any mutation without its own onError still tells the user what went wrong.
    mutationCache: new MutationCache({
      onError: (error, _vars, _ctx, mutation) => {
        if (!mutation.options.onError) toast.error(getErrorMessage(error));
      },
    }),
  });
}

let browserClient: QueryClient | undefined;

function getQueryClient() {
  // New client per server render; one shared client in the browser (keeps the cache).
  if (typeof window === 'undefined') return createQueryClient();
  browserClient ??= createQueryClient();
  return browserClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
