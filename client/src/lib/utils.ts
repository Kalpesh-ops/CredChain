import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, chars = 6): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString();
}

export function getExplorerUrl(
  type: "tx" | "account" | "contract",
  hash: string,
  network: string = "testnet"
): string {
  const base =
    network === "testnet"
      ? "https://stellar.expert/explorer/testnet"
      : "https://stellar.expert/explorer/public";
  switch (type) {
    case "tx":
      return `${base}/tx/${hash}`;
    case "account":
      return `${base}/account/${hash}`;
    case "contract":
      return `${base}/contract/${hash}`;
  }
}
