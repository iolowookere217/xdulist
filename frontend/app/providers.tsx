"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Always render a GoogleOAuthProvider so client hooks like `useGoogleLogin`
  // can safely consume the context during CSR. If `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
  // is not set, pass an empty string to avoid build-time errors; the
  // provider will simply not initialize the Google script.
  return (
    <GoogleOAuthProvider clientId={googleClientId ?? ""}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
