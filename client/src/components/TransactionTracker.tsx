"use client";

import { ExternalLink, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useTransactionStore } from "@/stores/transactions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getExplorerUrl } from "@/lib/utils";

export function TransactionTracker() {
  const { transactions } = useTransactionStore();

  if (transactions.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <div className="p-3">
        <h3 className="text-sm font-semibold mb-2">Transactions</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {transactions.map((tx) => (
            <div
              key={tx.hash}
              className="rounded-lg border border-zinc-100 bg-zinc-50 p-2 text-xs dark:border-zinc-800 dark:bg-zinc-800/50"
            >
              <div className="flex items-center gap-2 mb-1">
                {tx.status === "pending" && (
                  <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
                )}
                {tx.status === "success" && (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                )}
                {tx.status === "failed" && (
                  <XCircle className="h-3 w-3 text-red-500" />
                )}
                <Badge
                  variant={
                    tx.status === "success"
                      ? "success"
                      : tx.status === "failed"
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-[10px] px-1.5 py-0"
                >
                  {tx.status}
                </Badge>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">
                {tx.message}
              </p>
              {tx.status !== "pending" && tx.hash !== "pending" && tx.hash !== "failed" && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-[10px]"
                  onClick={() => window.open(tx.explorerUrl, "_blank")}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View on Explorer
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
