"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Wallet, LogOut, Copy, ExternalLink, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn, truncateAddress, getExplorerUrl } from "@/lib/utils";

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (walletName: string) => Promise<void>;
  onDisconnect: () => void;
  isConnected: boolean;
  address: string | null;
  error: string | null;
}

const walletOptions = [
  { id: "freighter", name: "Freighter", description: "Browser extension wallet" },
];

export function WalletModal({
  open,
  onOpenChange,
  onConnect,
  onDisconnect,
  isConnected,
  address,
  error,
}: WalletModalProps) {
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = async (name: string) => {
    setConnecting(true);
    try {
      await onConnect(name);
    } finally {
      setConnecting(false);
    }
  };

  const handleCopy = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold">
              {isConnected ? "Wallet" : "Connect Wallet"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
              {error}
            </div>
          )}

          {isConnected && address ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  Connected Address
                </div>
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-blue-600" />
                  <span className="font-mono text-sm">{truncateAddress(address, 8)}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(getExplorerUrl("account", address), "_blank")
                    }
                  >
                    <ExternalLink className="h-3 w-3" />
                    Explorer
                  </Button>
                </div>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={onDisconnect}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {walletOptions.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet.id)}
                  disabled={connecting}
                  className={cn(
                    "w-full rounded-lg border border-zinc-200 p-4 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800",
                    connecting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="font-medium">{wallet.name}</div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {wallet.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
