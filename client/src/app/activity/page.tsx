"use client";

import { Activity, ExternalLink, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ActivityFeed } from "@/components/ActivityFeed";
import { useActivityStore } from "@/stores/activity";
import { useWalletStore } from "@/stores/wallet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getExplorerUrl, formatTimestamp } from "@/lib/utils";
import { fetchAccountOperations } from "@/lib/activity-history";

export default function ActivityPage() {
  const { events, clearEvents } = useActivityStore();
  const { isConnected, address, network } = useWalletStore();

  const horizonUrl =
    network === "mainnet"
      ? "https://horizon.stellar.org"
      : "https://horizon-testnet.stellar.org";

  const historyQuery = useQuery({
    queryKey: ["accountOperations", address],
    queryFn: () => fetchAccountOperations(horizonUrl, address!),
    enabled: !!address,
  });
  const operations = historyQuery.data ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Activity Feed
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Real-time events and transaction history from CredChain
          </p>
        </div>
        {events.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearEvents}>
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contract Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-blue-600" />
              Contract Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed />
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-green-600" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 dark:text-zinc-400">
                <Activity className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm font-medium">Wallet not connected</p>
                <p className="text-xs mt-1">
                  Connect a wallet to see its full account history
                </p>
              </div>
            ) : historyQuery.isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500 dark:text-zinc-400">
                <Loader2 className="h-12 w-12 mb-4 animate-spin opacity-50" />
                <p className="text-sm font-medium">Loading account history…</p>
              </div>
            ) : historyQuery.error ? (
              <div className="py-12 text-center text-sm text-red-600 dark:text-red-400">
                Could not reach Horizon for this account&apos;s history.
              </div>
            ) : operations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500 dark:text-zinc-400">
                <Activity className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm font-medium">No transactions yet</p>
                <p className="text-xs mt-1">
                  This account has never been used
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {operations.map((op) => (
                  <div
                    key={op.id}
                    className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Badge
                        variant={op.successful ? "success" : "destructive"}
                        className="text-[10px]"
                      >
                        {op.successful ? "success" : "failed"}
                      </Badge>
                      <span className="text-[10px] text-zinc-400">
                        {formatTimestamp(op.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 mb-1">
                      {op.summary}
                    </p>
                    <p className="truncate text-[10px] font-mono text-zinc-400 mb-1">
                      {op.txHash}
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-[10px]"
                      onClick={() =>
                        window.open(getExplorerUrl("tx", op.txHash), "_blank")
                      }
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View on Explorer
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
