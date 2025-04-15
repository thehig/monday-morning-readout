"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";
import { RouteGuard } from "@/components/RouteGuard";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouteGuard>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </RouteGuard>
      </AuthProvider>
    </QueryClientProvider>
  );
}
