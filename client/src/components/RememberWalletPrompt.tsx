"use client";

import { Clock, X } from "lucide-react";
import { useWalletStore } from "@/stores/wallet";
import { Button } from "@/components/ui/button";
import { REMEMBER_OPTIONS } from "@/lib/wallet-session";

export function RememberWalletPrompt() {
  const awaiting = useWalletStore((s) => s.awaitingRememberChoice);
  const rememberSession = useWalletStore((s) => s.rememberSession);

  if (!awaiting) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-zinc-200 bg-white p-4 shadow-lg print:hidden dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4 text-blue-600" />
          Stay signed in?
        </h2>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Do not remember this wallet"
          onClick={() => rememberSession("session")}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
        Skip reconnecting on every reload. Only your public address is stored —
        never your keys, and signing still needs your wallet.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {REMEMBER_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={option.value === "session" ? "outline" : "secondary"}
            size="sm"
            onClick={() => rememberSession(option.value)}
          >
            {option.value === "session" ? "This session" : option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
