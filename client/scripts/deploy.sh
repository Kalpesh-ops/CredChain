#!/usr/bin/env bash
set -euo pipefail

echo "=== CredChain Deployment Script ==="
echo ""

# Configuration
NETWORK="${NETWORK:-testnet}"
RPC_URL="${RPC_URL:-https://soroban-testnet.stellar.org}"
NETWORK_PASSPHRASE="${NETWORK_PASSPHRASE:-"Test SDF Network ; September 2015"}"
SOURCE_ACCOUNT="${SOURCE_ACCOUNT:-dev}"
WASM_PATH="${WASM_PATH:-../contract/target/wasm32v1-none/release/credchain.wasm}"

echo "Network: $NETWORK"
echo "RPC URL: $RPC_URL"
echo "Source Account: $SOURCE_ACCOUNT"
echo "WASM Path: $WASM_PATH"
echo ""

# 1. Generate or use existing key
echo "[1/4] Checking source account..."
stellar keys generate "$SOURCE_ACCOUNT" --network "$NETWORK" --fund 2>/dev/null || true
echo "Account ready."

# 2. Build the contract
echo "[2/4] Building contract..."
cd "$(dirname "$0")/../../contract"
stellar contract build
echo "Build complete."

# 3. Deploy the contract
echo "[3/4] Deploying contract..."
DEPLOY_OUTPUT=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  2>&1)

CONTRACT_ID=$(echo "$DEPLOY_OUTPUT" | tail -1 | tr -d '[:space:]')
echo "Contract deployed at: $CONTRACT_ID"

# 4. Generate TypeScript bindings
echo "[4/4] Generating TypeScript bindings..."
cd "$(dirname "$0")/../client"
stellar contract bindings typescript \
  --contract-id "$CONTRACT_ID" \
  --output-dir packages/contract \
  --network "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  --overwrite

echo ""
echo "=== Deployment Complete ==="
echo "Contract ID: $CONTRACT_ID"
echo ""
echo "Add this to your .env file:"
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ID"
