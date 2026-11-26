'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { lookupCacheTimeMs, lookupStaleTimeMs } from '@/lib/constants';

export function AppQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: lookupStaleTimeMs,
        gcTime: lookupCacheTimeMs,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
