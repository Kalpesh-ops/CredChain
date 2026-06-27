"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { TransactionTracker } from "@/components/TransactionTracker";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useContractEventsListener } from "@/hooks/useContractEventsListener";

function EventListener() {
  useContractEventsListener();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchInterval: 30_000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <EventListener />
      <Navbar />
      <main className="flex flex-1 flex-col">{children}</main>
      <div className="fixed bottom-4 left-4 z-50">
        <ThemeToggle />
      </div>
      <Toaster />
      <TransactionTracker />
    </QueryClientProvider>
  );
}
