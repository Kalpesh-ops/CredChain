#!/usr/bin/env bash
set -euo pipefail

echo "=== CredChain Deployment Script ==="
echo ""

# Resolve paths once, absolutely. The script cd's between the contract and client
# directories below, so anything derived from a relative $0 would break after the
# first cd.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLIENT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CONTRACT_DIR="$(cd "$CLIENT_DIR/../contract" && pwd)"

# Configuration
NETWORK="${NETWORK:-testnet}"
RPC_URL="${RPC_URL:-https://soroban-testnet.stellar.org}"
NETWORK_PASSPHRASE="${NETWORK_PASSPHRASE:-"Test SDF Network ; September 2015"}"
SOURCE_ACCOUNT="${SOURCE_ACCOUNT:-dev}"
WASM_PATH="${WASM_PATH:-$CONTRACT_DIR/target/wasm32v1-none/release/credchain.wasm}"

echo "Network: $NETWORK"
echo "RPC URL: $RPC_URL"
echo "Source Account: $SOURCE_ACCOUNT"
echo "WASM Path: $WASM_PATH"
echo ""

# 1. Generate or use existing key
echo "[1/4] Checking source account..."
if ! stellar keys address "$SOURCE_ACCOUNT" >/dev/null 2>&1; then
  echo "Key '$SOURCE_ACCOUNT' not found, generating and funding it..."
  stellar keys generate "$SOURCE_ACCOUNT" --network "$NETWORK" --fund
fi
# The admin does not have to be the deploying key. Set ADMIN_ADDRESS to bind a
# wallet you control in the browser (Freighter etc.), so configure_fees and
# transfer_admin can be called without the CLI keystore. Defaults to the deployer.
ADMIN_ADDRESS="${ADMIN_ADDRESS:-$(stellar keys address "$SOURCE_ACCOUNT")}"

if ! printf '%s' "$ADMIN_ADDRESS" | grep -Eq '^G[A-Z2-7]{55}$'; then
  echo "ERROR: ADMIN_ADDRESS is not a valid Stellar public key: $ADMIN_ADDRESS" >&2
  exit 1
fi

echo "Account ready."
echo "Deployer: $(stellar keys address "$SOURCE_ACCOUNT")"
echo "Admin will be bound to: $ADMIN_ADDRESS"

# 2. Build the contract
echo "[2/4] Building contract..."
cd "$CONTRACT_DIR"
stellar contract build
echo "Build complete."

# 3. Deploy the contract
# The trailing `-- --admin` passes the constructor argument, binding the admin at
# deploy time. Without it the Admin slot would be left unset and claimable by anyone.
echo "[3/4] Deploying contract..."
DEPLOY_OUTPUT=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- \
  --admin "$ADMIN_ADDRESS" \
  2>&1)

CONTRACT_ID=$(echo "$DEPLOY_OUTPUT" | tail -1 | tr -d '[:space:]')

# Fail loudly rather than carrying a garbage ID into the bindings step and the .env
# hint at the end. A Soroban contract ID is 56 base32 characters starting with C.
if ! printf '%s' "$CONTRACT_ID" | grep -Eq '^C[A-Z2-7]{55}$'; then
  echo "ERROR: deploy did not return a valid contract ID." >&2
  echo "Full output was:" >&2
  echo "$DEPLOY_OUTPUT" >&2
  exit 1
fi
echo "Contract deployed at: $CONTRACT_ID"

# 4. Generate TypeScript bindings
echo "[4/4] Generating TypeScript bindings..."
cd "$CLIENT_DIR"
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
