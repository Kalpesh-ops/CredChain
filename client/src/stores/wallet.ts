"use client";

import { create } from "zustand";
import {
  TransactionBuilder,
  Contract,
  rpc,
  scValToNative,
  xdr,
  Keypair,
  Operation,
  Asset,
  Account
} from "@stellar/stellar-sdk";
import type { WalletState, WalletName } from "@/types";
import { getNetworkConfig } from "@/lib/contracts";

interface WalletStore extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
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
  sendXlm: (recipient: string, amount: string) => Promise<string>;
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

  connect: async () => {
    try {
      set({ error: null });

      // Lazy import kit on the client side to avoid SSR errors
      const { StellarWalletsKit, Networks } = await import("@creit.tech/stellar-wallets-kit");
      const { FreighterModule } = await import("@creit.tech/stellar-wallets-kit/modules/freighter");
      const { xBullModule } = await import("@creit.tech/stellar-wallets-kit/modules/xbull");
      const { AlbedoModule } = await import("@creit.tech/stellar-wallets-kit/modules/albedo");

      StellarWalletsKit.init({
        network: NETWORK === "mainnet" ? Networks.PUBLIC : Networks.TESTNET,
        modules: [
          new FreighterModule(),
          new xBullModule(),
          new AlbedoModule(),
        ],
      });

      const result = await StellarWalletsKit.authModal();
      
      let walletId: WalletName = "freighter";
      try {
        const id = (StellarWalletsKit as unknown as { selectedModule?: { productId?: string } }).selectedModule?.productId;
        if (id === "freighter" || id === "albedo" || id === "xbull" || id === "rabet") {
          walletId = id;
        }
      } catch {}

      set({
        isConnected: true,
        address: result.address,
        walletName: walletId,
      });

      await get().fetchBalance();
    } catch (err: unknown) {
      const errObj = err as Record<string, unknown> | null | undefined;
      const errMsg = typeof errObj?.message === "string" ? errObj.message : "Failed to connect wallet";
      let message = errMsg;
      if (message.includes("closed") || message.includes("user closed") || errObj?.code === -1) {
        message = "Connection closed by user";
      } else if (message.includes("rejected") || message.includes("cancel") || message.includes("User rejected")) {
        message = "User rejected request";
      } else if (message.includes("not installed") || message.includes("not found") || message.includes("install")) {
        message = "Wallet not installed. Please install the browser extension.";
      }
      set({ error: message });
    }
  },

  disconnect: async () => {
    try {
      const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit");
      await StellarWalletsKit.disconnect();
    } catch {}

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
      const { address } = get();
      if (!address) return;

      const horizonUrl = NETWORK === "mainnet" 
        ? "https://horizon.stellar.org" 
        : "https://horizon-testnet.stellar.org";

      const res = await fetch(`${horizonUrl}/accounts/${address}`);
      if (res.ok) {
        const data = (await res.json()) as { balances: Array<{ asset_type: string; balance?: string }> };
        const nativeBalance = data.balances.find((b) => b.asset_type === "native")?.balance;
        if (nativeBalance) {
          set({ balance: nativeBalance });
          return;
        }
      }
      set({ balance: "0" });
    } catch {
      set({ balance: "0" });
    }
  },

  signAndSendTransaction: async (
    method: string,
    params: xdr.ScVal[],
    fee = "100"
  ) => {
    try {
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

      const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit");
      const signResult = await StellarWalletsKit.signTransaction(preparedTx.toXDR(), {
        address,
      });

      const signResultTyped = signResult as unknown as { signedTxXdr?: string; signedXDR?: string } | string;
      const signedXdr = typeof signResultTyped === "string" 
        ? signResultTyped 
        : signResultTyped.signedTxXdr || signResultTyped.signedXDR || "";
      const signedTx = TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
      const sendResponse = await server.sendTransaction(signedTx);

      if (sendResponse.status === "PENDING" || sendResponse.status === "DUPLICATE") {
        const { hash } = sendResponse;
        let pollCount = 0;
        while (pollCount < 30) {
          const getResponse = await server.getTransaction(hash);
          if (getResponse.status === rpc.Api.GetTransactionStatus.SUCCESS) {
            await get().fetchBalance();
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
    } catch (err: unknown) {
      const errorObj = err as Record<string, unknown> | null | undefined;
      const errMsg = typeof errorObj?.message === "string" ? errorObj.message : "Transaction failed";
      let message = errMsg;
      if (message.includes("op_underfunded") || message.includes("underfunded") || message.includes("insufficient_balance")) {
        message = "Insufficient balance. Please fund your account using Friendbot.";
      } else if (message.includes("rejected") || message.includes("cancel") || message.includes("User rejected")) {
        message = "User rejected request";
      }
      throw new Error(message);
    }
  },

  sendXlm: async (recipient: string, amount: string) => {
    try {
      const { address, networkPassphrase, rpcUrl } = get();
      if (!address) throw new Error("Wallet not connected");

      const server = new rpc.Server(rpcUrl);
      const account = await server.getAccount(address);

      const tx = new TransactionBuilder(account, {
        fee: "10000", // 0.01 XLM max fee
        networkPassphrase,
      })
        .addOperation(
          Operation.payment({
            destination: recipient,
            asset: Asset.native(),
            amount: amount,
          })
        )
        .setTimeout(30)
        .build();

      const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit");
      const signResult = await StellarWalletsKit.signTransaction(tx.toXDR(), {
        address,
      });

      const signResultTyped = signResult as unknown as { signedTxXdr?: string; signedXDR?: string } | string;
      const signedXdr = typeof signResultTyped === "string" 
        ? signResultTyped 
        : signResultTyped.signedTxXdr || signResultTyped.signedXDR || "";
      const signedTx = TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
      const sendResponse = await server.sendTransaction(signedTx);

      if (sendResponse.status === "PENDING" || sendResponse.status === "DUPLICATE") {
        const { hash } = sendResponse;
        let pollCount = 0;
        while (pollCount < 30) {
          const getResponse = await server.getTransaction(hash);
          if (getResponse.status === rpc.Api.GetTransactionStatus.SUCCESS) {
            await get().fetchBalance();
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
    } catch (err: unknown) {
      const errorObj = err as Record<string, unknown> | null | undefined;
      const errMsg = typeof errorObj?.message === "string" ? errorObj.message : "Transaction failed";
      let message = errMsg;
      if (message.includes("op_underfunded") || message.includes("underfunded") || message.includes("insufficient_balance")) {
        message = "Insufficient balance. Please fund your account using Friendbot.";
      } else if (message.includes("rejected") || message.includes("cancel") || message.includes("User rejected")) {
        message = "User rejected request";
      }
      throw new Error(message);
    }
  },

  readContract: async (method: string, params: xdr.ScVal[]) => {
    const { address, networkPassphrase, rpcUrl } = get();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) throw new Error("Contract address not configured");

    const server = new rpc.Server(rpcUrl);
    const contract = new Contract(contractAddress);

    const source = address
      ? await server.getAccount(address)
      : Keypair.random().publicKey();

    let account;
    try {
      account = typeof source === "string"
        ? await server.getAccount(source)
        : source;
    } catch {
      const randomKey = Keypair.random();
      account = {
        accountId: () => randomKey.publicKey(),
        sequenceNumber: () => "0",
        incrementSequenceNumber: () => {},
        balances: [],
        signers: [],
        thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
        flags: { auth_required: false, auth_revocable: false, auth_immutable: false, auth_clawback_enabled: false },
      } as unknown as Account;
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
