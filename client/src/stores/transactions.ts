import { create } from "zustand";
import type { TransactionStatus } from "@/types";
import { getExplorerUrl } from "@/lib/utils";

interface TransactionStore {
  transactions: TransactionStatus[];
  addTransaction: (tx: Omit<TransactionStatus, "explorerUrl">) => void;
  updateTransaction: (
    hash: string,
    updates: Partial<TransactionStatus>
  ) => void;
  removeTransaction: (hash: string) => void;
  clearCompleted: () => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],

  addTransaction: (tx) =>
    set((state) => ({
      transactions: [
        {
          ...tx,
          explorerUrl: getExplorerUrl("tx", tx.hash, "testnet"),
        },
        ...state.transactions,
      ].slice(0, 50), // keep last 50
    })),

  updateTransaction: (hash, updates) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.hash === hash ? { ...tx, ...updates } : tx
      ),
    })),

  removeTransaction: (hash) =>
    set((state) => ({
      transactions: state.transactions.filter((tx) => tx.hash !== hash),
    })),

  clearCompleted: () =>
    set((state) => ({
      transactions: state.transactions.filter(
        (tx) => tx.status === "pending"
      ),
    })),
}));
