"use client";

import { RefreshCw, Activity } from "lucide-react";
import { ActivityFeed } from "@/components/ActivityFeed";
import { useActivityStore } from "@/stores/activity";
import { useTransactionStore } from "@/stores/transactions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getExplorerUrl, formatTimestamp } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export default function ActivityPage() {
  const { events, clearEvents } = useActivityStore();
  const { transactions } = useTransactionStore();

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
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500 dark:text-zinc-400">
                <Activity className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm font-medium">No transactions yet</p>
                <p className="text-xs mt-1">
                  Transaction history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.hash}
                    className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge
                        variant={
                          tx.status === "success"
                            ? "success"
                            : tx.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 mb-1">
                      {tx.message}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-400 mb-1">
                      {tx.hash === "pending" ? "Pending..." : tx.hash}
                    </p>
                    {tx.status !== "pending" && tx.hash !== "pending" && tx.hash !== "failed" && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-[10px]"
                        onClick={() =>
                          window.open(
                            getExplorerUrl("tx", tx.hash),
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View on Explorer
                      </Button>
                    )}
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
