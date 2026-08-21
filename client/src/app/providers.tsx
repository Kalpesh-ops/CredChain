"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { NetworkBanner } from "@/components/NetworkBanner";
import { RememberWalletPrompt } from "@/components/RememberWalletPrompt";
import { useWalletStore } from "@/stores/wallet";
import { Toaster } from "@/components/ui/toaster";
import { TransactionTracker } from "@/components/TransactionTracker";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useContractEventsListener } from "@/hooks/useContractEventsListener";

function EventListener() {
  useContractEventsListener();
  return null;
}

function WalletSessionRestore() {
  const restoreSession = useWalletStore((s) => s.restoreSession);
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);
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
      <WalletSessionRestore />
      <Navbar />
      <NetworkBanner />
      <main className="flex flex-1 flex-col">{children}</main>
      <div className="fixed bottom-4 left-4 z-50">
        <ThemeToggle />
      </div>
      <RememberWalletPrompt />
      <Toaster />
      <TransactionTracker />
    </QueryClientProvider>
  );
}
