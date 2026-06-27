"use client";

import { create } from "zustand";
import {
  isConnected,
  getAddress,
  signTransaction,
} from "@stellar/freighter-api";
import {
  TransactionBuilder,
  Contract,
  rpc,
  scValToNative,
  xdr,
  Keypair,
} from "@stellar/stellar-sdk";
import type { WalletState } from "@/types";
import { getNetworkConfig } from "@/lib/contracts";

interface WalletStore extends WalletState {
  connect: (walletName: string) => Promise<void>;
  disconnect: () => void;
  fetchBalance: () => Promise<void>;
  signAndSendTransaction: (
    method: string,
    params: xdr.ScVal[],
    fee?: string
  ) => Promise<string>;
  readContract: (
    method: string,
    params: xdr.ScVal[]
  ) => Promise<unknown>;
  clearError: () => void;
}

const NETWORK = (process.env.NEXT_PUBLIC_STELLAR_NETWORK as "testnet" | "mainnet") || "testnet";
const config = getNetworkConfig(NETWORK);

export const useWalletStore = create<WalletStore>((set, get) => ({
  isConnected: false,
  address: null,
  network: NETWORK,
  networkPassphrase: config.networkPassphrase,
  rpcUrl: config.rpcUrl,
  walletName: null,
  balance: "0",
  error: null,

  connect: async (walletName: string) => {
    try {
      set({ error: null });

      const connected = await isConnected();
      if (!connected) {
        set({ error: "Freighter wallet not found. Please install the Freighter browser extension." });
        return;
      }

      const { address } = await getAddress();
      if (!address) {
        set({ error: "Could not get wallet address. Please unlock Freighter and try again." });
        return;
      }

      set({
        isConnected: true,
        address,
        walletName: walletName as WalletStore["walletName"],
      });

      await get().fetchBalance();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect wallet";
      set({ error: message });
    }
  },

  disconnect: () => {
    set({
      isConnected: false,
      address: null,
      walletName: null,
      balance: "0",
      error: null,
    });
  },

  fetchBalance: async () => {
    try {
      const { address, rpcUrl } = get();
      if (!address) return;

      const server = new rpc.Server(rpcUrl);
      const acct = await server.getAccount(address);
      if (acct) {
        set({ balance: "100" }); // placeholder - real balance would come from Horizon
      }
    } catch {
      // silently fail balance fetch
    }
  },

  signAndSendTransaction: async (
    method: string,
    params: xdr.ScVal[],
    fee = "100"
  ) => {
    const { address, networkPassphrase, rpcUrl } = get();
    if (!address) throw new Error("Wallet not connected");

    const server = new rpc.Server(rpcUrl);
    const account = await server.getAccount(address);

    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) throw new Error("Contract address not configured");

    const contract = new Contract(contractAddress);

    const tx = new TransactionBuilder(account, {
      fee,
      networkPassphrase,
    })
      .addOperation(contract.call(method, ...params))
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) {
      throw new Error(`Simulation failed: ${sim.error}`);
    }

    const preparedTx = rpc.assembleTransaction(tx, sim).build();

    const signedResult = await signTransaction(preparedTx.toXDR(), {
      networkPassphrase,
      address,
    });

    if (signedResult.error) {
      throw new Error(`User rejected transaction: ${signedResult.error.message || signedResult.error}`);
    }

    const signedTx = TransactionBuilder.fromXDR(signedResult.signedTxXdr, networkPassphrase);
    const sendResponse = await server.sendTransaction(signedTx);

    if (sendResponse.status === "PENDING" || sendResponse.status === "DUPLICATE") {
      const { hash } = sendResponse;
      let pollCount = 0;
      while (pollCount < 30) {
        const getResponse = await server.getTransaction(hash);
        if (getResponse.status === rpc.Api.GetTransactionStatus.SUCCESS) {
          return hash;
        }
        if (getResponse.status === rpc.Api.GetTransactionStatus.FAILED) {
          throw new Error(`Transaction failed: ${hash}`);
        }
        await new Promise((r) => setTimeout(r, 1000));
        pollCount++;
      }
      throw new Error("Transaction timeout");
    }

    throw new Error(`Failed to send transaction: ${sendResponse.status}`);
  },

  readContract: async (method: string, params: xdr.ScVal[]) => {
    const { address, networkPassphrase, rpcUrl } = get();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) throw new Error("Contract address not configured");

    const server = new rpc.Server(rpcUrl);
    const contract = new Contract(contractAddress);

    // For read-only calls, we use a dummy account
    const source = address
      ? await server.getAccount(address)
      : Keypair.random().publicKey();

    // For simulations, we need the account
    let account;
    try {
      account = typeof source === "string"
        ? await server.getAccount(source)
        : source;
    } catch {
      // If account doesn't exist, use a random one
      const randomKey = Keypair.random();
      account = {
        accountId: () => randomKey.publicKey(),
        sequenceNumber: () => "0",
        incrementSequenceNumber: () => {},
        balances: [],
        signers: [],
        thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
        flags: { auth_required: false, auth_revocable: false, auth_immutable: false, auth_clawback_enabled: false },
      } as any;
    }

    const tx = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase,
    })
      .addOperation(contract.call(method, ...params))
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) {
      throw new Error(`Simulation failed: ${sim.error}`);
    }

    if (sim.result) {
      return scValToNative(sim.result.retval);
    }
    return null;
  },

  clearError: () => set({ error: null }),
}));
