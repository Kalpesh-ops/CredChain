"use client";

import { AlertTriangle } from "lucide-react";
import { useWalletStore } from "@/stores/wallet";

export function NetworkBanner() {
  const networkMismatch = useWalletStore((s) => s.networkMismatch);
  const network = useWalletStore((s) => s.network);

  if (!networkMismatch) return null;

  return (
    <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 print:hidden dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <span className="inline-flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        Your wallet is on a different network. Switch it to{" "}
        <span className="font-semibold">{network}</span> or transactions will
        fail.
      </span>
    </div>
  );
}
