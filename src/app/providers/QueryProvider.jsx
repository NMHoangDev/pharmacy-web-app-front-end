import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export const QueryProvider = ({ children }) => {
  // Ensure a single QueryClient instance for the app lifetime.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            staleTime: FIVE_MINUTES_MS,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default QueryProvider;
