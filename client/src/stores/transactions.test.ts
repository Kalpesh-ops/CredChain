import { describe, expect, it, beforeEach } from "vitest";
import { useTransactionStore } from "./transactions";

describe("useTransactionStore", () => {
  beforeEach(() => {
    useTransactionStore.setState({ transactions: [] });
  });

  it("starts with empty transactions", () => {
    expect(useTransactionStore.getState().transactions).toEqual([]);
  });

  it("adds transaction with explorerUrl", () => {
    const tx = {
      hash: "my_tx_hash",
      status: "pending" as const,
      message: "Sending XLM",
    };
    useTransactionStore.getState().addTransaction(tx);
    const list = useTransactionStore.getState().transactions;
    expect(list.length).toBe(1);
    expect(list[0].hash).toBe("my_tx_hash");
    expect(list[0].explorerUrl).toContain("stellar.expert/explorer/testnet/tx/my_tx_hash");
  });

  it("updates transaction by hash", () => {
    const store = useTransactionStore.getState();
    store.addTransaction({
      hash: "tx_to_update",
      status: "pending",
      message: "Processing",
    });
    
    useTransactionStore.getState().updateTransaction("tx_to_update", {
      status: "success",
      message: "Completed successfully",
    });

    const list = useTransactionStore.getState().transactions;
    expect(list[0].status).toBe("success");
    expect(list[0].message).toBe("Completed successfully");
  });

  it("removes transaction by hash", () => {
    const store = useTransactionStore.getState();
    store.addTransaction({
      hash: "tx1",
      status: "success",
      message: "Tx1",
    });
    store.addTransaction({
      hash: "tx2",
      status: "pending",
      message: "Tx2",
    });

    useTransactionStore.getState().removeTransaction("tx1");
    const list = useTransactionStore.getState().transactions;
    expect(list.length).toBe(1);
    expect(list[0].hash).toBe("tx2");
  });

  it("clears completed transactions, leaving pending", () => {
    const store = useTransactionStore.getState();
    store.addTransaction({
      hash: "tx_pending",
      status: "pending",
      message: "Processing",
    });
    store.addTransaction({
      hash: "tx_success",
      status: "success",
      message: "Success",
    });
    store.addTransaction({
      hash: "tx_failed",
      status: "failed",
      message: "Failed",
    });

    useTransactionStore.getState().clearCompleted();
    const list = useTransactionStore.getState().transactions;
    expect(list.length).toBe(1);
    expect(list[0].hash).toBe("tx_pending");
  });
});
