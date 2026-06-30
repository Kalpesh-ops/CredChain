"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, Activity, Home, ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn, truncateAddress } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useWalletStore } from "@/stores/wallet";
import { useActivityStore } from "@/stores/activity";
import { WalletModal } from "@/components/WalletModal";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: Wallet },
  { href: "/app", label: "App", icon: ShieldCheck },
  { href: "/activity", label: "Activity", icon: Activity },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const { isConnected, address, connect, disconnect, error, clearError } =
    useWalletStore();
  const syncStatus = useActivityStore((s) => s.syncStatus);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            <span>CredChain</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Event Sync status indicator */}
            <div className="flex items-center gap-1.5 mr-2">
              <span className={cn(
                "h-2 w-2 rounded-full",
                syncStatus === "connected" && "bg-green-500 animate-pulse",
                syncStatus === "syncing" && "bg-blue-500 animate-pulse",
                syncStatus === "error" && "bg-red-500 animate-bounce"
              )} />
              <span className="hidden text-[10px] font-medium text-zinc-500 sm:inline">
                {syncStatus === "connected" && "Event Sync"}
                {syncStatus === "syncing" && "Syncing..."}
                {syncStatus === "error" && "Sync Error"}
              </span>
            </div>

            {isConnected && address ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWalletOpen(true)}
                className="gap-2"
              >
                <Wallet className="h-4 w-4" />
                {truncateAddress(address)}
              </Button>
            ) : (
              <Button size="sm" onClick={() => setWalletOpen(true)}>
                Connect Wallet
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="border-t border-zinc-200 px-4 pb-4 pt-2 dark:border-zinc-700 sm:hidden">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                >
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      isActive && "bg-zinc-100 dark:bg-zinc-800"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <WalletModal
        open={walletOpen}
        onOpenChange={(open) => {
          setWalletOpen(open);
          if (!open) clearError();
        }}
        onConnect={async () => {
          setWalletOpen(false);
          await connect();
          const currentError = useWalletStore.getState().error;
          if (currentError && currentError !== "Connection closed by user") {
            setWalletOpen(true);
          }
        }}
        onDisconnect={disconnect}
        isConnected={isConnected}
        address={address}
        error={error}
      />
    </>
  );
}
