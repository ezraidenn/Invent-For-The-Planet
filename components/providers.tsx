"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import * as Ably from "ably";
import { AblyProvider } from "ably/react";
import { useState, useMemo } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const ablyClient = useMemo(
    () =>
      typeof window !== "undefined"
        ? new Ably.Realtime({
            authUrl: "/api/ably/auth",
            authMethod: "GET",
          })
        : (null as any),
    []
  );

  const inner = (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
        }}
      />
    </ThemeProvider>
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {ablyClient ? (
          <AblyProvider client={ablyClient}>{inner}</AblyProvider>
        ) : (
          inner
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
}
