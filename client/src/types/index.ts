export interface Institution {
  name: string;
  verified: boolean;
  cert_count: number;
}

export interface Certificate {
  id: number;
  issuer: string;
  recipient: string;
  metadata_uri: string;
  issued_at: number;
  revoked: boolean;
}

export interface ActivityEvent {
  type: "institution_registered" | "certificate_issued" | "certificate_revoked";
  timestamp: number;
  txHash: string;
  data: Record<string, unknown>;
}

export interface TransactionStatus {
  hash: string;
  status: "pending" | "success" | "failed";
  message: string;
  explorerUrl: string;
}

export type WalletName = "freighter" | "albedo" | "xbull" | "rabet";

export interface WalletInfo {
  address: string;
  network: string;
  networkPassphrase: string;
  rpcUrl: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  network: string;
  networkPassphrase: string;
  rpcUrl: string;
  walletName: WalletName | null;
  balance: string;
  error: string | null;
}
