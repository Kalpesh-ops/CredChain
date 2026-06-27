export const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as string;

export const NETWORK_CONFIG = {
  testnet: {
    rpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase: "Test SDF Network ; September 2015",
  },
  mainnet: {
    rpcUrl: "https://soroban.stellar.org",
    networkPassphrase: "Public Global Stellar Network ; September 2015",
  },
} as const;

export function getNetworkConfig(network: "testnet" | "mainnet" = "testnet") {
  return NETWORK_CONFIG[network];
}
